# 🚀 BESS v2.0 API - VPSデプロイガイド

## 📋 前提条件

- ✅ Supabaseでv2.0スキーマ実行済み
- ✅ .envファイル作成済み
- ✅ テストデータ投入済み
- ✅ VPSアクセス情報（IP: 153.121.61.164）
- ✅ ドメイン設定済み（api.ps-system.jp）

---

## 🎯 デプロイ手順

### ステップ1：ローカルでコミット＆プッシュ

まず、v2.0のコードをGitHubにプッシュします。

```powershell
cd bess-site-survey-system

# 変更をコミット
git add .
git commit -m "Add v2.0 API with normalized schema"
git push origin main
```

---

### ステップ2：VPSにSSH接続

```powershell
ssh ubuntu@153.121.61.164
```

---

### ステップ3：プロジェクトを更新

```bash
cd /home/ubuntu/bess-site-survey-system

# 最新コードを取得
git pull origin main

# 依存関係を更新
npm install

# ビルド
npm run build
```

---

### ステップ4：本番環境変数を設定

```bash
# .env.productionファイルを編集
nano .env.production
```

以下の内容を貼り付け：

```bash
# ============================================================================
# BESS Site Survey System v2.0 - Production Environment
# ============================================================================

# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Supabase Configuration
SUPABASE_URL=https://kcohexmvbccxixyfvjyw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUxODQwMSwiZXhwIjoyMDc1MDk0NDAxfQ.CSUPZBrUNadTwxi3pmCorovhSmf8uogbrkpyQowj0N0

# Database Direct Connection
DATABASE_URL=postgresql://postgres.kcohexmvbccxixyfvjyw:katsumi0536@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres

# API Configuration
API_VERSION=v2.0
API_BASE_URL=https://api.ps-system.jp/api

# CORS Configuration (Vercelデプロイ後に更新)
CORS_ORIGIN=*

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# External APIs
GOOGLE_MAPS_API_KEY=
OSM_API_URL=https://nominatim.openstreetmap.org
GSI_API_URL=https://cyberjapandata.gsi.go.jp

# n8n Workflow
N8N_WEBHOOK_URL=
N8N_API_KEY=
```

保存：`Ctrl+O` → `Enter` → `Ctrl+X`

---

### ステップ5：PM2でアプリケーション再起動

```bash
# 既存のプロセスを停止
pm2 stop bess-api

# 新しいバージョンを起動
pm2 start ecosystem.config.js --env production

# 保存
pm2 save

# 状態確認
pm2 status
pm2 logs bess-api --lines 50
```

---

### ステップ6：動作確認

#### v1.0 APIの確認
```bash
curl http://localhost:3000/api/v1/health
```

#### v2.0 APIの確認
```bash
curl http://localhost:3000/api/v2/health
```

期待される結果：
```json
{
  "success": true,
  "version": "2.0",
  "timestamp": "2025-10-05T...",
  "message": "BESS Site Survey System v2.0 API is running"
}
```

#### v2.0サイト一覧の確認
```bash
curl http://localhost:3000/api/v2/sites
```

期待される結果：3件のサイトデータ

---

### ステップ7：外部からの動作確認

ローカルPCから：

```powershell
# ヘルスチェック
curl https://api.ps-system.jp/api/v2/health

# サイト一覧
curl https://api.ps-system.jp/api/v2/sites
```

---

## 🔧 トラブルシューティング

### エラー: "Cannot find module"

```bash
cd /home/ubuntu/bess-site-survey-system
npm install
npm run build
pm2 restart bess-api
```

### エラー: "Database connection failed"

```bash
# 環境変数を確認
cat .env.production | grep DATABASE_URL

# Supabase接続テスト
psql "postgresql://postgres.kcohexmvbccxixyfvjyw:katsumi0536@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" -c "SELECT 1;"
```

### ログ確認

```bash
# PM2ログ
pm2 logs bess-api

# Nginxログ
tail -f /var/log/nginx/bess-api.error.log

# アプリケーションログ
tail -f /home/ubuntu/bess-site-survey-system/logs/app.log
```

---

## 📊 v2.0 APIエンドポイント一覧

### ヘルスチェック
```
GET /api/v2/health
```

### サイト管理
```
GET    /api/v2/sites              # サイト一覧
GET    /api/v2/sites/:id          # サイト詳細
POST   /api/v2/sites              # サイト作成
PUT    /api/v2/sites/:id          # サイト更新
DELETE /api/v2/sites/:id          # サイト削除
```

### 監査ログ
```
GET /api/v2/sites/:id/audit-log   # 監査ログ取得
```

### スコア履歴
```
GET /api/v2/sites/:id/scores      # スコア履歴取得
```

### Grid Info更新
```
PUT /api/v2/sites/:id/grid-info   # Grid Info更新
```

### Geo Risk更新
```
PUT /api/v2/sites/:id/geo-risk    # Geo Risk更新
```

### CSVインポート
```
POST /api/v2/import/csv           # CSVインポート
GET  /api/v2/import/template      # CSVテンプレート
```

---

## 🎯 次のステップ

1. ✅ VPSにv2.0 APIをデプロイ ← 今ここ
2. 🔄 フロントエンドをv2.0 APIに接続
3. 🚀 Vercelにフロントエンドをデプロイ
4. 🧪 エンドツーエンドテスト

---

## 📝 メモ

- v1.0 APIは `/api/v1/*` で引き続き利用可能
- v2.0 APIは `/api/v2/*` で新規提供
- 両方のバージョンが同時に動作します
