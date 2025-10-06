# 📊 ステップ2: テストデータ投入（5分）

**デプロイURL確認済み**: ✅  
**次のステップ**: Supabaseにテストデータを投入

---

## 🎯 手順

### 1. Supabase SQL Editorにアクセス

1. https://supabase.com/dashboard にアクセス
2. プロジェクト「bess-site-survey-system」を選択
3. 左メニューから「SQL Editor」をクリック

### 2. テストデータSQLを実行

以下のSQLをコピーして、SQL Editorに貼り付けて実行：

```sql
-- ============================================
-- BESS Site Survey System v2.0 - テストデータ
-- ============================================

-- サイト基本情報
INSERT INTO sites (name, latitude, longitude, address, capacity_mw, status, created_by)
VALUES 
    ('茨城県つくば市 工業団地跡地', 36.0839, 140.0764, '茨城県つくば市東光台5-19', 15.5, 'approved', 'admin@example.com'),
    ('千葉県市原市 埋立地', 35.4980, 140.1156, '千葉県市原市五井南海岸1-1', 12.0, 'approved', 'admin@example.com'),
    ('大阪府堺市 臨海工業地帯', 34.5833, 135.4297, '大阪府堺市西区築港新町1-5-1', 25.0, 'evaluated', 'admin@example.com')
ON CONFLICT DO NOTHING;

-- Grid Info（系統情報）
INSERT INTO grid_info (site_id, distance_to_substation_m, voltage_kv, available_capacity_mw, connection_cost_estimate_jpy)
SELECT 
    id,
    CASE 
        WHEN name LIKE '%つくば%' THEN 850
        WHEN name LIKE '%市原%' THEN 1200
        WHEN name LIKE '%堺%' THEN 650
    END,
    CASE 
        WHEN name LIKE '%つくば%' THEN 66
        WHEN name LIKE '%市原%' THEN 154
        WHEN name LIKE '%堺%' THEN 154
    END,
    CASE 
        WHEN name LIKE '%つくば%' THEN 50.0
        WHEN name LIKE '%市原%' THEN 80.0
        WHEN name LIKE '%堺%' THEN 120.0
    END,
    CASE 
        WHEN name LIKE '%つくば%' THEN 450000000
        WHEN name LIKE '%市原%' THEN 680000000
        WHEN name LIKE '%堺%' THEN 380000000
    END
FROM sites
ON CONFLICT (site_id) DO NOTHING;

-- Geo Risk（地理的リスク）
INSERT INTO geo_risk (site_id, flood_risk_level, earthquake_risk_level, landslide_risk_level, tsunami_risk_level)
SELECT 
    id,
    CASE 
        WHEN name LIKE '%つくば%' THEN 'low'
        WHEN name LIKE '%市原%' THEN 'medium'
        WHEN name LIKE '%堺%' THEN 'low'
    END,
    CASE 
        WHEN name LIKE '%つくば%' THEN 'medium'
        WHEN name LIKE '%市原%' THEN 'high'
        WHEN name LIKE '%堺%' THEN 'medium'
    END,
    'low',
    CASE 
        WHEN name LIKE '%市原%' THEN 'medium'
        WHEN name LIKE '%堺%' THEN 'medium'
        ELSE 'none'
    END
FROM sites
ON CONFLICT (site_id) DO NOTHING;

-- Automation Tracking（自動化追跡）
INSERT INTO automation_tracking (site_id, last_automated_update, automation_status, data_sources)
SELECT 
    id,
    NOW(),
    'completed',
    ARRAY['osm', 'gsi', 'manual']
FROM sites
ON CONFLICT (site_id) DO NOTHING;

-- Audit Log（監査ログ）
INSERT INTO audit_log (site_id, action, changed_by, changes)
SELECT 
    id,
    'created',
    created_by,
    jsonb_build_object(
        'name', name,
        'capacity_mw', capacity_mw,
        'status', status
    )
FROM sites;

-- Score History（スコア履歴）
INSERT INTO score_history (site_id, overall_score, grid_score, geo_score, economic_score, calculated_by)
SELECT 
    id,
    CASE 
        WHEN name LIKE '%つくば%' THEN 85.5
        WHEN name LIKE '%市原%' THEN 78.2
        WHEN name LIKE '%堺%' THEN 92.3
    END,
    CASE 
        WHEN name LIKE '%つくば%' THEN 88.0
        WHEN name LIKE '%市原%' THEN 75.5
        WHEN name LIKE '%堺%' THEN 95.0
    END,
    CASE 
        WHEN name LIKE '%つくば%' THEN 90.0
        WHEN name LIKE '%市原%' THEN 72.0
        WHEN name LIKE '%堺%' THEN 88.0
    END,
    CASE 
        WHEN name LIKE '%つくば%' THEN 78.5
        WHEN name LIKE '%市原%' THEN 85.0
        WHEN name LIKE '%堺%' THEN 94.0
    END,
    'system'
FROM sites;
```

### 3. 実行ボタンをクリック

「Run」または「実行」ボタンをクリックしてSQLを実行

### 4. 結果を確認

成功メッセージが表示されることを確認：
- `INSERT 0 3` (sites)
- `INSERT 0 3` (grid_info)
- `INSERT 0 3` (geo_risk)
- など

---

## ✅ データ確認

### Table Editorで確認

1. 左メニューから「Table Editor」をクリック
2. 「sites」テーブルを選択
3. 3件のサイトデータが表示されることを確認

### 投入されたデータ

1. **茨城県つくば市 工業団地跡地**
   - 容量: 15.5 MW
   - スコア: 85.5

2. **千葉県市原市 埋立地**
   - 容量: 12.0 MW
   - スコア: 78.2

3. **大阪府堺市 臨海工業地帯**
   - 容量: 25.0 MW
   - スコア: 92.3

---

## 🎯 次のステップ: システム動作確認

テストデータ投入が完了したら、フロントエンドで確認：

1. **ログイン**
   - URL: https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app/login
   - テストユーザーでログイン（Supabaseで作成）

2. **サイト一覧表示**
   - ダッシュボードにアクセス
   - 3件のサイトが表示されることを確認

3. **サイト詳細表示**
   - サイトをクリック
   - 詳細情報が表示されることを確認

4. **地図表示**
   - 地図上にマーカーが表示されることを確認

---

## 🔧 トラブルシューティング

### エラー: "relation does not exist"

**原因**: テーブルが作成されていない

**解決**: 
1. `database/migrations/001_initial_schema.sql` を実行
2. スキーマが正しく作成されているか確認

### エラー: "duplicate key value"

**原因**: データが既に存在する

**解決**: 
- `ON CONFLICT DO NOTHING` により、既存データはスキップされます
- 問題ありません

### データが表示されない

**原因**: フロントエンドがAPIに接続できていない

**解決**:
1. VPS APIが稼働しているか確認: `http://153.121.61.164:3000/api/v2/health`
2. Vercelの環境変数を確認
3. ブラウザのコンソールでエラーを確認

---

## 📊 完了チェックリスト

- [ ] Supabase SQL Editorにアクセス
- [ ] テストデータSQLを実行
- [ ] 成功メッセージを確認
- [ ] Table Editorで3件のサイトを確認
- [ ] フロントエンドでログイン
- [ ] サイト一覧が表示されることを確認

---

**次**: システム全体の動作確認とテスト
