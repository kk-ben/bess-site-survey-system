-- ============================================================================
-- BESS Site Survey System v2.0 - Performance Optimization Indexes
-- ============================================================================
-- 作成日: 2025-01-06
-- 目的: クエリパフォーマンスの最適化

-- ============================================================================
-- 1. Sites テーブルのインデックス
-- ============================================================================

-- ステータスでのフィルタリング用（頻繁に使用）
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status) WHERE deleted_at IS NULL;

-- 優先度ランクでのフィルタリング用
CREATE INDEX IF NOT EXISTS idx_sites_priority_rank ON sites(priority_rank) WHERE deleted_at IS NULL;

-- 作成日時での並び替え用
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at DESC) WHERE deleted_at IS NULL;

-- 更新日時での並び替え用
CREATE INDEX IF NOT EXISTS idx_sites_updated_at ON sites(updated_at DESC) WHERE deleted_at IS NULL;

-- サイトコードでの検索用（ユニーク制約があるが明示的に）
CREATE INDEX IF NOT EXISTS idx_sites_site_code ON sites(site_code) WHERE deleted_at IS NULL;

-- 地理座標での検索用（空間インデックス）
CREATE INDEX IF NOT EXISTS idx_sites_location ON sites USING GIST (
  ll_to_earth(lat, lon)
) WHERE deleted_at IS NULL;

-- 複合インデックス: ステータス + 優先度ランク
CREATE INDEX IF NOT EXISTS idx_sites_status_priority ON sites(status, priority_rank) 
WHERE deleted_at IS NULL;

-- 複合インデックス: ステータス + 作成日時
CREATE INDEX IF NOT EXISTS idx_sites_status_created ON sites(status, created_at DESC) 
WHERE deleted_at IS NULL;

-- ============================================================================
-- 2. Grid Info テーブルのインデックス
-- ============================================================================

-- site_idでの結合用（外部キー）
CREATE INDEX IF NOT EXISTS idx_grid_info_site_id ON grid_info(site_id);

-- 自動化レベルでのフィルタリング用
CREATE INDEX IF NOT EXISTS idx_grid_info_automation ON grid_info(automation_level);

-- 電圧レベルでのフィルタリング用
CREATE INDEX IF NOT EXISTS idx_grid_info_voltage ON grid_info(target_voltage_kv);

-- 変電所距離での並び替え用
CREATE INDEX IF NOT EXISTS idx_grid_info_distance ON grid_info(substation_distance_m);

-- 利用可能容量での並び替え用
CREATE INDEX IF NOT EXISTS idx_grid_info_capacity ON grid_info(capacity_available_mw);

-- ============================================================================
-- 3. Geo Risk テーブルのインデックス
-- ============================================================================

-- site_idでの結合用
CREATE INDEX IF NOT EXISTS idx_geo_risk_site_id ON geo_risk(site_id);

-- 自動化レベルでのフィルタリング用
CREATE INDEX IF NOT EXISTS idx_geo_risk_automation ON geo_risk(automation_level);

-- 液状化リスクでのフィルタリング用
CREATE INDEX IF NOT EXISTS idx_geo_risk_liquefaction ON geo_risk(liquefaction_risk);

-- 標高での並び替え用
CREATE INDEX IF NOT EXISTS idx_geo_risk_elevation ON geo_risk(elevation_m);

-- ============================================================================
-- 4. Scores テーブルのインデックス
-- ============================================================================

-- site_idでの結合用
CREATE INDEX IF NOT EXISTS idx_scores_site_id ON scores(site_id);

-- 総合スコアでの並び替え用
CREATE INDEX IF NOT EXISTS idx_scores_total ON scores(score_total DESC);

-- グレードでのフィルタリング用
CREATE INDEX IF NOT EXISTS idx_scores_grade ON scores(grade);

-- 計算日時での並び替え用
CREATE INDEX IF NOT EXISTS idx_scores_calculated_at ON scores(calculated_at DESC);

-- 複合インデックス: site_id + 計算日時（最新スコア取得用）
CREATE INDEX IF NOT EXISTS idx_scores_site_latest ON scores(site_id, calculated_at DESC);

-- ============================================================================
-- 5. Audit Logs テーブルのインデックス
-- ============================================================================

-- site_idでの検索用
CREATE INDEX IF NOT EXISTS idx_audit_logs_site_id ON audit_logs(site_id);

-- アクターでの検索用
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor);

-- テーブル名でのフィルタリング用
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);

-- 変更日時での並び替え用
CREATE INDEX IF NOT EXISTS idx_audit_logs_changed_at ON audit_logs(changed_at DESC);

-- 複合インデックス: site_id + 変更日時
CREATE INDEX IF NOT EXISTS idx_audit_logs_site_changed ON audit_logs(site_id, changed_at DESC);

-- ============================================================================
-- 6. Automation Sources テーブルのインデックス
-- ============================================================================

-- site_idでの検索用
CREATE INDEX IF NOT EXISTS idx_automation_sources_site_id ON automation_sources(site_id);

-- テーブル名 + フィールド名での検索用
CREATE INDEX IF NOT EXISTS idx_automation_sources_table_field 
ON automation_sources(table_name, field_name);

-- 更新日時での並び替え用
CREATE INDEX IF NOT EXISTS idx_automation_sources_updated ON automation_sources(last_updated DESC);

-- ============================================================================
-- 7. パフォーマンス統計の更新
-- ============================================================================

-- 統計情報を更新してクエリプランナーを最適化
ANALYZE sites;
ANALYZE grid_info;
ANALYZE geo_risk;
ANALYZE land_regulatory;
ANALYZE access_physical;
ANALYZE economics;
ANALYZE scores;
ANALYZE audit_logs;
ANALYZE automation_sources;

-- ============================================================================
-- 8. インデックス使用状況の確認用ビュー
-- ============================================================================

CREATE OR REPLACE VIEW v2_index_usage AS
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- ============================================================================
-- 9. テーブルサイズ確認用ビュー
-- ============================================================================

CREATE OR REPLACE VIEW v2_table_sizes AS
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================================================
-- 完了メッセージ
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Performance indexes created successfully';
    RAISE NOTICE '📊 Run: SELECT * FROM v2_index_usage; to check index usage';
    RAISE NOTICE '📊 Run: SELECT * FROM v2_table_sizes; to check table sizes';
END $$;
