-- ================================================
-- Supabase本番環境セットアップスクリプト
-- ================================================
-- このスクリプトをSupabase SQL Editorで実行してください
-- ================================================

-- ステップ1: 拡張機能の有効化
-- ================================================
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- 全文検索用

-- バージョン確認
SELECT 
    'PostGIS Version: ' || PostGIS_version() as info
UNION ALL
SELECT 
    'PostgreSQL Version: ' || version();

-- ステップ2: スキーマの作成
-- ================================================
-- 以下は database/migrations/001_initial_schema.sql の内容を
-- コピーして貼り付けてください

-- ステップ3: Row Level Security (RLS) の設定
-- ================================================

-- ユーザーテーブルのRLS
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のデータのみ閲覧可能
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (auth.uid()::text = id::text);

-- ユーザーは自分のデータのみ更新可能
DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (auth.uid()::text = id::text);

-- サイトテーブルのRLS
ALTER TABLE IF EXISTS sites ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーはすべてのサイトを閲覧可能
DROP POLICY IF EXISTS "Authenticated users can view sites" ON sites;
CREATE POLICY "Authenticated users can view sites"
ON sites FOR SELECT
TO authenticated
USING (true);

-- 認証済みユーザーはサイトを作成可能
DROP POLICY IF EXISTS "Authenticated users can insert sites" ON sites;
CREATE POLICY "Authenticated users can insert sites"
ON sites FOR INSERT
TO authenticated
WITH CHECK (true);

-- 認証済みユーザーはサイトを更新可能
DROP POLICY IF EXISTS "Authenticated users can update sites" ON sites;
CREATE POLICY "Authenticated users can update sites"
ON sites FOR UPDATE
TO authenticated
USING (true);

-- 認証済みユーザーはサイトを削除可能
DROP POLICY IF EXISTS "Authenticated users can delete sites" ON sites;
CREATE POLICY "Authenticated users can delete sites"
ON sites FOR DELETE
TO authenticated
USING (true);

-- grid_assetsテーブルのRLS
ALTER TABLE IF EXISTS grid_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view grid assets" ON grid_assets;
CREATE POLICY "Authenticated users can view grid assets"
ON grid_assets FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage grid assets" ON grid_assets;
CREATE POLICY "Authenticated users can manage grid assets"
ON grid_assets FOR ALL
TO authenticated
USING (true);

-- amenitiesテーブルのRLS
ALTER TABLE IF EXISTS amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view amenities" ON amenities;
CREATE POLICY "Authenticated users can view amenities"
ON amenities FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage amenities" ON amenities;
CREATE POLICY "Authenticated users can manage amenities"
ON amenities FOR ALL
TO authenticated
USING (true);

-- polesテーブルのRLS
ALTER TABLE IF EXISTS poles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view poles" ON poles;
CREATE POLICY "Authenticated users can view poles"
ON poles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage poles" ON poles;
CREATE POLICY "Authenticated users can manage poles"
ON poles FOR ALL
TO authenticated
USING (true);

-- evaluationsテーブルのRLS
ALTER TABLE IF EXISTS evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view evaluations" ON evaluations;
CREATE POLICY "Authenticated users can view evaluations"
ON evaluations FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage evaluations" ON evaluations;
CREATE POLICY "Authenticated users can manage evaluations"
ON evaluations FOR ALL
TO authenticated
USING (true);

-- ステップ4: インデックスの確認
-- ================================================
-- 既存のインデックスを確認
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ステップ5: 初期管理ユーザーの作成（オプション）
-- ================================================
-- パスワードは bcrypt でハッシュ化されている必要があります
-- 以下は例です。実際のパスワードハッシュに置き換えてください

-- INSERT INTO users (id, email, name, role, password_hash, created_at, updated_at)
-- VALUES (
--     uuid_generate_v4(),
--     'admin@example.com',
--     'System Administrator',
--     'admin',
--     '$2b$10$...',  -- bcryptハッシュ
--     NOW(),
--     NOW()
-- )
-- ON CONFLICT (email) DO NOTHING;

-- ステップ6: セットアップ完了確認
-- ================================================
SELECT 
    'Setup Complete!' as status,
    COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';

-- テーブル一覧
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- RLS有効化状況の確認
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ================================================
-- セットアップ完了！
-- ================================================
-- 次のステップ:
-- 1. 接続文字列を取得
-- 2. バックエンドの環境変数を設定
-- 3. Vercelにデプロイ
-- ================================================
