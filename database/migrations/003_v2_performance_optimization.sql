-- ============================================================================
-- BESS Site Survey System v2.0 - Performance Optimization
-- ============================================================================
-- 作成日: 2025-01-06
-- 目的: v2.0システムのパフォーマンス最適化のためのインデックスとビュー

-- ============================================================================
-- 1. 追加インデックス作成
-- ============================================================================

-- サイト検索用の複合インデックス
CREATE INDEX IF NOT EXISTS idx_sites_status_priority 
ON sites(status, priority_rank) 
WHERE deleted_at IS NULL;

-- サイトコード検索用インデックス
CREATE INDEX IF NOT EXISTS idx_sites_site_code 
ON sites(site_code) 
WHERE deleted_at IS NULL;

-- 作成日時でのソート用インデックス
CREATE INDEX IF NOT EXISTS idx_sites_created_at_desc 
ON sites(created_at DESC) 
WHERE deleted_at IS NULL;

-- 更新日時でのソート用インデックス
CREATE INDEX IF NOT EXISTS idx_sites_updated_at_desc 
ON sites(updated_at DESC) 
WHERE deleted_at IS NULL;

-- スコアでのフィルタリング用インデックス
CREATE INDEX IF NOT EXISTS idx_scores_total_grade 
ON scores(score_total DESC, grade);

-- 最新スコア取得用インデックス
CREATE INDEX IF NOT EXISTS idx_scores_site_calculated 
ON scores(site_id, calculated_at DESC);

-- 自動化レベルでのフィルタリング用インデックス
CREATE INDEX IF NOT EXISTS idx_grid_info_automation 
ON grid_info(automation_level) 
WHERE automation_level IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_geo_risk_automation 
ON geo_risk(automation_level) 
WHERE automation_level IS NOT NULL;

-- 自動化ソース検索用インデックス
CREATE INDEX IF NOT EXISTS idx_automation_sources_site_table 
ON automation_sources(site_id, table_name, field_name);

-- 監査ログ検索用インデックス
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_action 
ON audit_logs(table_name, record_id, action, changed_at DESC);

-- 地理座標検索用インデックス（空間インデックス）
CREATE INDEX IF NOT EXISTS idx_sites_location 
ON sites USING GIST (
  ll_to_earth(lat, lon)
) WHERE lat IS NOT NULL AND lon IS NOT NULL;

-- ============================================================================
-- 2. マテリアライズドビュー作成（高速集計用）
-- ============================================================================

-- サイト統計ビュー
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_site_statistics AS
SELECT 
  COUNT(*) as total_sites,
  COUNT(*) FILTER (WHERE status = 'draft') as draft_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE priority_rank = 'S') as priority_s_count,
  COUNT(*) FILTER (WHERE priority_rank = 'A') as priority_a_count,
  COUNT(*) FILTER (WHERE priority_rank = 'B') as priority_b_count,
  COUNT(*) FILTER (WHERE priority_rank = 'C') as priority_c_count,
  AVG(area_m2) as avg_area,
  SUM(area_m2) as total_area,
  MAX(updated_at) as last_updated
FROM sites
WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX ON mv_site_statistics ((true));

-- 自動化統計ビュー
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_automation_statistics AS
SELECT 
  'grid_info' as table_name,
  automation_level,
  COUNT(*) as count
FROM grid_info
WHERE automation_level IS NOT NULL
GROUP BY automation_level
UNION ALL
SELECT 
  'geo_risk' as table_name,
  automation_level,
  COUNT(*) as count
FROM geo_risk
WHERE automation_level IS NOT NULL
GROUP BY automation_level;

CREATE INDEX ON mv_automation_statistics (table_name, automation_level);

-- スコア統計ビュー
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_score_statistics AS
SELECT 
  grade,
  COUNT(*) as count,
  AVG(score_total) as avg_score,
  MIN(score_total) as min_score,
  MAX(score_total) as max_score,
  AVG(score_grid) as avg_grid_score,
  AVG(score_geo) as avg_geo_score,
  AVG(score_regulatory) as avg_regulatory_score,
  AVG(score_access) as avg_access_score,
  AVG(score_economics) as avg_economics_score
FROM (
  SELECT DISTINCT ON (site_id)
    site_id,
    score_total,
    score_grid,
    score_geo,
    score_regulatory,
    score_access,
    score_economics,
    grade
  FROM scores
  ORDER BY site_id, calculated_at DESC
) latest_scores
GROUP BY grade;

CREATE INDEX ON mv_score_statistics (grade);

-- ============================================================================
-- 3. マテリアライズドビュー更新関数
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_site_statistics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_automation_statistics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_score_statistics;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. 自動更新トリガー（オプション）
-- ============================================================================

-- サイト更新時にマテリアライズドビューを更新
CREATE OR REPLACE FUNCTION trigger_refresh_site_statistics()
RETURNS trigger AS $$
BEGIN
  -- 非同期でマテリアライズドビューを更新（パフォーマンス考慮）
  PERFORM pg_notify('refresh_mv', 'site_statistics');
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_site_change
AFTER INSERT OR UPDATE OR DELETE ON sites
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_site_statistics();

-- ============================================================================
-- 5. パフォーマンス分析用関数
-- ============================================================================

-- スロークエリ分析用関数
CREATE OR REPLACE FUNCTION analyze_slow_queries()
RETURNS TABLE (
  query text,
  calls bigint,
  total_time double precision,
  mean_time double precision,
  max_time double precision
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    query,
    calls,
    total_exec_time as total_time,
    mean_exec_time as mean_time,
    max_exec_time as max_time
  FROM pg_stat_statements
  WHERE query NOT LIKE '%pg_stat_statements%'
  ORDER BY mean_exec_time DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- テーブルサイズ分析用関数
CREATE OR REPLACE FUNCTION analyze_table_sizes()
RETURNS TABLE (
  table_name text,
  row_count bigint,
  total_size text,
  table_size text,
  indexes_size text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    n_live_tup as row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as indexes_size
  FROM pg_stat_user_tables
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- インデックス使用状況分析用関数
CREATE OR REPLACE FUNCTION analyze_index_usage()
RETURNS TABLE (
  table_name text,
  index_name text,
  index_scans bigint,
  rows_read bigint,
  rows_fetched bigint,
  index_size text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname || '.' || tablename as table_name,
    indexrelname as index_name,
    idx_scan as index_scans,
    idx_tup_read as rows_read,
    idx_tup_fetch as rows_fetched,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
  FROM pg_stat_user_indexes
  ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. VACUUM と ANALYZE の推奨設定
-- ============================================================================

-- 自動VACUUM設定の最適化（必要に応じて調整）
ALTER TABLE sites SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE scores SET (
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

ALTER TABLE audit_logs SET (
  autovacuum_vacuum_scale_factor = 0.2,
  autovacuum_analyze_scale_factor = 0.1
);

-- ============================================================================
-- 7. 統計情報の更新
-- ============================================================================

ANALYZE sites;
ANALYZE grid_info;
ANALYZE geo_risk;
ANALYZE land_regulatory;
ANALYZE access_physical;
ANALYZE economics;
ANALYZE scores;
ANALYZE automation_sources;
ANALYZE audit_logs;

-- ============================================================================
-- 完了メッセージ
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Performance optimization migration completed successfully!';
  RAISE NOTICE 'Created indexes: 12';
  RAISE NOTICE 'Created materialized views: 3';
  RAISE NOTICE 'Created analysis functions: 3';
  RAISE NOTICE 'Run "SELECT refresh_materialized_views();" to update statistics';
END $$;
