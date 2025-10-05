-- ============================================================================
-- v2.0スキーマ確認クエリ
-- ============================================================================

-- 1. テーブル一覧の確認
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. 各テーブルのレコード数確認
SELECT 'sites' as table_name, COUNT(*) as record_count FROM sites
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
SELECT 'automation_sources', COUNT(*) FROM automation_sources
UNION ALL
SELECT 'scores', COUNT(*) FROM scores
UNION ALL
SELECT 'audit_log', COUNT(*) FROM audit_log
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- 3. usersテーブルの確認（デフォルト管理者）
SELECT 
    email,
    full_name,
    role,
    is_active,
    created_at
FROM users;
