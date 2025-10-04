# データベースファイル

## 📁 ファイル一覧

| ファイル | 説明 | 用途 |
|---------|------|------|
| `supabase-complete-setup.sql` | 初期セットアップ | テーブル作成、RLS設定 |
| `test-data.sql` | テストデータ | 23箇所の候補地データ |
| `test-data-sites.csv` | CSV形式データ | データ取込機能のテスト用 |

## 🚀 セットアップ順序

### 1. 初回セットアップ（新規プロジェクト）

```sql
-- supabase-complete-setup.sql を実行
-- テーブル作成 + 管理者ユーザー作成
```

### 2. テストデータ投入

```sql
-- test-data.sql を実行
-- 23箇所の候補地 + 変電所 + 設備データ
```

### 3. 動作確認

Vercelデプロイ後、以下でログイン：
- Email: `admin@example.com`
- Password: `admin123`

## 📊 データ構造

### テーブル関係図

```
users (ユーザー)
  ↓ created_by
sites (候補地) ←→ evaluations (評価結果)
  
grid_assets (変電所)
amenities (設備)
poles (電柱)
```

### 主要テーブル

**sites（候補地）**
- id: UUID
- name: 候補地名
- location: 地理座標（PostGIS）
- address: 住所
- capacity_mw: 容量（MW）
- status: ステータス（pending/evaluated/approved）

**evaluations（評価結果）**
- site_id: 候補地ID
- grid_distance_m: 変電所までの距離
- grid_score: 送電網スコア
- pole_score: 電柱スコア
- road_score: 道路スコア
- setback_score: セットバックスコア
- total_score: 総合スコア

## 🔧 便利なクエリ

### 全データ件数確認

```sql
SELECT 
    'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Sites', COUNT(*) FROM sites
UNION ALL
SELECT 'Grid Assets', COUNT(*) FROM grid_assets
UNION ALL
SELECT 'Evaluations', COUNT(*) FROM evaluations;
```

### ステータス別集計

```sql
SELECT status, COUNT(*) as count, 
       ROUND(AVG(capacity_mw), 2) as avg_capacity
FROM sites
GROUP BY status;
```

### 高スコア候補地

```sql
SELECT s.name, s.address, e.total_score
FROM sites s
JOIN evaluations e ON s.id = e.site_id
WHERE e.total_score >= 90
ORDER BY e.total_score DESC;
```

## 🗑️ データリセット

```sql
-- 評価結果を削除
TRUNCATE evaluations CASCADE;

-- 候補地を削除（管理者作成以外）
DELETE FROM sites WHERE name LIKE '%県%';

-- 送電網資産を削除
TRUNCATE grid_assets CASCADE;

-- 設備を削除
TRUNCATE amenities CASCADE;

-- 電柱を削除
TRUNCATE poles CASCADE;
```

## 📝 カスタムデータ追加

### 候補地を1件追加

```sql
INSERT INTO sites (name, location, address, capacity_mw, status, created_by)
VALUES (
    '新規候補地',
    ST_GeogFromText('POINT(139.6917 35.6895)'),
    '東京都新宿区',
    15.0,
    'pending',
    (SELECT id FROM users WHERE email = 'admin@example.com')
);
```

### 変電所を1件追加

```sql
INSERT INTO grid_assets (name, type, location, capacity_mw, voltage_kv)
VALUES (
    '新宿変電所',
    'substation',
    ST_GeogFromText('POINT(139.7000 35.6900)'),
    500.0,
    275.0
);
```

## 🔍 PostGIS関数

### 距離計算（メートル）

```sql
SELECT 
    s.name,
    ST_Distance(s.location, g.location) as distance_m
FROM sites s
CROSS JOIN grid_assets g
WHERE g.name = '新茨城変電所'
ORDER BY distance_m
LIMIT 5;
```

### 範囲内検索（半径5km）

```sql
SELECT name, address
FROM sites
WHERE ST_DWithin(
    location,
    ST_GeogFromText('POINT(139.6917 35.6895)'),
    5000  -- 5km
);
```

### 最寄りの変電所を検索

```sql
SELECT DISTINCT ON (s.id)
    s.name as site_name,
    g.name as nearest_substation,
    ST_Distance(s.location, g.location) as distance_m
FROM sites s
CROSS JOIN grid_assets g
WHERE g.type = 'substation'
ORDER BY s.id, distance_m
LIMIT 10;
```

## 🆘 トラブルシューティング

### PostGIS拡張が見つからない

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
SELECT PostGIS_version();
```

### RLSエラー

```sql
-- RLSを一時的に無効化（開発時のみ）
ALTER TABLE sites DISABLE ROW LEVEL SECURITY;

-- 本番環境では必ず有効化
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
```

### 座標が正しく表示されない

```sql
-- 座標を確認
SELECT 
    name,
    ST_Y(location::geometry) as latitude,
    ST_X(location::geometry) as longitude
FROM sites
LIMIT 5;
```

## 📚 参考資料

- [PostGIS Documentation](https://postgis.net/docs/)
- [Supabase PostGIS Guide](https://supabase.com/docs/guides/database/extensions/postgis)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
