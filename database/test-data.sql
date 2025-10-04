-- ============================================
-- BESS Site Survey System - テストデータ
-- ============================================
-- 日本の実際の地域を想定したリアルなテストデータ
-- Supabase SQL Editorで実行してください

-- ============================================
-- 1. ユーザーデータ（追加）
-- ============================================

-- マネージャーユーザー
INSERT INTO users (email, password_hash, name, role)
VALUES 
    ('manager@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '田中 太郎', 'manager'),
    ('viewer@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '佐藤 花子', 'viewer')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. BESS候補地データ（関東・関西・九州）
-- ============================================

-- 関東エリア
INSERT INTO sites (name, location, address, capacity_mw, status, created_by)
VALUES 
    -- 茨城県（優良候補地）
    ('茨城県つくば市 工業団地跡地', ST_GeogFromText('POINT(140.0764 36.0839)'), '茨城県つくば市東光台5-19', 15.5, 'approved', (SELECT id FROM users WHERE email = 'admin@example.com')),
    ('茨城県日立市 臨海工業地帯', ST_GeogFromText('POINT(140.6514 36.5991)'), '茨城県日立市東滑川町5-1', 20.0, 'evaluated', (SELECT id FROM users WHERE email = 'admin@example.com')),
    
    -- 千葉県
    ('千葉県市原市 埋立地', ST_GeogFromText('POINT(140.1156 35.4980)'), '千葉県市原市五井南海岸1-1', 12.0, 'approved', (SELECT id FROM users WHERE email = 'admin@example.com')),
    ('千葉県銚子市 港湾地区', ST_GeogFromText('POINT(140.8267 35.7347)'), '千葉県銚子市川口町2-6528', 8.5, 'pending', (SELECT id FROM users WHERE email = 'manager@example.com')),
    
    -- 埼玉県
    ('埼玉県熊谷市 産業団地', ST_GeogFromText('POINT(139.3883 36.1477)'), '埼玉県熊谷市御稜威ヶ原201-1', 10.0, 'evaluated', (SELECT id FROM users WHERE email = 'admin@example.com')),
    ('埼玉県深谷市 農地転用地', ST_GeogFromText('POINT(139.2817 36.1971)'), '埼玉県深谷市上柴町西4-2-6', 7.5, 'pending', (SELECT id FROM users WHERE email = 'manager@example.com')),
    
    -- 群馬県
    ('群馬県太田市 工業用地', ST_GeogFromText('POINT(139.3736 36.2909)'), '群馬県太田市新田市野井町556-1', 18.0, 'approved', (SELECT id FROM users WHERE email = 'admin@example.com')),
    
    -- 栃木県
    ('栃木県宇都宮市 物流センター跡地', ST_GeogFromText('POINT(139.8836 36.5658)'), '栃木県宇都宮市平出工業団地38-1', 13.5, 'evaluated', (SELECT id FROM users WHERE email = 'admin@example.com'));

-- 関西エリア
INSERT INTO sites (name, location, address, capacity_mw, status, created_by)
VALUES 
    -- 大阪府
    ('大阪府堺市 臨海工業地帯', ST_GeogFromText('POINT(135.4297 34.5833)'), '大阪府堺市西区築港新町1-5-1', 25.0, 'approved', (SELECT id FROM users WHERE email = 'admin@example.com')),
    ('大阪府泉佐野市 埋立地', ST_GeogFromText('POINT(135.3100 34.4072)'), '大阪府泉佐野市りんくう往来北1', 16.0, 'evaluated', (SELECT id FROM users WHERE email = 'admin@example.com')),
    
    -- 兵庫県
    ('兵庫県姫路市 工業団地', ST_GeogFromText('POINT(134.6858 34.8167)'), '兵庫県姫路市網干区興浜1850', 22.0, 'approved', (SELECT id FROM users WHERE email = 'admin@example.com')),
    ('兵庫県加古川市 臨海部', ST_GeogFromText('POINT(134.8408 34.7569)'), '兵庫県加古川市金沢町1', 14.5, 'pending', (SELECT id FROM users WHERE email = 'manager@example.com')),
    
    -- 和歌山県
    ('和歌山県和歌山市 港湾地区', ST_GeogFromText('POINT(135.1675 34.2261)'), '和歌山県和歌山市湊1850', 11.0, 'evaluated', (SELECT id FROM users WHERE email = 'admin@example.com')),
    
    -- 三重県
    ('三重県四日市市 石油化学コンビナート隣接地', ST_GeogFromText('POINT(136.6256 34.9650)'), '三重県四日市市霞2-1-1', 19.5, 'approved', (SELECT id FROM users WHERE email = 'admin@example.com'));

-- 九州エリア
INSERT INTO sites (name, location, address, capacity_mw, status, created_by)
VALUES 
    -- 福岡県
    ('福岡県北九州市 工業地帯', ST_GeogFromText('POINT(130.8739 33.8839)'), '福岡県北九州市若松区響町1-62', 28.0, 'approved', (SELECT id FROM users WHERE email = 'admin@example.com')),
    ('福岡県大牟田市 臨海工業地帯', ST_GeogFromText('POINT(130.4456 33.0303)'), '福岡県大牟田市新港町1-3', 17.0, 'evaluated', (SELECT id FROM users WHERE email = 'admin@example.com')),
    
    -- 佐賀県
    ('佐賀県鳥栖市 物流団地', ST_GeogFromText('POINT(130.5058 33.3778)'), '佐賀県鳥栖市藤木町若桜3-5', 9.5, 'pending', (SELECT id FROM users WHERE email = 'manager@example.com')),
    
    -- 長崎県
    ('長崎県佐世保市 港湾地区', ST_GeogFromText('POINT(129.7147 33.1597)'), '長崎県佐世保市立神町2-1', 12.5, 'evaluated', (SELECT id FROM users WHERE email = 'admin@example.com')),
    
    -- 熊本県
    ('熊本県八代市 工業団地', ST_GeogFromText('POINT(130.6019 32.5050)'), '熊本県八代市港町299', 15.0, 'approved', (SELECT id FROM users WHERE email = 'admin@example.com')),
    
    -- 大分県
    ('大分県大分市 臨海工業地帯', ST_GeogFromText('POINT(131.6136 33.2381)'), '大分県大分市大字青崎1', 21.0, 'approved', (SELECT id FROM users WHERE email = 'admin@example.com')),
    
    -- 鹿児島県
    ('鹿児島県鹿児島市 港湾地区', ST_GeogFromText('POINT(130.5569 31.5969)'), '鹿児島県鹿児島市南栄1-1', 13.0, 'evaluated', (SELECT id FROM users WHERE email = 'admin@example.com'));

-- ============================================
-- 3. 送電網資産データ（変電所・送電線）
-- ============================================

-- 関東エリアの変電所
INSERT INTO grid_assets (name, type, location, capacity_mw, voltage_kv)
VALUES 
    ('新茨城変電所', 'substation', ST_GeogFromText('POINT(140.0900 36.0700)'), 500.0, 275.0),
    ('千葉火力変電所', 'substation', ST_GeogFromText('POINT(140.1000 35.5100)'), 800.0, 500.0),
    ('熊谷変電所', 'substation', ST_GeogFromText('POINT(139.3900 36.1400)'), 400.0, 154.0),
    ('太田変電所', 'substation', ST_GeogFromText('POINT(139.3800 36.2800)'), 350.0, 154.0),
    ('宇都宮変電所', 'substation', ST_GeogFromText('POINT(139.8900 36.5600)'), 450.0, 275.0);

-- 関西エリアの変電所
INSERT INTO grid_assets (name, type, location, capacity_mw, voltage_kv)
VALUES 
    ('堺港変電所', 'substation', ST_GeogFromText('POINT(135.4400 34.5800)'), 600.0, 275.0),
    ('姫路第二変電所', 'substation', ST_GeogFromText('POINT(134.6900 34.8100)'), 700.0, 500.0),
    ('和歌山変電所', 'substation', ST_GeogFromText('POINT(135.1700 34.2300)'), 400.0, 154.0),
    ('四日市変電所', 'substation', ST_GeogFromText('POINT(136.6300 34.9600)'), 550.0, 275.0);

-- 九州エリアの変電所
INSERT INTO grid_assets (name, type, location, capacity_mw, voltage_kv)
VALUES 
    ('北九州変電所', 'substation', ST_GeogFromText('POINT(130.8800 33.8800)'), 900.0, 500.0),
    ('大牟田変電所', 'substation', ST_GeogFromText('POINT(130.4500 33.0300)'), 500.0, 275.0),
    ('佐世保変電所', 'substation', ST_GeogFromText('POINT(129.7200 33.1600)'), 350.0, 154.0),
    ('八代変電所', 'substation', ST_GeogFromText('POINT(130.6100 32.5000)'), 400.0, 154.0),
    ('大分変電所', 'substation', ST_GeogFromText('POINT(131.6200 33.2400)'), 600.0, 275.0);

-- ============================================
-- 4. 道路・設備データ
-- ============================================

-- 主要道路（高速道路IC）
INSERT INTO amenities (name, type, location)
VALUES 
    ('常磐自動車道 谷田部IC', 'highway_ic', ST_GeogFromText('POINT(140.0800 36.0800)')),
    ('東関東自動車道 成田IC', 'highway_ic', ST_GeogFromText('POINT(140.3200 35.7700)')),
    ('関越自動車道 花園IC', 'highway_ic', ST_GeogFromText('POINT(139.1200 36.1200)')),
    ('名神高速道路 茨木IC', 'highway_ic', ST_GeogFromText('POINT(135.5700 34.8200)')),
    ('山陽自動車道 姫路東IC', 'highway_ic', ST_GeogFromText('POINT(134.7200 34.8400)')),
    ('九州自動車道 鳥栖IC', 'highway_ic', ST_GeogFromText('POINT(130.5100 33.3800)')),
    ('東九州自動車道 大分IC', 'highway_ic', ST_GeogFromText('POINT(131.6300 33.2500)'));

-- 港湾施設
INSERT INTO amenities (name, type, location)
VALUES 
    ('茨城港日立港区', 'port', ST_GeogFromText('POINT(140.6500 36.6000)')),
    ('千葉港', 'port', ST_GeogFromText('POINT(140.1100 35.6000)')),
    ('堺泉北港', 'port', ST_GeogFromText('POINT(135.4300 34.5800)')),
    ('姫路港', 'port', ST_GeogFromText('POINT(134.6800 34.8000)')),
    ('北九州港', 'port', ST_GeogFromText('POINT(130.8700 33.8900)')),
    ('大分港', 'port', ST_GeogFromText('POINT(131.6100 33.2400)'));

-- ============================================
-- 5. 電柱データ（サンプル）
-- ============================================

-- 各候補地周辺の電柱（簡略版）
INSERT INTO poles (location, type, height_m)
VALUES 
    -- つくば周辺
    (ST_GeogFromText('POINT(140.0750 36.0830)'), 'concrete', 12.0),
    (ST_GeogFromText('POINT(140.0770 36.0840)'), 'concrete', 12.0),
    (ST_GeogFromText('POINT(140.0780 36.0850)'), 'steel', 15.0),
    
    -- 堺市周辺
    (ST_GeogFromText('POINT(135.4290 34.5830)'), 'concrete', 12.0),
    (ST_GeogFromText('POINT(135.4300 34.5840)'), 'steel', 15.0),
    
    -- 北九州周辺
    (ST_GeogFromText('POINT(130.8730 33.8830)'), 'concrete', 12.0),
    (ST_GeogFromText('POINT(130.8740 33.8840)'), 'steel', 18.0);

-- ============================================
-- 6. 評価結果データ（サンプル）
-- ============================================

-- 承認済みサイトの評価結果
INSERT INTO evaluations (site_id, grid_distance_m, grid_score, pole_distance_m, pole_score, road_distance_m, road_score, setback_distance_m, setback_score, total_score, evaluation_status)
SELECT 
    id,
    CASE 
        WHEN name LIKE '%つくば%' THEN 850.0
        WHEN name LIKE '%堺市%' THEN 650.0
        WHEN name LIKE '%北九州%' THEN 720.0
        WHEN name LIKE '%姫路%' THEN 580.0
        WHEN name LIKE '%太田%' THEN 920.0
        WHEN name LIKE '%大分%' THEN 680.0
        WHEN name LIKE '%八代%' THEN 750.0
        ELSE 800.0
    END as grid_distance_m,
    CASE 
        WHEN name LIKE '%つくば%' THEN 85
        WHEN name LIKE '%堺市%' THEN 92
        WHEN name LIKE '%北九州%' THEN 88
        WHEN name LIKE '%姫路%' THEN 95
        WHEN name LIKE '%太田%' THEN 82
        WHEN name LIKE '%大分%' THEN 90
        WHEN name LIKE '%八代%' THEN 87
        ELSE 85
    END as grid_score,
    CASE 
        WHEN name LIKE '%つくば%' THEN 45.0
        WHEN name LIKE '%堺市%' THEN 38.0
        WHEN name LIKE '%北九州%' THEN 52.0
        ELSE 50.0
    END as pole_distance_m,
    CASE 
        WHEN name LIKE '%つくば%' THEN 95
        WHEN name LIKE '%堺市%' THEN 98
        WHEN name LIKE '%北九州%' THEN 92
        ELSE 90
    END as pole_score,
    CASE 
        WHEN name LIKE '%つくば%' THEN 120.0
        WHEN name LIKE '%堺市%' THEN 95.0
        WHEN name LIKE '%北九州%' THEN 110.0
        ELSE 100.0
    END as road_distance_m,
    CASE 
        WHEN name LIKE '%つくば%' THEN 88
        WHEN name LIKE '%堺市%' THEN 92
        WHEN name LIKE '%北九州%' THEN 90
        ELSE 85
    END as road_score,
    CASE 
        WHEN name LIKE '%つくば%' THEN 25.0
        WHEN name LIKE '%堺市%' THEN 30.0
        WHEN name LIKE '%北九州%' THEN 28.0
        ELSE 20.0
    END as setback_distance_m,
    CASE 
        WHEN name LIKE '%つくば%' THEN 90
        WHEN name LIKE '%堺市%' THEN 95
        WHEN name LIKE '%北九州%' THEN 92
        ELSE 85
    END as setback_score,
    CASE 
        WHEN name LIKE '%つくば%' THEN 89
        WHEN name LIKE '%堺市%' THEN 94
        WHEN name LIKE '%北九州%' THEN 90
        WHEN name LIKE '%姫路%' THEN 93
        WHEN name LIKE '%太田%' THEN 87
        WHEN name LIKE '%大分%' THEN 91
        WHEN name LIKE '%八代%' THEN 88
        ELSE 85
    END as total_score,
    'completed' as evaluation_status
FROM sites
WHERE status = 'approved';

-- ============================================
-- 7. データ確認クエリ
-- ============================================

-- 投入されたデータの確認
SELECT 
    'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Sites', COUNT(*) FROM sites
UNION ALL
SELECT 'Grid Assets', COUNT(*) FROM grid_assets
UNION ALL
SELECT 'Amenities', COUNT(*) FROM amenities
UNION ALL
SELECT 'Poles', COUNT(*) FROM poles
UNION ALL
SELECT 'Evaluations', COUNT(*) FROM evaluations;

-- ステータス別のサイト数
SELECT status, COUNT(*) as count, ROUND(AVG(capacity_mw), 2) as avg_capacity_mw
FROM sites
GROUP BY status
ORDER BY status;

-- 地域別のサイト数（都道府県別）
SELECT 
    CASE 
        WHEN address LIKE '%茨城%' THEN '茨城県'
        WHEN address LIKE '%千葉%' THEN '千葉県'
        WHEN address LIKE '%埼玉%' THEN '埼玉県'
        WHEN address LIKE '%群馬%' THEN '群馬県'
        WHEN address LIKE '%栃木%' THEN '栃木県'
        WHEN address LIKE '%大阪%' THEN '大阪府'
        WHEN address LIKE '%兵庫%' THEN '兵庫県'
        WHEN address LIKE '%和歌山%' THEN '和歌山県'
        WHEN address LIKE '%三重%' THEN '三重県'
        WHEN address LIKE '%福岡%' THEN '福岡県'
        WHEN address LIKE '%佐賀%' THEN '佐賀県'
        WHEN address LIKE '%長崎%' THEN '長崎県'
        WHEN address LIKE '%熊本%' THEN '熊本県'
        WHEN address LIKE '%大分%' THEN '大分県'
        WHEN address LIKE '%鹿児島%' THEN '鹿児島県'
        ELSE 'その他'
    END as prefecture,
    COUNT(*) as site_count,
    ROUND(SUM(capacity_mw), 2) as total_capacity_mw
FROM sites
GROUP BY prefecture
ORDER BY site_count DESC;

-- 評価スコアの分布
SELECT 
    CASE 
        WHEN total_score >= 90 THEN '優良 (90-100)'
        WHEN total_score >= 80 THEN '良好 (80-89)'
        WHEN total_score >= 70 THEN '可 (70-79)'
        ELSE '要改善 (<70)'
    END as score_range,
    COUNT(*) as count
FROM evaluations
GROUP BY score_range
ORDER BY MIN(total_score) DESC;

-- ============================================
-- テストデータ投入完了！
-- ============================================
-- 合計: 
-- - ユーザー: 3名
-- - 候補地: 23箇所
-- - 変電所: 14箇所
-- - 設備: 13箇所
-- - 電柱: 7本
-- - 評価結果: 承認済みサイト分
