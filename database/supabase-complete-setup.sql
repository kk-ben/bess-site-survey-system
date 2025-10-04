-- ============================================
-- BESS Site Survey System - Supabase完全セットアップ
-- ============================================
-- このSQLファイルをSupabase SQL Editorで実行してください
-- 実行時間: 約1-2分

-- ============================================
-- ステップ1: 拡張機能の有効化
-- ============================================

-- PostGIS拡張（地理空間データ用）
CREATE EXTENSION IF NOT EXISTS postgis;

-- UUID生成用
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 確認
SELECT PostGIS_version();

-- ============================================
-- ステップ2: テーブル作成
-- ============================================

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- サイトテーブル
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    address TEXT,
    capacity_mw DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'pending',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 送電網資産テーブル
CREATE TABLE IF NOT EXISTS grid_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    capacity_mw DECIMAL(10,2),
    voltage_kv DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 設備テーブル
CREATE TABLE IF NOT EXISTS amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 電柱テーブル
CREATE TABLE IF NOT EXISTS poles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    type VARCHAR(50),
    height_m DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 評価結果テーブル
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    grid_distance_m DECIMAL(10,2),
    grid_score INTEGER,
    pole_distance_m DECIMAL(10,2),
    pole_score INTEGER,
    road_distance_m DECIMAL(10,2),
    road_score INTEGER,
    setback_distance_m DECIMAL(10,2),
    setback_score INTEGER,
    total_score INTEGER,
    evaluation_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ステップ3: インデックス作成（パフォーマンス向上）
-- ============================================

-- 地理空間インデックス
CREATE INDEX IF NOT EXISTS idx_sites_location ON sites USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_grid_assets_location ON grid_assets USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_amenities_location ON amenities USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_poles_location ON poles USING GIST(location);

-- 通常のインデックス
CREATE INDEX IF NOT EXISTS idx_sites_status ON sites(status);
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at);
CREATE INDEX IF NOT EXISTS idx_evaluations_site_id ON evaluations(site_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- ステップ4: Row Level Security（RLS）の設定
-- ============================================

-- RLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE grid_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE poles ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

-- ポリシー作成（認証済みユーザーは全てアクセス可能）
-- ユーザーテーブル
CREATE POLICY IF NOT EXISTS "Authenticated users can view users" 
ON users FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY IF NOT EXISTS "Users can update own profile" 
ON users FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

-- サイトテーブル
CREATE POLICY IF NOT EXISTS "Authenticated users can view sites" 
ON sites FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can insert sites" 
ON sites FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can update sites" 
ON sites FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can delete sites" 
ON sites FOR DELETE 
TO authenticated 
USING (true);

-- 送電網資産テーブル
CREATE POLICY IF NOT EXISTS "Authenticated users can view grid_assets" 
ON grid_assets FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can manage grid_assets" 
ON grid_assets FOR ALL 
TO authenticated 
USING (true);

-- 設備テーブル
CREATE POLICY IF NOT EXISTS "Authenticated users can view amenities" 
ON amenities FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can manage amenities" 
ON amenities FOR ALL 
TO authenticated 
USING (true);

-- 電柱テーブル
CREATE POLICY IF NOT EXISTS "Authenticated users can view poles" 
ON poles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can manage poles" 
ON poles FOR ALL 
TO authenticated 
USING (true);

-- 評価結果テーブル
CREATE POLICY IF NOT EXISTS "Authenticated users can view evaluations" 
ON evaluations FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY IF NOT EXISTS "Authenticated users can manage evaluations" 
ON evaluations FOR ALL 
TO authenticated 
USING (true);

-- ============================================
-- ステップ5: 初期データの投入
-- ============================================

-- 管理者ユーザーを作成
-- パスワード: admin123
INSERT INTO users (email, password_hash, name, role)
VALUES (
    'admin@example.com',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'System Administrator',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- サンプルサイトデータ（東京）
INSERT INTO sites (name, location, address, capacity_mw, status)
VALUES (
    'Tokyo Sample Site 1',
    ST_GeogFromText('POINT(139.6917 35.6895)'),
    '東京都新宿区',
    10.5,
    'active'
)
ON CONFLICT DO NOTHING;

-- サンプル送電網資産（東京近郊）
INSERT INTO grid_assets (name, type, location, capacity_mw, voltage_kv)
VALUES (
    'Tokyo Substation 1',
    'substation',
    ST_GeogFromText('POINT(139.7 35.7)'),
    50.0,
    154.0
)
ON CONFLICT DO NOTHING;

-- ============================================
-- ステップ6: 確認クエリ
-- ============================================

-- テーブル一覧を確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ユーザー数を確認
SELECT COUNT(*) as user_count FROM users;

-- サイト数を確認
SELECT COUNT(*) as site_count FROM sites;

-- PostGISバージョンを確認
SELECT PostGIS_version();

-- ============================================
-- セットアップ完了！
-- ============================================
-- 次のステップ: Vercelでアプリケーションをデプロイ
