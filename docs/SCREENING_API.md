# スクリーニング・エクスポートAPI

BESS用地調査システムのスクリーニングおよびエクスポート機能のAPIドキュメント

## 概要

スクリーニングAPIは、評価済みの候補地を様々な条件でフィルタリングし、結果をCSVやGeoJSON形式でエクスポートする機能を提供します。

## エンドポイント

### 1. サイトスクリーニング

評価済みの候補地を条件に基づいてフィルタリングします。

**エンドポイント:** `POST /api/v1/screening/screen`

**認証:** 必要

**リクエストボディ:**

```json
{
  "minGridScore": 80,
  "minSetbackScore": 70,
  "minRoadScore": 60,
  "minPoleScore": 70,
  "minTotalScore": 75,
  "minWeightedScore": 80,
  "recommendations": ["excellent", "good"],
  "excludeViolations": true
}
```

**パラメータ:**

- `minGridScore` (number, optional): 系統接続スコアの最小値
- `minSetbackScore` (number, optional): 離隔距離スコアの最小値
- `minRoadScore` (number, optional): 道路アクセススコアの最小値
- `minPoleScore` (number, optional): 電柱近接スコアの最小値
- `minTotalScore` (number, optional): 総合スコアの最小値
- `minWeightedScore` (number, optional): 重み付きスコアの最小値
- `recommendations` (string[], optional): 推奨度フィルタ（"excellent", "good", "fair", "poor", "unsuitable"）
- `excludeViolations` (boolean, optional): 離隔違反サイトを除外

**レスポンス:**

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "siteId": "site-001",
        "siteName": "候補地A",
        "latitude": 35.6812,
        "longitude": 139.7671,
        "totalScore": 85.5,
        "weightedScore": 88.2,
        "recommendation": "excellent",
        "evaluationDate": "2025-01-15T10:00:00Z",
        "gridScore": 90.0,
        "setbackScore": 85.0,
        "roadScore": 80.0,
        "poleScore": 90.0,
        "violatesSetback": false
      }
    ],
    "stats": {
      "totalSites": 100,
      "matchingSites": 15,
      "averageScore": 86.5,
      "recommendationBreakdown": {
        "excellent": 10,
        "good": 5
      }
    }
  }
}
```

### 2. CSVエクスポート

スクリーニング結果をCSV形式でエクスポートします。

**エンドポイント:** `POST /api/v1/screening/export/csv`

**認証:** 必要

**クエリパラメータ:**

- `filename` (string, optional): 出力ファイル名（デフォルト: `bess-screening-results-{timestamp}.csv`）

**リクエストボディ:**

スクリーニング条件（上記と同じ）

**レスポンス:**

CSVファイルのダウンロード

**CSVフォーマット:**

```csv
サイト名,緯度,経度,総合スコア,重み付きスコア,推奨度,系統接続スコア,離隔距離スコア,道路アクセススコア,電柱近接スコア,離隔違反,評価日時
候補地A,35.681200,139.767100,85.5,88.2,優秀,90.0,85.0,80.0,90.0,なし,2025/1/15 10:00:00
```

### 3. GeoJSONエクスポート

スクリーニング結果をGeoJSON形式でエクスポートします。

**エンドポイント:** `POST /api/v1/screening/export/geojson`

**認証:** 必要

**クエリパラメータ:**

- `filename` (string, optional): 出力ファイル名（デフォルト: `bess-screening-results-{timestamp}.geojson`）

**リクエストボディ:**

スクリーニング条件（上記と同じ）

**レスポンス:**

GeoJSONファイルのダウンロード

**GeoJSONフォーマット:**

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [139.7671, 35.6812]
      },
      "properties": {
        "siteId": "site-001",
        "siteName": "候補地A",
        "totalScore": 85.5,
        "weightedScore": 88.2,
        "recommendation": "excellent",
        "gridScore": 90.0,
        "setbackScore": 85.0,
        "roadScore": 80.0,
        "poleScore": 90.0,
        "violatesSetback": false,
        "evaluationDate": "2025-01-15T10:00:00Z",
        "color": "#22c55e",
        "markerSize": "large"
      }
    }
  ],
  "metadata": {
    "exportDate": "2025-01-15T12:00:00Z",
    "totalFeatures": 15,
    "averageScore": 86.5,
    "recommendationBreakdown": {
      "excellent": 10,
      "good": 5
    }
  }
}
```

### 4. 評価サマリーエクスポート

指定したサイトの詳細評価情報をCSV形式でエクスポートします。

**エンドポイント:** `POST /api/v1/screening/export/evaluation-summary`

**認証:** 必要

**リクエストボディ:**

```json
{
  "siteIds": ["site-001", "site-002", "site-003"]
}
```

**レスポンス:**

詳細評価情報を含むCSVファイルのダウンロード

**CSVフォーマット:**

```csv
サイト名,住所,緯度,経度,面積(㎡),土地利用,総合スコア,重み付きスコア,推奨度,推奨理由,系統接続スコア,系統距離(m),最寄り系統設備,利用可能容量(kW),離隔距離スコア,最寄り住居距離(m),離隔違反,道路アクセススコア,道路距離(m),道路幅員(m),道路種別,電柱近接スコア,電柱距離(m),評価日時
```

### 5. マッピング用GeoJSONエクスポート

指定したサイトの情報を地図表示用のGeoJSON形式でエクスポートします。

**エンドポイント:** `POST /api/v1/screening/export/mapping`

**認証:** 必要

**リクエストボディ:**

```json
{
  "siteIds": ["site-001", "site-002", "site-003"]
}
```

**レスポンス:**

マッピング用GeoJSONファイルのダウンロード

## 使用例

### cURLでのスクリーニング

```bash
curl -X POST http://localhost:4000/api/v1/screening/screen \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "minWeightedScore": 80,
    "recommendations": ["excellent", "good"],
    "excludeViolations": true
  }'
```

### cURLでのCSVエクスポート

```bash
curl -X POST "http://localhost:4000/api/v1/screening/export/csv?filename=my-results.csv" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "minWeightedScore": 80,
    "excludeViolations": true
  }' \
  --output results.csv
```

### JavaScriptでの使用例

```javascript
// スクリーニング実行
const screeningSites = async () => {
  const response = await fetch('http://localhost:4000/api/v1/screening/screen', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      minWeightedScore: 80,
      recommendations: ['excellent', 'good'],
      excludeViolations: true,
    }),
  });

  const data = await response.json();
  console.log(`Found ${data.data.stats.matchingSites} sites`);
  return data.data.results;
};

// CSVエクスポート
const exportToCsv = async (criteria) => {
  const response = await fetch('http://localhost:4000/api/v1/screening/export/csv', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(criteria),
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'screening-results.csv';
  a.click();
};
```

## エラーレスポンス

### 認証エラー

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### バリデーションエラー

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "No sites match the screening criteria"
  }
}
```

### サーバーエラー

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Failed to export CSV file"
  }
}
```

## レート制限

- スクリーニング: 30リクエスト/分
- エクスポート: 10リクエスト/分

レート制限を超えた場合、429 Too Many Requestsが返されます。

## 推奨度の色分け

GeoJSONエクスポートでは、推奨度に応じて以下の色が自動的に割り当てられます：

- `excellent`: #22c55e (緑)
- `good`: #84cc16 (ライトグリーン)
- `fair`: #eab308 (黄色)
- `poor`: #f97316 (オレンジ)
- `unsuitable`: #ef4444 (赤)
- `not_evaluated`: #6b7280 (グレー)

## マーカーサイズ

GeoJSONエクスポートでは、重み付きスコアに応じてマーカーサイズが設定されます：

- `large`: スコア >= 80
- `medium`: スコア >= 60
- `small`: スコア < 60
