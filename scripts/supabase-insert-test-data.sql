-- BESS Site Survey System - テストデータ投入SQL
-- Supabase SQL Editorで実行してください

-- 1. テストユーザーを作成
INSERT INTO users (email, password_hash, name, role, created_at)
VALUES 
  ('admin@bess.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin', NOW()),
  ('user@bess.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test User', 'user', NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. テストサイトを作成
INSERT INTO sites (name, address, latitude, longitude, capacity_mw, status, created_at)
VALUES 
  ('東京テストサイト', '東京都千代田区丸の内1-1-1', 35.6762, 139.6503, 10.5, 'active', NOW()),
  ('大阪テストサイト', '大阪府大阪市北区梅田1-1-1', 34.6937, 135.5023, 15.0, 'pending', NOW()),
  ('福岡テストサイト', '福岡県福岡市博多区博多駅前1-1-1', 33.5904, 130.4017, 8.5, 'active', NOW()),
  ('名古屋テストサイト', '愛知県名古屋市中村区名駅1-1-1', 35.1706, 136.8816, 12.0, 'active', NOW()),
  ('札幌テストサイト', '北海道札幌市中央区北1条西1-1', 43.0642, 141.3469, 7.5, 'pending', NOW())
ON CONFLICT DO NOTHING;

-- 3. 確認クエリ
SELECT 
  'Users' as table_name, 
  COUNT(*) as count 
FROM users
UNION ALL
SELECT 
  'Sites' as table_name, 
  COUNT(*) as count 
FROM sites;

-- 4. 作成されたデータを表示
SELECT 
  id,
  name,
  address,
  capacity_mw,
  status,
  created_at
FROM sites
ORDER BY created_at DESC
LIMIT 10;
