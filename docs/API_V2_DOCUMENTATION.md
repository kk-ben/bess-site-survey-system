# BESS Site Survey System v2.0 - API Documentation

**Version**: 2.0.0  
**Base URL**: `http://localhost:4000/api/v2`  
**Authentication**: Bearer Token Required

---

## 📋 目次

1. [認証](#認証)
2. [サイト管理API](#サイト管理api)
3. [自動化API](#自動化api)
4. [エラーレスポンス](#エラーレスポンス)
5. [データモデル](#データモデル)

---

## 認証

全てのAPIエンドポイントは認証が必要です。

### リクエストヘッダー
```
Authorization: Bearer <your_token>
Content-Type: application/json
```

---

## サイト管理API

### 1. サイト一覧取得

**エンドポイント**: `GET /sites`

**説明**: フィルター・ページネーション対応のサイト一覧取得

**クエリパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| page | number | No | ページ番号（デフォルト: 1） |
| limit | number | No | 1ページあたりの件数（デフォルト: 20） |
| status | string | No | ステータスフィルター |
| priority_rank | string | No | 優先度フィルター（A/B/C） |
| min_score | number | No | 最小スコア |
| max_score | number | No | 最大スコア |
| search | string | No | 検索キーワード |
| sort_by | string | No | ソート項目（デフォルト: created_at） |
| sort_order | string | No | ソート順（asc/desc、デフォルト: desc） |

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "site_code": "STB2025-000001",
        "name": "茨城県つくば市 工業団地跡地",
        "address": "茨城県つくば市東光台5-19",
        "lat": 36.0839,
        "lon": 140.0764,
        "area_m2": 50000,
        "status": "approved",
        "priority_rank": "A",
        "grid_info": { ... },
        "geo_risk": { ... },
        "scores": [ ... ]
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "total_pages": 5
  },
  "message": "Found 100 sites"
}
```

---

### 2. サイト詳細取得

**エンドポイント**: `GET /sites/:id`

**説明**: 指定サイトの詳細情報を全関連データ含めて取得

**パスパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | Yes | サイトID（UUID） |

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "site_code": "STB2025-000001",
    "name": "茨城県つくば市 工業団地跡地",
    "address": "茨城県つくば市東光台5-19",
    "lat": 36.0839,
    "lon": 140.0764,
    "area_m2": 50000,
    "status": "approved",
    "priority_rank": "A",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z",
    "grid_info": {
      "target_voltage_kv": 66,
      "substation_distance_m": 850,
      "capacity_available_mw": 50.0,
      "connection_cost_jpy": 450000000,
      "automation_level": "SEMI"
    },
    "geo_risk": {
      "elevation_m": 25.5,
      "slope_pct": 2.5,
      "flood_depth_class": "0.5m未満",
      "liquefaction_risk": "low",
      "automation_level": "AUTO"
    },
    "scores": [
      {
        "score_total": 85.5,
        "score_grid": 88.0,
        "score_geo": 90.0,
        "score_regulatory": 82.0,
        "score_access": 85.0,
        "score_economics": 78.5,
        "grade": "B",
        "calculated_at": "2025-01-01T00:00:00Z"
      }
    ],
    "automation_sources": [ ... ]
  },
  "message": "Site retrieved successfully"
}
```

---

### 3. サイト作成

**エンドポイント**: `POST /sites`

**説明**: 新規サイトを作成

**リクエストボディ**:
```json
{
  "site_code": "STB2025-000001",  // Optional: 自動生成される
  "name": "茨城県つくば市 工業団地跡地",
  "address": "茨城県つくば市東光台5-19",  // Required
  "lat": 36.0839,  // Required
  "lon": 140.0764,  // Required
  "area_m2": 50000,
  "land_right_status": "所有権",
  "status": "draft",  // draft/under_review/approved/rejected/on_hold
  "priority_rank": "A"  // A/B/C
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": { ... },  // 作成されたサイトの詳細
  "message": "Site created successfully"
}
```

**バリデーションルール**:
- `address`: 必須
- `lat`: 必須、-90 ～ 90
- `lon`: 必須、-180 ～ 180
- `area_m2`: 正の数値
- `status`: 指定された値のみ

---

### 4. サイト更新

**エンドポイント**: `PUT /sites/:id`

**説明**: 既存サイトを更新（監査ログ自動記録）

**パスパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | Yes | サイトID（UUID） |

**リクエストボディ**:
```json
{
  "name": "更新されたサイト名",
  "status": "approved",
  "priority_rank": "A"
  // 更新したいフィールドのみ指定
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": { ... },  // 更新されたサイトの詳細
  "message": "Site updated successfully"
}
```

---

### 5. サイト削除

**エンドポイント**: `DELETE /sites/:id`

**説明**: サイトを削除（関連データもカスケード削除）

**パスパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| id | string | Yes | サイトID（UUID） |

**レスポンス例**:
```json
{
  "success": true,
  "message": "Site deleted successfully"
}
```

---

### 6. 自動化統計取得

**エンドポイント**: `GET /sites/stats/automation`

**説明**: 自動化レベル別の統計情報を取得

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "grid_info": {
      "AUTO": 10,
      "SEMI": 25,
      "MANUAL": 15
    },
    "geo_risk": {
      "AUTO": 30,
      "SEMI": 10,
      "MANUAL": 10
    },
    "total_sites": 50
  },
  "message": "Automation statistics retrieved successfully"
}
```

---

## 自動化API

### 1. サービス状態確認

**エンドポイント**: `GET /automation/status`

**説明**: 自動化サービスの状態を確認

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "elevation_api": {
      "configured": true,
      "connected": true,
      "status": "operational"
    },
    "scoring_service": {
      "status": "operational"
    }
  },
  "message": "Automation status retrieved successfully"
}
```

---

### 2. 標高取得（単体）

**エンドポイント**: `POST /automation/elevation/:siteId`

**説明**: 指定サイトの標高をGoogle Elevation APIから取得

**パスパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| siteId | string | Yes | サイトID（UUID） |

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "site_id": "uuid",
    "elevation_m": 25.5,
    "updated": true
  },
  "message": "Elevation updated successfully"
}
```

**エラー例**:
```json
{
  "success": false,
  "error": {
    "code": "SERVICE_UNAVAILABLE",
    "message": "Google Elevation API is not configured"
  }
}
```

---

### 3. 標高取得（一括）

**エンドポイント**: `POST /automation/elevation/batch`

**説明**: 複数サイトの標高を一括取得

**リクエストボディ**:
```json
{
  "site_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "success": 2,
    "failed": 1,
    "results": [
      {
        "siteId": "uuid1",
        "success": true,
        "elevation": 25.5
      },
      {
        "siteId": "uuid2",
        "success": true,
        "elevation": 30.2
      },
      {
        "siteId": "uuid3",
        "success": false,
        "error": "API rate limit exceeded"
      }
    ]
  },
  "message": "Elevation updated for 2 sites"
}
```

**注意事項**:
- API制限: 1日2,500リクエスト（無料枠）
- レート制限: 秒間50リクエスト
- 一括処理時は200ms間隔で実行

---

### 4. スコア計算（単体）

**エンドポイント**: `POST /automation/score/:siteId`

**説明**: 指定サイトのスコアを計算

**パスパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| siteId | string | Yes | サイトID（UUID） |

**リクエストボディ**（オプション）:
```json
{
  "weights": {
    "grid": 0.30,
    "geo": 0.25,
    "regulatory": 0.20,
    "access": 0.15,
    "economics": 0.10
  }
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "site_id": "uuid",
    "score_total": 85.5,
    "score_components": {
      "score_grid": 88.0,
      "score_geo": 90.0,
      "score_regulatory": 82.0,
      "score_access": 85.0,
      "score_economics": 78.5
    },
    "grade": "B"
  },
  "message": "Score calculated and saved successfully"
}
```

**スコア計算ロジック**:
- 各カテゴリ: 0-100点
- 総合スコア = Σ(カテゴリスコア × 重み)
- グレード判定:
  - S: 90点以上
  - A: 80-89点
  - B: 70-79点
  - C: 60-69点
  - D: 60点未満

---

### 5. スコア計算（一括）

**エンドポイント**: `POST /automation/score/batch`

**説明**: 複数サイトのスコアを一括計算

**リクエストボディ**:
```json
{
  "site_ids": ["uuid1", "uuid2", "uuid3"],
  "weights": {  // Optional
    "grid": 0.30,
    "geo": 0.25,
    "regulatory": 0.20,
    "access": 0.15,
    "economics": 0.10
  }
}
```

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "success": 3,
    "failed": 0,
    "results": [
      {
        "siteId": "uuid1",
        "success": true,
        "score": {
          "score_total": 85.5,
          "grade": "B"
        }
      },
      {
        "siteId": "uuid2",
        "success": true,
        "score": {
          "score_total": 92.3,
          "grade": "S"
        }
      },
      {
        "siteId": "uuid3",
        "success": true,
        "score": {
          "score_total": 78.2,
          "grade": "B"
        }
      }
    ]
  },
  "message": "Score calculated for 3 sites"
}
```

---

### 6. 自動化ソース取得

**エンドポイント**: `GET /automation/sources/:siteId`

**説明**: サイトの自動化ソース情報を取得

**パスパラメータ**:
| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| siteId | string | Yes | サイトID（UUID） |

**レスポンス例**:
```json
{
  "success": true,
  "data": {
    "site_id": "uuid",
    "automation_sources": [
      {
        "table_name": "geo_risk",
        "field_name": "elevation_m",
        "source_type": "API",
        "source_name": "Google Elevation API",
        "source_url": "https://maps.googleapis.com/maps/api/elevation/json",
        "last_updated": "2025-01-01T00:00:00Z"
      }
    ]
  },
  "message": "Automation sources retrieved successfully"
}
```

---

## エラーレスポンス

### エラーレスポンス形式
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}  // Optional
  }
}
```

### エラーコード一覧

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| VALIDATION_ERROR | 400 | バリデーションエラー |
| DUPLICATE_SITE_CODE | 400 | サイトコード重複 |
| NOT_FOUND | 404 | リソースが見つからない |
| SERVICE_UNAVAILABLE | 503 | 外部サービス利用不可 |
| INTERNAL_ERROR | 500 | 内部サーバーエラー |
| CALCULATION_ERROR | 500 | スコア計算エラー |
| SAVE_ERROR | 500 | データ保存エラー |

---

## データモデル

### Site（サイト基本情報）
```typescript
{
  id: string;                    // UUID
  site_code: string;             // サイトコード（例: STB2025-000001）
  name: string | null;           // サイト名
  address: string;               // 住所
  lat: number;                   // 緯度
  lon: number;                   // 経度
  area_m2: number | null;        // 面積（m²）
  land_right_status: string | null;  // 土地権利状況
  status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'on_hold';
  priority_rank: string | null;  // 優先度（A/B/C）
  created_at: string;            // 作成日時（ISO 8601）
  updated_at: string;            // 更新日時（ISO 8601）
}
```

### GridInfo（系統情報）
```typescript
{
  id: string;
  site_id: string;
  target_voltage_kv: number | null;      // 目標電圧（kV）
  substation_distance_m: number | null;  // 変電所距離（m）
  capacity_available_mw: number | null;  // 利用可能容量（MW）
  connection_cost_jpy: number | null;    // 接続コスト（円）
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  note: string | null;
}
```

### GeoRisk（地理リスク）
```typescript
{
  id: string;
  site_id: string;
  elevation_m: number | null;            // 標高（m）
  slope_pct: number | null;              // 傾斜（%）
  flood_depth_class: string | null;      // 浸水深クラス
  liquefaction_risk: 'low' | 'medium' | 'high' | null;  // 液状化リスク
  automation_level: 'AUTO' | 'SEMI' | 'MANUAL';
  note: string | null;
}
```

### Score（スコア）
```typescript
{
  id: string;
  site_id: string;
  score_total: number;           // 総合スコア（0-100）
  score_grid: number;            // 系統スコア（0-100）
  score_geo: number;             // 地理リスクスコア（0-100）
  score_regulatory: number;      // 法規制スコア（0-100）
  score_access: number;          // アクセススコア（0-100）
  score_economics: number;       // 経済性スコア（0-100）
  grade: 'S' | 'A' | 'B' | 'C' | 'D';  // グレード
  formula_version: string;       // 計算式バージョン
  calculated_at: string;         // 計算日時（ISO 8601）
}
```

---

## レート制限

- 一般API: 100リクエスト/分
- 標高取得API: 50リクエスト/分（Google API制限）

レート制限超過時:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests"
  }
}
```

---

## 使用例

### cURLでの使用例

```bash
# サイト一覧取得
curl -X GET "http://localhost:4000/api/v2/sites?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# サイト作成
curl -X POST "http://localhost:4000/api/v2/sites" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "茨城県つくば市東光台5-19",
    "lat": 36.0839,
    "lon": 140.0764,
    "area_m2": 50000
  }'

# 標高取得
curl -X POST "http://localhost:4000/api/v2/automation/elevation/SITE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# スコア計算
curl -X POST "http://localhost:4000/api/v2/automation/score/SITE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

**ドキュメントバージョン**: 2.0.0  
**最終更新**: 2025年10月6日  
**作成者**: Kiro AI Assistant
