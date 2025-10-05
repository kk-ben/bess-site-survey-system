-- ============================================================================
-- BESS Site Survey System - Normalized Schema v2.0
-- 正規化スキーマ：自動化レベル対応・将来拡張可能
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- 1. Sites Table (候補地点の基本台帳)
-- インポート起点：住所 + 緯度経度（農地青地・ハザード除外済）
-- ============================================================================

CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_code TEXT UNIQUE NOT NULL,                      -- 例: STB2025-000001
    name TEXT,                                           -- 任意の表示名
    address TEXT NOT NULL,                               -- 住所（インポート元）
    lat DOUBLE PRECISION NOT NULL,                       -- 緯度（インポート元）
    lon DOUBLE PRECISION NOT NULL,                       -- 経度（インポート元）
    area_m2 NUMERIC,                                     -- 面積（あれば）
    land_right_status TEXT,                              -- 所有/賃貸/交渉中 など
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'rejected')),
    priority_rank TEXT,                                  -- A/B/C等
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_sites_latlon ON sites (lat, lon);
CREATE INDEX idx_sites_status ON sites (status);
CREATE INDEX idx_sites_code ON sites (site_code);
CREATE INDEX idx_sites_priority ON sites (priority_rank);

-- ============================================================================
-- 2. Grid Info Table (系統/電力系データ)
-- 空容量、変電所距離、接続コスト等
-- ============================================================================

CREATE TABLE grid_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    target_voltage_kv NUMERIC,                           -- 66/77/154/275 etc
    substation_distance_m NUMERIC,                       -- 変電所距離
    line_distance_m NUMERIC,                             -- 送電線距離（任意）
    capacity_available_mw NUMERIC,                       -- 空き容量MW
    congestion_level TEXT CHECK (congestion_level IN ('low', 'medium', 'high')),
    connection_cost_jpy NUMERIC,                         -- 接続コスト試算
    reinforcement_plan TEXT,                             -- 将来増強計画メモ
    automation_level TEXT NOT NULL CHECK (automation_level IN ('AUTO', 'SEMI', 'MANUAL')),
    updated_from_source_at TIMESTAMP WITH TIME ZONE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_grid_site ON grid_info (site_id);
CREATE INDEX idx_grid_automation ON grid_info (automation_level);

-- ============================================================================
-- 3. Geo Risk Table (ハザード/標高/勾配等の地理リスク)
-- ============================================================================

CREATE TABLE geo_risk (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    elevation_m NUMERIC,                                 -- 標高
    slope_pct NUMERIC,                                   -- 勾配(%)
    flood_depth_class TEXT,                              -- 0.5m未満/2m未満/5m超 等
    liquefaction_risk TEXT CHECK (liquefaction_risk IN ('low', 'medium', 'high')),
    sun_hours_loss NUMERIC,                              -- 影の影響率 (Solar API)
    automation_level TEXT NOT NULL CHECK (automation_level IN ('AUTO', 'SEMI', 'MANUAL')),
    updated_from_source_at TIMESTAMP WITH TIME ZONE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_geo_site ON geo_risk (site_id);
CREATE INDEX idx_geo_automation ON geo_risk (automation_level);

-- ============================================================================
-- 4. Land Regulatory Table (都市計画/用途/条例等の法規制)
-- ============================================================================

CREATE TABLE land_regulatory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    city_plan_zone TEXT,                                 -- 市街化調整/非線引き 等
    land_use_zone TEXT,                                  -- 用途地域（該当あれば）
    farmland_class TEXT,                                 -- 農振除外/白地/保全 等
    cultural_env_zone TEXT,                              -- 文化財/保護区域
    park_landscape_zone TEXT,                            -- 自然公園/風致 等
    local_ordinances TEXT,                               -- 自治体独自規制の要点
    build_restrictions TEXT,                             -- 建築/開発許可の要点
    automation_level TEXT NOT NULL CHECK (automation_level IN ('AUTO', 'SEMI', 'MANUAL')),
    updated_from_source_at TIMESTAMP WITH TIME ZONE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_reg_site ON land_regulatory (site_id);
CREATE INDEX idx_reg_automation ON land_regulatory (automation_level);

-- ============================================================================
-- 5. Access Physical Table (アクセス道路/形状/面積等の物理条件)
-- ============================================================================

CREATE TABLE access_physical (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    parcel_shape TEXT,                                   -- 長方形/不整形
    road_access TEXT,                                    -- 有/無 + 幅員m
    nearest_road_width_m NUMERIC,
    inside_setback_need TEXT,                            -- 要/不要/不明
    neighbor_clearance_e NUMERIC,                        -- 東側離隔(m)
    neighbor_clearance_w NUMERIC,                        -- 西側離隔(m)
    neighbor_clearance_n NUMERIC,                        -- 北側離隔(m)
    neighbor_clearance_s NUMERIC,                        -- 南側離隔(m)
    automation_level TEXT NOT NULL CHECK (automation_level IN ('AUTO', 'SEMI', 'MANUAL')),
    updated_from_source_at TIMESTAMP WITH TIME ZONE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_access_site ON access_physical (site_id);
CREATE INDEX idx_access_automation ON access_physical (automation_level);

-- ============================================================================
-- 6. Economics Table (用地価格/賃料/接続・工事コスト等)
-- ============================================================================

CREATE TABLE economics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    land_price_jpy_per_m2 NUMERIC,
    land_rent_jpy_per_tsubo_month NUMERIC,
    connection_cost_estimate_jpy NUMERIC,                -- 再掲可（gridと別に積算版）
    construction_cost_estimate_jpy NUMERIC,
    planned_power_mw NUMERIC,                            -- 例: 2 (MW)
    planned_energy_mwh NUMERIC,                          -- 例: 8 (MWh)
    expected_capacity_factor_pct NUMERIC,                -- 稼働率
    automation_level TEXT NOT NULL CHECK (automation_level IN ('AUTO', 'SEMI', 'MANUAL')),
    updated_from_source_at TIMESTAMP WITH TIME ZONE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_econ_site ON economics (site_id);
CREATE INDEX idx_econ_automation ON economics (automation_level);

-- ============================================================================
-- 7. Automation Sources Table (取得元API/URL/PDF とリフレッシュ管理)
-- ============================================================================

CREATE TABLE automation_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,                            -- 例: 'geo_risk'
    field_name TEXT NOT NULL,                            -- 例: 'elevation_m'
    source_type TEXT CHECK (source_type IN ('API', 'PDF', 'CSV', 'Manual', 'Scraper')),
    source_name TEXT,                                    -- Google Elevation API 等
    source_url TEXT,                                     -- 参照URL or ファイルパス
    last_refreshed_at TIMESTAMP WITH TIME ZONE,
    refresh_interval_hours INT,                          -- 自動更新間隔
    parser_version TEXT,                                 -- スクレイパー/ワークフロー版
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_auto_src_site ON automation_sources (site_id);
CREATE INDEX idx_auto_src_table ON automation_sources (table_name, field_name);
CREATE INDEX idx_auto_src_refresh ON automation_sources (last_refreshed_at);

-- ============================================================================
-- 8. Scores Table (自動スコア・優先度)
-- ============================================================================

CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    score_total NUMERIC,                                 -- 総合スコア
    score_grid NUMERIC,
    score_geo NUMERIC,
    score_regulatory NUMERIC,
    score_access NUMERIC,
    score_economics NUMERIC,
    grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
    formula_version TEXT,                                -- スコア式の版管理
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_scores_site ON scores (site_id);
CREATE INDEX idx_scores_total ON scores (score_total DESC);
CREATE INDEX idx_scores_grade ON scores (grade);
CREATE INDEX idx_scores_calculated ON scores (calculated_at DESC);

-- ============================================================================
-- 9. Audit Log Table (変更履歴：誰が・いつ・何を)
-- ============================================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    actor TEXT,                                          -- 更新者（ユーザ or バッチ）
    table_name TEXT,
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_audit_site ON audit_log (site_id);
CREATE INDEX idx_audit_table ON audit_log (table_name);
CREATE INDEX idx_audit_changed ON audit_log (changed_at DESC);

-- ============================================================================
-- 10. Users Table (既存のusersテーブルと互換性維持)
-- ============================================================================

-- 既存のusersテーブルがある場合はスキップ
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'viewer')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- Triggers for updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grid_info_updated_at BEFORE UPDATE ON grid_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_geo_risk_updated_at BEFORE UPDATE ON geo_risk
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_land_regulatory_updated_at BEFORE UPDATE ON land_regulatory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_access_physical_updated_at BEFORE UPDATE ON access_physical
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_economics_updated_at BEFORE UPDATE ON economics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_sources_updated_at BEFORE UPDATE ON automation_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Sample Data (Optional)
-- ============================================================================

-- デフォルトの管理者ユーザー（パスワード: admin123）
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
    'admin@example.com',
    '$2b$10$rQ8K5O.V5y5Z5Z5Z5Z5Z5uO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5',
    'System Administrator',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE sites IS '候補地点の基本台帳（インポート起点）';
COMMENT ON TABLE grid_info IS '系統/電力系データ（空容量等）';
COMMENT ON TABLE geo_risk IS 'ハザード/標高/勾配等の地理リスク';
COMMENT ON TABLE land_regulatory IS '都市計画/用途/条例等の法規制';
COMMENT ON TABLE access_physical IS 'アクセス道路/形状/面積等の物理条件';
COMMENT ON TABLE economics IS '用地価格/賃料/接続・工事コスト等';
COMMENT ON TABLE automation_sources IS '取得元(API/URL/PDF)とリフレッシュ管理';
COMMENT ON TABLE scores IS '自動スコア・優先度';
COMMENT ON TABLE audit_log IS '変更履歴（誰が・いつ・何を）';

COMMENT ON COLUMN grid_info.automation_level IS 'AUTO: 完全自動, SEMI: 半自動（要レビュー）, MANUAL: 手動入力';
COMMENT ON COLUMN geo_risk.automation_level IS 'AUTO: 完全自動, SEMI: 半自動（要レビュー）, MANUAL: 手動入力';
COMMENT ON COLUMN land_regulatory.automation_level IS 'AUTO: 完全自動, SEMI: 半自動（要レビュー）, MANUAL: 手動入力';
COMMENT ON COLUMN access_physical.automation_level IS 'AUTO: 完全自動, SEMI: 半自動（要レビュー）, MANUAL: 手動入力';
COMMENT ON COLUMN economics.automation_level IS 'AUTO: 完全自動, SEMI: 半自動（要レビュー）, MANUAL: 手動入力';
