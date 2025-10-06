-- ============================================================================
-- BESS Site Survey System v2.0 - テストデータ（正規化スキーマ対応）
-- ============================================================================

-- ステップ1: サイト基本情報を作成
INSERT INTO sites (site_code, name, address, lat, lon, area_m2, status, priority_rank)
VALUES 
    ('STB2025-000001', '茨城県つくば市 工業団地跡地', '茨城県つくば市東光台5-19', 36.0839, 140.0764, 50000, 'approved', 'A'),
    ('STB2025-000002', '千葉県市原市 埋立地', '千葉県市原市五井南海岸1-1', 35.4980, 140.1156, 45000, 'approved', 'A'),
    ('STB2025-000003', '大阪府堺市 臨海工業地帯', '大阪府堺市西区築港新町1-5-1', 34.5833, 135.4297, 80000, 'under_review', 'B')
ON CONFLICT (site_code) DO NOTHING;

-- ステップ2: Grid Info（系統情報）
INSERT INTO grid_info (site_id, target_voltage_kv, substation_distance_m, capacity_available_mw, connection_cost_jpy, automation_level, note)
SELECT 
    id,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 66
        WHEN site_code = 'STB2025-000002' THEN 154
        WHEN site_code = 'STB2025-000003' THEN 154
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 850
        WHEN site_code = 'STB2025-000002' THEN 1200
        WHEN site_code = 'STB2025-000003' THEN 650
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 50.0
        WHEN site_code = 'STB2025-000002' THEN 80.0
        WHEN site_code = 'STB2025-000003' THEN 120.0
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 450000000
        WHEN site_code = 'STB2025-000002' THEN 680000000
        WHEN site_code = 'STB2025-000003' THEN 380000000
    END,
    'SEMI',
    '変電所距離は地図計測による概算値'
FROM sites
WHERE site_code IN ('STB2025-000001', 'STB2025-000002', 'STB2025-000003');

-- ステップ3: Geo Risk（地理的リスク）
INSERT INTO geo_risk (site_id, elevation_m, slope_pct, flood_depth_class, liquefaction_risk, automation_level, note)
SELECT 
    id,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 25.5
        WHEN site_code = 'STB2025-000002' THEN 3.2
        WHEN site_code = 'STB2025-000003' THEN 5.8
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 2.5
        WHEN site_code = 'STB2025-000002' THEN 0.8
        WHEN site_code = 'STB2025-000003' THEN 1.2
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN '0.5m未満'
        WHEN site_code = 'STB2025-000002' THEN '2m未満'
        WHEN site_code = 'STB2025-000003' THEN '0.5m未満'
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 'low'
        WHEN site_code = 'STB2025-000002' THEN 'high'
        WHEN site_code = 'STB2025-000003' THEN 'medium'
    END,
    'AUTO',
    'ハザードマップAPIより自動取得'
FROM sites
WHERE site_code IN ('STB2025-000001', 'STB2025-000002', 'STB2025-000003');

-- ステップ4: Land Regulatory（法規制）
INSERT INTO land_regulatory (site_id, city_plan_zone, farmland_class, automation_level, note)
SELECT 
    id,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN '工業専用地域'
        WHEN site_code = 'STB2025-000002' THEN '工業地域'
        WHEN site_code = 'STB2025-000003' THEN '準工業地域'
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN '非農地'
        WHEN site_code = 'STB2025-000002' THEN '非農地'
        WHEN site_code = 'STB2025-000003' THEN '非農地'
    END,
    'MANUAL',
    '都市計画情報は自治体HPより確認'
FROM sites
WHERE site_code IN ('STB2025-000001', 'STB2025-000002', 'STB2025-000003');

-- ステップ5: Access Physical（物理条件）
INSERT INTO access_physical (site_id, parcel_shape, road_access, nearest_road_width_m, automation_level, note)
SELECT 
    id,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN '長方形'
        WHEN site_code = 'STB2025-000002' THEN '不整形'
        WHEN site_code = 'STB2025-000003' THEN '長方形'
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN '有（幅員8m）'
        WHEN site_code = 'STB2025-000002' THEN '有（幅員6m）'
        WHEN site_code = 'STB2025-000003' THEN '有（幅員12m）'
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 8.0
        WHEN site_code = 'STB2025-000002' THEN 6.0
        WHEN site_code = 'STB2025-000003' THEN 12.0
    END,
    'SEMI',
    'Google Street Viewで確認'
FROM sites
WHERE site_code IN ('STB2025-000001', 'STB2025-000002', 'STB2025-000003');

-- ステップ6: Economics（経済性）
INSERT INTO economics (site_id, land_price_jpy_per_m2, planned_power_mw, planned_energy_mwh, automation_level, note)
SELECT 
    id,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 45000
        WHEN site_code = 'STB2025-000002' THEN 38000
        WHEN site_code = 'STB2025-000003' THEN 52000
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 15.5
        WHEN site_code = 'STB2025-000002' THEN 12.0
        WHEN site_code = 'STB2025-000003' THEN 25.0
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 62.0
        WHEN site_code = 'STB2025-000002' THEN 48.0
        WHEN site_code = 'STB2025-000003' THEN 100.0
    END,
    'MANUAL',
    '地価は近隣取引事例より推定'
FROM sites
WHERE site_code IN ('STB2025-000001', 'STB2025-000002', 'STB2025-000003');

-- ステップ7: Automation Sources（自動化ソース管理）
INSERT INTO automation_sources (site_id, table_name, field_name, source_type, source_name, source_url)
SELECT 
    id,
    'geo_risk',
    'elevation_m',
    'API',
    'Google Elevation API',
    'https://maps.googleapis.com/maps/api/elevation/json'
FROM sites
WHERE site_code IN ('STB2025-000001', 'STB2025-000002', 'STB2025-000003');

-- ステップ8: Scores（スコア履歴）
INSERT INTO scores (site_id, score_total, score_grid, score_geo, score_regulatory, score_access, score_economics, grade, formula_version)
SELECT 
    id,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 85.5
        WHEN site_code = 'STB2025-000002' THEN 78.2
        WHEN site_code = 'STB2025-000003' THEN 92.3
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 88.0
        WHEN site_code = 'STB2025-000002' THEN 75.5
        WHEN site_code = 'STB2025-000003' THEN 95.0
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 90.0
        WHEN site_code = 'STB2025-000002' THEN 72.0
        WHEN site_code = 'STB2025-000003' THEN 88.0
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 82.0
        WHEN site_code = 'STB2025-000002' THEN 80.0
        WHEN site_code = 'STB2025-000003' THEN 90.0
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 85.0
        WHEN site_code = 'STB2025-000002' THEN 78.0
        WHEN site_code = 'STB2025-000003' THEN 95.0
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 78.5
        WHEN site_code = 'STB2025-000002' THEN 85.0
        WHEN site_code = 'STB2025-000003' THEN 94.0
    END,
    CASE 
        WHEN site_code = 'STB2025-000001' THEN 'B'
        WHEN site_code = 'STB2025-000002' THEN 'C'
        WHEN site_code = 'STB2025-000003' THEN 'A'
    END,
    'v2.0.1'
FROM sites
WHERE site_code IN ('STB2025-000001', 'STB2025-000002', 'STB2025-000003');

-- ステップ9: Audit Log（監査ログ）
INSERT INTO audit_log (site_id, actor, table_name, field_name, new_value)
SELECT 
    id,
    'system',
    'sites',
    'status',
    status
FROM sites
WHERE site_code IN ('STB2025-000001', 'STB2025-000002', 'STB2025-000003');

-- 確認クエリ
SELECT 
    s.site_code,
    s.name,
    s.status,
    g.target_voltage_kv,
    g.capacity_available_mw,
    gr.liquefaction_risk,
    sc.score_total,
    sc.grade
FROM sites s
LEFT JOIN grid_info g ON s.id = g.site_id
LEFT JOIN geo_risk gr ON s.id = gr.site_id
LEFT JOIN scores sc ON s.id = sc.site_id
ORDER BY s.site_code;
