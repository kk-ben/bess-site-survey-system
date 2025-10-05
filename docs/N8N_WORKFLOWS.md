# 🔄 n8nワークフローガイド

## 概要

BESS Site Survey System v2.0では、n8nを使用してデータの自動取得・更新を行います。

---

## 📋 ワークフロー一覧

| ワークフロー名 | 目的 | トリガー | 頻度 |
|--------------|------|---------|------|
| 初期データ取得 | インポート直後の自動データ取得 | Webhook | 即時 |
| 電力空き容量更新 | PDF/CSVから空き容量抽出 | Cron | 四半期 |
| OSMデータ更新 | 道路・施設データ更新 | Cron | 月次 |
| 地価データ更新 | 公示地価の更新 | Cron | 年次 |
| スコア再計算 | 全サイトのスコア再計算 | Manual | 手動 |
| データ鮮度チェック | 古いデータの検出・通知 | Cron | 週次 |

---

## 🚀 ワークフロー詳細

### 1. 初期データ取得ワークフロー

**トリガー**: Webhook（CSVインポート完了時）

```json
{
  "name": "初期データ取得",
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "site-import",
        "method": "POST"
      }
    },
    {
      "name": "サイト情報取得",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT id, lat, lon FROM sites WHERE id = '{{$json.site_id}}'"
      }
    },
    {
      "name": "Google Elevation API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://maps.googleapis.com/maps/api/elevation/json",
        "qs": {
          "locations": "{{$json.lat}},{{$json.lon}}",
          "key": "{{$credentials.googleMapsApiKey}}"
        }
      }
    },
    {
      "name": "標高データ保存",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "geo_risk",
        "columns": "site_id,elevation_m,automation_level,updated_from_source_at",
        "values": "{{$json.site_id}},{{$json.elevation}},AUTO,NOW()"
      }
    },
    {
      "name": "国土地理院ハザード",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{{$json.zoom}}/{{$json.tileX}}/{{$json.tileY}}.png"
      }
    },
    {
      "name": "浸水深解析",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// PNG解析して浸水深を判定\nconst depth = analyzeFloodDepth($input.all());\nreturn { flood_depth_class: depth };"
      }
    },
    {
      "name": "OSM道路データ",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://overpass-api.de/api/interpreter",
        "body": "[out:json];way(around:100,{{$json.lat}},{{$json.lon}})[\"highway\"];out tags;"
      }
    },
    {
      "name": "automation_sources記録",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "automation_sources",
        "columns": "site_id,table_name,field_name,source_type,source_name,last_refreshed_at",
        "values": "{{$json.site_id}},geo_risk,elevation_m,API,Google Elevation API,NOW()"
      }
    },
    {
      "name": "スコア計算トリガー",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.ps-system.jp/api/v1/scores/calculate",
        "method": "POST",
        "body": {
          "site_id": "{{$json.site_id}}"
        }
      }
    }
  ]
}
```

---

### 2. 電力空き容量更新ワークフロー

**トリガー**: Cron（四半期ごと）

```json
{
  "name": "電力空き容量更新",
  "nodes": [
    {
      "name": "Cron",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "triggerTimes": {
          "item": [
            {
              "mode": "everyMonth",
              "monthsInterval": 3,
              "dayOfMonth": 1,
              "hour": 2,
              "minute": 0
            }
          ]
        }
      }
    },
    {
      "name": "電力会社サイトチェック",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://www.chuden.co.jp/corporate/publicity/pub_release/press/",
        "method": "GET"
      }
    },
    {
      "name": "最新PDF検出",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// HTMLから最新の空き容量PDFのURLを抽出\nconst html = $input.first().json.body;\nconst pdfUrl = extractLatestCapacityPDF(html);\nreturn { pdfUrl };"
      }
    },
    {
      "name": "PDFダウンロード",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "{{$json.pdfUrl}}",
        "method": "GET",
        "responseFormat": "file"
      }
    },
    {
      "name": "PDF→テキスト変換",
      "type": "n8n-nodes-base.executeCommand",
      "parameters": {
        "command": "pdftotext {{$json.filePath}} -"
      }
    },
    {
      "name": "空き容量抽出",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": `
          const text = $input.first().json.stdout;
          const pattern = /(\\d+kV)\\s+(\\d+\\.?\\d*)\\s*MW/g;
          const matches = [...text.matchAll(pattern)];
          
          return matches.map(m => ({
            voltage_kv: parseInt(m[1]),
            capacity_available_mw: parseFloat(m[2]),
            source_url: $('PDFダウンロード').first().json.pdfUrl
          }));
        `
      }
    },
    {
      "name": "変電所マッチング",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT id, site_id FROM grid_info WHERE target_voltage_kv = {{$json.voltage_kv}}"
      }
    },
    {
      "name": "空き容量更新",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "update",
        "table": "grid_info",
        "updateKey": "id",
        "columns": "capacity_available_mw,automation_level,updated_from_source_at",
        "values": "{{$json.capacity_available_mw}},SEMI,NOW()"
      }
    },
    {
      "name": "レビュー通知",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "toEmail": "admin@ps-system.jp",
        "subject": "空き容量データ更新 - レビュー必要",
        "text": "{{$json.count}}件の空き容量データが更新されました。レビューをお願いします。"
      }
    }
  ]
}
```

---

### 3. OSMデータ更新ワークフロー

**トリガー**: Cron（月次）

```json
{
  "name": "OSMデータ更新",
  "nodes": [
    {
      "name": "Cron",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "triggerTimes": {
          "item": [
            {
              "mode": "everyMonth",
              "dayOfMonth": 1,
              "hour": 3,
              "minute": 0
            }
          ]
        }
      }
    },
    {
      "name": "更新対象サイト取得",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "executeQuery",
        "query": `
          SELECT s.id, s.lat, s.lon
          FROM sites s
          JOIN automation_sources a ON a.site_id = s.id
          WHERE a.table_name = 'access_physical'
            AND a.field_name = 'nearest_road_width_m'
            AND a.refresh_interval_hours IS NOT NULL
            AND (NOW() - a.last_refreshed_at) > INTERVAL '1 month'
        `
      }
    },
    {
      "name": "Overpass API",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "method": "POST",
        "url": "https://overpass-api.de/api/interpreter",
        "body": "[out:json];way(around:100,{{$json.lat}},{{$json.lon}})[\"highway\"];out tags;"
      }
    },
    {
      "name": "道路幅員解析",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": `
          const roads = $input.first().json.elements;
          if (roads.length === 0) return { width: null };
          
          const nearestRoad = roads[0];
          const width = nearestRoad.tags.width || estimateWidthFromType(nearestRoad.tags.highway);
          
          return { 
            width: parseFloat(width),
            road_type: nearestRoad.tags.highway
          };
        `
      }
    },
    {
      "name": "道路データ更新",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "update",
        "table": "access_physical",
        "updateKey": "site_id",
        "columns": "nearest_road_width_m,automation_level,updated_from_source_at",
        "values": "{{$json.width}},SEMI,NOW()"
      }
    },
    {
      "name": "automation_sources更新",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "update",
        "table": "automation_sources",
        "updateKey": "site_id,table_name,field_name",
        "columns": "last_refreshed_at",
        "values": "NOW()"
      }
    }
  ]
}
```

---

### 4. データ鮮度チェックワークフロー

**トリガー**: Cron（週次）

```json
{
  "name": "データ鮮度チェック",
  "nodes": [
    {
      "name": "Cron",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "triggerTimes": {
          "item": [
            {
              "mode": "everyWeek",
              "weekday": 1,
              "hour": 9,
              "minute": 0
            }
          ]
        }
      }
    },
    {
      "name": "古いデータ検出",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "executeQuery",
        "query": `
          SELECT 
            s.site_code,
            a.table_name,
            a.field_name,
            a.last_refreshed_at,
            a.refresh_interval_hours,
            EXTRACT(EPOCH FROM (NOW() - a.last_refreshed_at)) / 3600 AS hours_since_update
          FROM automation_sources a
          JOIN sites s ON s.id = a.site_id
          WHERE a.refresh_interval_hours IS NOT NULL
            AND (NOW() - a.last_refreshed_at) > (a.refresh_interval_hours || ' hours')::INTERVAL
          ORDER BY hours_since_update DESC
        `
      }
    },
    {
      "name": "通知メール作成",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": `
          const staleData = $input.all();
          const message = staleData.map(d => 
            \`- \${d.json.site_code}: \${d.json.table_name}.\${d.json.field_name} (最終更新: \${d.json.hours_since_update}時間前)\`
          ).join('\\n');
          
          return {
            subject: \`データ鮮度アラート: \${staleData.length}件の古いデータ\`,
            body: \`以下のデータが更新期限を過ぎています:\\n\\n\${message}\`
          };
        `
      }
    },
    {
      "name": "通知送信",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "toEmail": "admin@ps-system.jp",
        "subject": "{{$json.subject}}",
        "text": "{{$json.body}}"
      }
    }
  ]
}
```

---

## 🔧 セットアップ

### n8nインストール（VPS）

```bash
# Docker Composeでn8nをインストール
cd /var/www
mkdir n8n
cd n8n

cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-secure-password
      - N8N_HOST=n8n.ps-system.jp
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://n8n.ps-system.jp/
    volumes:
      - ./data:/home/node/.n8n
      - ./files:/files
EOF

docker-compose up -d
```

### Nginx設定

```nginx
# /etc/nginx/sites-available/n8n
server {
    listen 80;
    server_name n8n.ps-system.jp;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL証明書

```bash
certbot --nginx -d n8n.ps-system.jp
```

---

## 📝 ワークフローのインポート

1. n8n管理画面にアクセス: `https://n8n.ps-system.jp`
2. 「Workflows」→「Import from File」
3. 上記のJSONファイルをインポート
4. 認証情報を設定（Google Maps API Key、PostgreSQL接続情報等）
5. 「Activate」をクリック

---

## 🔗 関連ドキュメント

- [データベーススキーマ](../database/SCHEMA_DESIGN_V2.md)
- [自動化ロジック](./AUTOMATION_LOGIC.md)
- [スコア計算式](./SCORING_FORMULA.md)
- [n8n公式ドキュメント](https://docs.n8n.io/)
