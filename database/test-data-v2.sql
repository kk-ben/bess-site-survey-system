-- ============================================================================
-- BESS Site Survey System v2.0 - Test Data
-- テストデータ投入スクリプト
-- ============================================================================

-- ============================================================================
-- テストサイト1：東京駅周辺（完全なデータセット）
-- ============================================================================

-- 1. サイト基本情報
INSERT INTO sites (site_code, name, address, lat, lon, area_m2, status, priority_rank)
VALUES (
    'STB2025-000001',
    'テストサイト1（東京駅）',
    '東京都千代田区丸の内1-9-1',
    35.6812,
    139.7671,
    5000,
    'draft',
    'A'
) RETURNING id;

-- 2. Grid Info（系統情報）
INSERT INTO grid_info (
    site_id,
    target_voltage_kv,
    substation_distance_m,
    line_distance_m,
    capacity_available_mw,
    congestion_level,
    connection_cost_jpy,
    automation_level,
    note
)
SELECT 
    id,
    66,
    1500,
    800,
    10.5,
    'low',
    50000000,
    'MANUAL',
    'テストデータ：手動入力'
FROM sites WHERE site_code = 'STB2025-000001';

-- 3. Geo Risk（地理リスク）
INSERT INTO geo_risk (
    site_id,
    elevation_m,
    slope_pct,
    flood_depth_class,
    liquefaction_risk,
    sun_hours_loss,
    automation_level,
    note
)
SELECT 
    id,
    5.2,
    1.5,
    '0.5m未満',
    'low',
    2.5,
    'MANUAL',
    'テストデータ：手動入力'
FROM sites WHERE site_code = 'STB2025-000001';

-- 4. Land Regulatory（法規制）
INSERT INTO land_regulatory (
    site_id,
    city_plan_zone,
    land_use_zone,
    farmland_class,
    automation_level,
    note
)
SELECT 
    id,
    '市街化区域',
    '商業地域',
    '該当なし',
    'MANUAL',
    'テストデータ：手動入力'
FROM sites WHERE site_code = 'STB2025-000001';

-- 5. Access Physical（物理条件）
INSERT INTO access_physical (
    site_id,
    parcel_shape,
    road_access,
    nearest_road_width_m,
    inside_setback_need,
    neighbor_clearance_e,
    neighbor_clearance_w,
    neighbor_clearance_n,
    neighbor_clearance_s,
    automation_level,
    note
)
SELECT 
    id,
    '長方形',
    '有（幅員6m）',
    6.0,
    '不要',
    3.0,
    3.0,
    2.5,
    2.5,
    'MANUAL',
    'テストデータ：手動入力'
FROM sites WHERE site_code = 'STB2025-000001';

-- 6. Economics（経済性）
INSERT INTO economics (
    site_id,
    land_price_jpy_per_m2,
    land_rent_jpy_per_tsubo_month,
    connection_cost_estimate_jpy,
    construction_cost_estimate_jpy,
    planned_power_mw,
    planned_energy_mwh,
    expected_capacity_factor_pct,
    automation_level,
    note
)
SELECT 
    id,
    150000,
    5000,
    50000000,
    200000000,
    2.0,
    8.0,
    85.0,
    'MANUAL',
    'テストデータ：手動入力'
FROM sites WHERE site_code = 'STB2025-000001';

-- 7. Scores（スコア）
INSERT INTO scores (
    site_id,
    score_total,
    score_grid,
    score_geo,
    score_regulatory,
    score_access,
    score_economics,
    grade,
    formula_version
)
SELECT 
    id,
    85.5,
    90.0,
    88.0,
    82.0,
    85.0,
    80.0,
    'A',
    'v1.0'
FROM sites WHERE site_code = 'STB2025-000001';

-- 8. Audit Log（監査ログ）
INSERT INTO audit_log (
    site_id,
    actor,
    table_name,
    field_name,
    old_value,
    new_value
)
SELECT 
    id,
    'test_user',
    'sites',
    'status',
    NULL,
    'draft'
FROM sites WHERE site_code = 'STB2025-000001';

-- ============================================================================
-- テストサイト2：大阪梅田（部分的なデータセット）
-- ============================================================================

INSERT INTO sites (site_code, name, address, lat, lon, area_m2, status, priority_rank)
VALUES (
    'STB2025-000002',
    'テストサイト2（大阪梅田）',
    '大阪府大阪市北区梅田3-1-1',
    34.7024,
    135.4959,
    3500,
    'under_review',
    'B'
);

INSERT INTO grid_info (site_id, target_voltage_kv, capacity_available_mw, automation_level)
SELECT id, 77, 8.5, 'SEMI'
FROM sites WHERE site_code = 'STB2025-000002';

INSERT INTO geo_risk (site_id, elevation_m, liquefaction_risk, automation_level)
SELECT id, 3.5, 'medium', 'SEMI'
FROM sites WHERE site_code = 'STB2025-000002';

INSERT INTO scores (site_id, score_total, grade, formula_version)
SELECT id, 72.0, 'B', 'v1.0'
FROM sites WHERE site_code = 'STB2025-000002';

-- ============================================================================
-- テストサイト3：名古屋駅（最小限のデータセット）
-- ============================================================================

INSERT INTO sites (site_code, name, address, lat, lon, area_m2, status, priority_rank)
VALUES (
    'STB2025-000003',
    'テストサイト3（名古屋駅）',
    '愛知県名古屋市中村区名駅1-1-4',
    35.1706,
    136.8816,
    4200,
    'draft',
    'C'
);

INSERT INTO grid_info (site_id, target_voltage_kv, automation_level)
SELECT id, 66, 'MANUAL'
FROM sites WHERE site_code = 'STB2025-000003';

-- ============================================================================
-- 確認クエリ
-- ============================================================================

-- 全サイトの概要
SELECT 
    s.site_code,
    s.name,
    s.status,
    s.priority_rank,
    g.target_voltage_kv,
    g.capacity_available_mw,
    sc.score_total,
    sc.grade
FROM sites s
LEFT JOIN grid_info g ON s.id = g.site_id
LEFT JOIN scores sc ON s.id = sc.site_id
ORDER BY s.site_code;

-- データ投入数の確認
SELECT 
    'sites' as table_name, COUNT(*) as count FROM sites
UNION ALL
SELECT 'grid_info', COUNT(*) FROM grid_info
UNION ALL
SELECT 'geo_risk', COUNT(*) FROM geo_risk
UNION ALL
SELECT 'land_regulatory', COUNT(*) FROM land_regulatory
UNION ALL
SELECT 'access_physical', COUNT(*) FROM access_physical
UNION ALL
SELECT 'economics', COUNT(*) FROM economics
UNION ALL
SELECT 'scores', COUNT(*) FROM scores
UNION ALL
SELECT 'audit_log', COUNT(*) FROM audit_log;
