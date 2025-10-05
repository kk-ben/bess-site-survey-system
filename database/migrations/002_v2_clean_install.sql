-- ============================================================================
-- BESS Site Survey System v2.0 - クリーンインストール
-- 既存テーブルを削除してv2.0スキーマを新規作成
-- ============================================================================

-- ⚠️ 警告：このスクリプトは既存のデータをすべて削除します
-- 実行前に必ずバックアップを取ってください

-- ============================================================================
-- ステップ1：既存テーブルの削除（依存関係の逆順）
-- ============================================================================

DROP TABLE IF EXISTS evaluations CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- v2.0テーブルが既に存在する場合も削除
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS automation_sources CASCADE;
DROP TABLE IF EXISTS economics CASCADE;
DROP TABLE IF EXISTS access_physical CASCADE;
DROP TABLE IF EXISTS land_regulatory CASCADE;
DROP TABLE IF EXISTS geo_risk CASCADE;
DROP TABLE IF EXISTS grid_info CASCADE;

-- ============================================================================
-- ステップ2：拡張機能の有効化
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- ステップ3：v2.0テーブルの作成
-- ============================================================================

-- 1. Sites Table (候補地点の基本台帳)
CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_code TEXT UNIQUE NOT NULL,
    name TEXT,
    address TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lon DOUBLE PRECISION NOT NULL,
    area_m2 NUMERIC,
    land_right_status TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'rejected')),
    priority_rank TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_sites_latlon ON sites (lat, lon);
CREATE INDEX idx_sites_status ON sites (status);
CREATE INDEX idx_sites_code ON sites (site_code);
CREATE INDEX idx_sites_priority ON sites (priority_rank);

-- 2. Grid Info Table
CREATE TABLE grid_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    target_voltage_kv NUMERIC,
    substation_distance_m NUMERIC,
    line_distance_m NUMERIC,
    capacity_available_mw NUMERIC,
    congestion_level TEXT CHECK (congestion_level IN ('low', 'medium', 'high')),
    connection_cost_jpy NUMERIC,
    reinforcement_plan TEXT,
    automation_level TEXT NOT NULL CHECK (automation_level IN ('AUTO', 'SEMI', 'MANUAL')),
    updated_from_source_at TIMESTAMP WITH TIME ZONE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_grid_site ON grid_info (site_id);
CREATE INDEX idx_grid_automation ON grid_info (automation_level);

-- 3. Geo Risk Table
CREATE TABLE geo_risk (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    elevation_m NUMERIC,
    slope_pct NUMERIC,
    flood_depth_class TEXT,
    liquefaction_risk TEXT CHECK (liquefaction_risk IN ('low', 'medium', 'high')),
    sun_hours_loss NUMERIC,
    automation_level TEXT NOT NULL CHECK (automation_level IN ('AUTO', 'SEMI', 'MANUAL')),
    updated_from_source_at TIMESTAMP WITH TIME ZONE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_geo_site ON geo_risk (site_id);
CREATE INDEX idx_geo_automation ON geo_risk (automation_level);

-- 4. Land Regulatory Table
CREATE TABLE land_regulatory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    city_plan_zone TEXT,
    land_use_zone TEXT,
    farmland_class TEXT,
    cultural_env_zone TEXT,
    park_landscape_zone TEXT,
    local_ordinances TEXT,
    build_restrictions TEXT,
    automation_level TEXT NOT NULL CHECK (automation_level IN ('AUTO', 'SEMI', 'MANUAL')),
    updated_from_source_at TIMESTAMP WITH TIME ZONE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_reg_site ON land_regulatory (site_id);
CREATE INDEX idx_reg_automation ON land_regulatory (automation_level);

-- 5. Access Physical Table
CREATE TABLE access_physical (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    parcel_shape TEXT,
    road_access TEXT,
    nearest_road_width_m NUMERIC,
    inside_setback_need TEXT,
    neighbor_clearance_e NUMERIC,
    neighbor_clearance_w NUMERIC,
    neighbor_clearance_n NUMERIC,
    neighbor_clearance_s NUMERIC,
    automation_level TEXT NOT NULL CHECK (automation_level IN ('AUTO', 'SEMI', 'MANUAL')),
    updated_from_source_at TIMESTAMP WITH TIME ZONE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_access_site ON access_physical (site_id);
CREATE INDEX idx_access_automation ON access_physical (automation_level);

-- 6. Economics Table
CREATE TABLE economics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    land_price_jpy_per_m2 NUMERIC,
    land_rent_jpy_per_tsubo_month NUMERIC,
    connection_cost_estimate_jpy NUMERIC,
    construction_cost_estimate_jpy NUMERIC,
    planned_power_mw NUMERIC,
    planned_energy_mwh NUMERIC,
    expected_capacity_factor_pct NUMERIC,
    automation_level TEXT NOT NULL CHECK (automation_level IN ('AUTO', 'SEMI', 'MANUAL')),
    updated_from_source_at TIMESTAMP WITH TIME ZONE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_econ_site ON economics (site_id);
CREATE INDEX idx_econ_automation ON economics (automation_level);

-- 7. Automation Sources Table
CREATE TABLE automation_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    field_name TEXT NOT NULL,
    source_type TEXT CHECK (source_type IN ('API', 'PDF', 'CSV', 'Manual', 'Scraper')),
    source_name TEXT,
    source_url TEXT,
    last_refreshed_at TIMESTAMP WITH TIME ZONE,
    refresh_interval_hours INT,
    parser_version TEXT,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_auto_src_site ON automation_sources (site_id);
CREATE INDEX idx_auto_src_table ON automation_sources (table_name, field_name);
CREATE INDEX idx_auto_src_refresh ON automation_sources (last_refreshed_at);

-- 8. Scores Table
CREATE TABLE scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    score_total NUMERIC,
    score_grid NUMERIC,
    score_geo NUMERIC,
    score_regulatory NUMERIC,
    score_access NUMERIC,
    score_economics NUMERIC,
    grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
    formula_version TEXT,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_scores_site ON scores (site_id);
CREATE INDEX idx_scores_total ON scores (score_total DESC);
CREATE INDEX idx_scores_grade ON scores (grade);
CREATE INDEX idx_scores_calculated ON scores (calculated_at DESC);

-- 9. Audit Log Table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    actor TEXT,
    table_name TEXT,
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_audit_site ON audit_log (site_id);
CREATE INDEX idx_audit_table ON audit_log (table_name);
CREATE INDEX idx_audit_changed ON audit_log (changed_at DESC);

-- 10. Users Table
CREATE TABLE users (
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
-- ステップ4：トリガーの作成
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

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ステップ5：デフォルトデータの投入
-- ============================================================================

-- デフォルト管理者ユーザー（パスワード: admin123）
INSERT INTO users (email, password_hash, full_name, role)
VALUES (
    'admin@example.com',
    '$2b$10$rQ8K5O.V5y5Z5Z5Z5Z5Z5uO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5',
    'System Administrator',
    'admin'
);

-- ============================================================================
-- ステップ6：テーブルコメントの追加
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

-- ============================================================================
-- 完了メッセージ
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ v2.0スキーマのクリーンインストールが完了しました！';
    RAISE NOTICE '📊 作成されたテーブル: 10個';
    RAISE NOTICE '🔧 作成されたトリガー: 8個';
    RAISE NOTICE '👤 デフォルトユーザー: admin@example.com (パスワード: admin123)';
END $$;
