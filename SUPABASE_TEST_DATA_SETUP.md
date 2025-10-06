# 📊 Supabase テストデータ投入手順

## 🎯 目的
v2.0 APIのテストデータをSupabaseに投入します。

---

## 📋 手順

### ステップ1: Supabaseにログイン

1. https://supabase.com/dashboard にアクセス
2. プロジェクト「BESS Site Survey System」を選択

---

### ステップ2: SQL Editorを開く

左メニューから「SQL Editor」をクリック

---

### ステップ3: 以下のSQLを実行

```sql
-- ============================================
-- BESS Site Survey System v2.0 - テストデータ
-- ============================================

-- サイト基本情報
INSERT INTO sites (name, latitude, longitude, address, capacity_mw, status, created_by)
VALUES 
    ('茨城県つくば市 工業団地跡地', 36.0839, 140.0764, '茨城県つくば市東光台5-19', 15.5, 'approved', 'admin@example.com'),
    ('千葉県市原市 埋立地', 35.4980, 140.1156, '千葉県市原市五井南海岸1-1', 12.0, 'approved', 'admin@example.com'),
    ('大阪府堺市 臨海工業地帯', 34.5833, 135.4297, '大阪府堺市西区築港新町1-5-1', 25.0, 'evaluated', 'admin@example.com')
ON CONFLICT DO NOTHING
RETURNING id, name;

-- Grid Info（系統情報）
WITH site_ids AS (
    SELECT id, name FROM sites WHERE name IN (
        '茨城県つくば市 工業団地跡地',
        '千葉県市原市 埋立地',
        '大阪府堺市 臨海工業地帯'
    )
)
INSERT INTO grid_info (site_id, distance_to_substation_m, voltage_kv, available_capacity_mw, connection_cost_estimate_jpy)
SELECT 
    id,
    CASE 
        WHEN name LIKE '%つくば%' THEN 850
        WHEN name LIKE '%市原%' THEN 1200
        WHEN name LIKE '%堺%' THEN 650
    END,
    CASE 
        WHEN name LIKE '%つくば%' THEN 66
        WHEN name LIKE '%市原%' THEN 154
        WHEN name LIKE '%堺%' THEN 154
    END,
    CASE 
        WHEN name LIKE '%つくば%' THEN 50.0
        WHEN name LIKE '%市原%' THEN 80.0
        WHEN name LIKE '%堺%' THEN 120.0
    END,
    CASE 
        WHEN name LIKE '%つくば%' THEN 450000000
        WHEN name LIKE '%市原%' THEN 680000000
        WHEN name LIKE '%堺%' THEN 380000000
    END
FROM site_ids
ON CONFLICT (site_id) DO NOTHING;

-- Geo Risk（地理的リスク）
WITH site_ids AS (
    SELECT id, name FROM sites WHERE name IN (
        '茨城県つくば市 工業団地跡地',
        '千葉県市原市 埋立地',
        '大阪府堺市 臨海工業地帯'
    )
)
INSERT INTO geo_risk (site_id, flood_risk_level, earthquake_risk_level, landslide_risk_level, tsunami_risk_level)
SELECT 
    id,
    CASE 
        WHEN name LIKE '%つくば%' THEN 'low'
        WHEN name LIKE '%市原%' THEN 'medium'
        WHEN name LIKE '%堺%' THEN 'low'
    END,
    CASE 
        WHEN name LIKE '%つくば%' THEN 'medium'
        WHEN name LIKE '%市原%' THEN 'high'
        WHEN name LIKE '%堺%' THEN 'medium'
    END,
    'low',
    CASE 
        WHEN name LIKE '%市原%' THEN 'medium'
        WHEN name LIKE '%堺%' THEN 'medium'
        ELSE 'none'
    END
FROM site_ids
ON CONFLICT (site_id) DO NOTHING;

-- Automation Tracking（自動化追跡）
WITH site_ids AS (
    SELECT id FROM sites WHERE name IN (
        '茨城県つくば市 工業団地跡地',
        '千葉県市原市 埋立地',
        '大阪府堺市 臨海工業地帯'
    )
)
INSERT INTO automation_tracking (site_id, last_automated_update, automation_status, data_sources)
SELECT 
    id,
    NOW(),
    'completed',
    ARRAY['osm', 'gsi', 'manual']
FROM site_ids
ON CONFLICT (site_id) DO NOTHING;

-- Audit Log（監査ログ）
WITH site_data AS (
    SELECT id, name, capacity_mw, status, created_by 
    FROM sites 
    WHERE name IN (
        '茨城県つくば市 工業団地跡地',
        '千葉県市原市 埋立地',
        '大阪府堺市 臨海工業地帯'
    )
)
INSERT INTO audit_log (site_id, action, changed_by, changes)
SELECT 
    id,
    'created',
    created_by,
    jsonb_build_object(
        'name', name,
        'capacity_mw', capacity_mw,
        'status', status
    )
FROM site_data;

-- Score History（スコア履歴）
WITH site_ids AS (
    SELECT id, name FROM sites WHERE name IN (
        '茨城県つくば市 工業団地跡地',
        '千葉県市原市 埋立地',
        '大阪府堺市 臨海工業地帯'
    )
)
INSERT INTO score_history (site_id, overall_score, grid_score, geo_score, economic_score, calculated_by)
SELECT 
    id,
    CASE 
        WHEN name LIKE '%つくば%' THEN 85.5
        WHEN name LIKE '%市原%' THEN 78.2
        WHEN name LIKE '%堺%' THEN 92.3
    END,
    CASE 
        WHEN name LIKE '%つくば%' THEN 88.0
        WHEN name LIKE '%市原%' THEN 75.5
        WHEN name LIKE '%堺%' THEN 95.0
    END,
    CASE 
        WHEN name LIKE '%つくば%' THEN 90.0
        WHEN name LIKE '%市原%' THEN 72.0
        WHEN name LIKE '%堺%' THEN 88.0
    END,
    CASE 
        WHEN name LIKE '%つくば%' THEN 78.5
        WHEN name LIKE '%市原%' THEN 85.0
        WHEN name LIKE '%堺%' THEN 94.0
    END,
    'system'
FROM site_ids;

-- 確認クエリ
SELECT 
    s.id,
    s.name,
    s.capacity_mw,
    s.status,
    g.distance_to_substation_m,
    g.voltage_kv,
    gr.flood_risk_level,
    gr.earthquake_risk_level,
    sh.overall_score
FROM sites s
LEFT JOIN grid_info g ON s.id = g.site_id
LEFT JOIN geo_risk gr ON s.id = gr.site_id
LEFT JOIN score_history sh ON s.id = sh.site_id
ORDER BY s.created_at DESC
LIMIT 10;
```

---

## ✅ 確認

実行後、以下が表示されればOK：

- 3件のサイトデータ
- 各サイトのgrid_info、geo_risk、score_historyが紐付いている

---

## 🔄 次のステップ

テストデータ投入後、APIで確認：

```bash
curl http://153.121.61.164:3000/api/v2/sites
```

3件のサイトが返ってくればOK！

