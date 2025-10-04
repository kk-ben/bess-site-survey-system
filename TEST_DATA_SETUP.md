# テストデータセットアップガイド

## 📊 テストデータの概要

日本の実際の地域（関東・関西・九州）を想定した、リアルなBESS候補地データを用意しました。

### データ内容

| カテゴリ | 件数 | 説明 |
|---------|------|------|
| **ユーザー** | 3名 | admin, manager, viewer |
| **候補地** | 23箇所 | 関東8、関西6、九州9 |
| **変電所** | 14箇所 | 各地域の主要変電所 |
| **設備** | 13箇所 | 高速道路IC、港湾施設 |
| **電柱** | 7本 | 候補地周辺のサンプル |
| **評価結果** | 9件 | 承認済みサイトの評価 |

### 候補地の分布

**関東エリア（8箇所）**
- 茨城県: 2箇所（つくば市、日立市）
- 千葉県: 2箇所（市原市、銚子市）
- 埼玉県: 2箇所（熊谷市、深谷市）
- 群馬県: 1箇所（太田市）
- 栃木県: 1箇所（宇都宮市）

**関西エリア（6箇所）**
- 大阪府: 2箇所（堺市、泉佐野市）
- 兵庫県: 2箇所（姫路市、加古川市）
- 和歌山県: 1箇所（和歌山市）
- 三重県: 1箇所（四日市市）

**九州エリア（9箇所）**
- 福岡県: 2箇所（北九州市、大牟田市）
- 佐賀県: 1箇所（鳥栖市）
- 長崎県: 1箇所（佐世保市）
- 熊本県: 1箇所（八代市）
- 大分県: 1箇所（大分市）
- 鹿児島県: 1箇所（鹿児島市）

### ステータス分布

- **approved（承認済み）**: 9箇所 - 評価完了、高スコア
- **evaluated（評価済み）**: 8箇所 - 評価完了、検討中
- **pending（未評価）**: 6箇所 - 評価待ち

---

## 🚀 セットアップ手順

### ステップ1: Supabaseにアクセス

1. https://supabase.com にアクセス
2. プロジェクトを選択
3. 左メニューから **SQL Editor** をクリック

### ステップ2: テストデータを投入

1. **New query** をクリック
2. `bess-site-survey-system/database/test-data.sql` の内容をコピー
3. SQL Editorに貼り付け
4. **Run** をクリック（実行時間: 約10-20秒）

### ステップ3: データ確認

SQLの最後に確認クエリが含まれています。実行結果で以下を確認：

```
table_name    | count
--------------+-------
Users         | 3
Sites         | 23
Grid Assets   | 14
Amenities     | 13
Poles         | 7
Evaluations   | 9
```

---

## 🔐 テストユーザー

すべてのユーザーのパスワードは `admin123` です。

| Email | パスワード | 役割 | 権限 |
|-------|-----------|------|------|
| admin@example.com | admin123 | 管理者 | 全機能アクセス可能 |
| manager@example.com | admin123 | マネージャー | データ取込・編集可能 |
| viewer@example.com | admin123 | 閲覧者 | 閲覧のみ |

---

## 📍 主要な候補地データ

### 優良候補地（スコア90以上）

1. **大阪府堺市 臨海工業地帯**
   - 容量: 25.0 MW
   - スコア: 94点
   - 変電所まで: 650m
   - ステータス: 承認済み

2. **兵庫県姫路市 工業団地**
   - 容量: 22.0 MW
   - スコア: 93点
   - 変電所まで: 580m
   - ステータス: 承認済み

3. **大分県大分市 臨海工業地帯**
   - 容量: 21.0 MW
   - スコア: 91点
   - 変電所まで: 680m
   - ステータス: 承認済み

### 大規模候補地（20MW以上）

1. **福岡県北九州市 工業地帯**: 28.0 MW
2. **大阪府堺市 臨海工業地帯**: 25.0 MW
3. **兵庫県姫路市 工業団地**: 22.0 MW
4. **大分県大分市 臨海工業地帯**: 21.0 MW
5. **茨城県日立市 臨海工業地帯**: 20.0 MW

---

## 🧪 動作確認

### 1. ダッシュボードで確認

https://bess-site-survey-system.vercel.app にアクセス

- 総候補地数: 23
- 評価済み: 17
- 承認済み: 9
- 未評価: 6

### 2. 候補地管理で確認

左メニュー → **候補地管理**

- 23件の候補地が表示される
- ステータスでフィルタリング可能
- 地域別に分類されている

### 3. スクリーニングで確認

左メニュー → **スクリーニング**

以下の条件で絞り込みテスト：

**テスト1: 大規模候補地**
- 最小容量: 20 MW
- 結果: 5箇所

**テスト2: 優良候補地**
- 最小スコア: 90点
- ステータス: 承認済み
- 結果: 4箇所

**テスト3: 関東エリア**
- 住所に「茨城」「千葉」「埼玉」を含む
- 結果: 6箇所

---

## 📊 データ分析クエリ

### 地域別の容量合計

```sql
SELECT 
    CASE 
        WHEN address LIKE '%茨城%' OR address LIKE '%千葉%' OR address LIKE '%埼玉%' 
             OR address LIKE '%群馬%' OR address LIKE '%栃木%' THEN '関東'
        WHEN address LIKE '%大阪%' OR address LIKE '%兵庫%' OR address LIKE '%和歌山%' 
             OR address LIKE '%三重%' THEN '関西'
        WHEN address LIKE '%福岡%' OR address LIKE '%佐賀%' OR address LIKE '%長崎%' 
             OR address LIKE '%熊本%' OR address LIKE '%大分%' OR address LIKE '%鹿児島%' THEN '九州'
        ELSE 'その他'
    END as region,
    COUNT(*) as site_count,
    ROUND(SUM(capacity_mw), 2) as total_capacity_mw,
    ROUND(AVG(capacity_mw), 2) as avg_capacity_mw
FROM sites
GROUP BY region
ORDER BY total_capacity_mw DESC;
```

### 評価スコア上位10件

```sql
SELECT 
    s.name,
    s.address,
    s.capacity_mw,
    e.total_score,
    e.grid_distance_m,
    s.status
FROM sites s
JOIN evaluations e ON s.id = e.site_id
ORDER BY e.total_score DESC
LIMIT 10;
```

### 変電所からの距離が近い候補地

```sql
SELECT 
    s.name,
    s.address,
    e.grid_distance_m,
    e.grid_score,
    s.status
FROM sites s
JOIN evaluations e ON s.id = e.site_id
WHERE e.grid_distance_m < 700
ORDER BY e.grid_distance_m ASC;
```

---

## 🔄 データのリセット

テストデータを削除して最初からやり直す場合：

```sql
-- 評価結果を削除
DELETE FROM evaluations;

-- 候補地を削除
DELETE FROM sites WHERE name LIKE '%県%';

-- 送電網資産を削除
DELETE FROM grid_assets WHERE name LIKE '%変電所%';

-- 設備を削除
DELETE FROM amenities;

-- 電柱を削除
DELETE FROM poles;

-- テストユーザーを削除（管理者以外）
DELETE FROM users WHERE email != 'admin@example.com';
```

その後、`test-data.sql` を再実行してください。

---

## 📝 次のステップ

1. ✅ テストデータ投入完了
2. 🔍 各機能の動作確認
3. 🗺️ 地図表示機能の実装
4. 📊 レポート機能の追加
5. 🚀 本番データの投入

---

## 💡 カスタマイズ

### 独自の候補地を追加

```sql
INSERT INTO sites (name, location, address, capacity_mw, status, created_by)
VALUES (
    '新規候補地名',
    ST_GeogFromText('POINT(経度 緯度)'),  -- 例: POINT(139.6917 35.6895)
    '住所',
    容量,  -- 例: 15.5
    'pending',
    (SELECT id FROM users WHERE email = 'admin@example.com')
);
```

### 座標の調べ方

1. Google Mapsで場所を検索
2. 右クリック → 座標をコピー
3. 形式: `緯度, 経度` → `POINT(経度 緯度)` に変換

例: 
- Google Maps: `35.6895, 139.6917`
- SQL: `POINT(139.6917 35.6895)`

---

## 🆘 トラブルシューティング

### エラー: "duplicate key value violates unique constraint"

既にデータが存在しています。リセット手順を実行してから再投入してください。

### エラー: "function st_geogfromtext does not exist"

PostGIS拡張が有効化されていません。以下を実行：

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### データが表示されない

1. RLSポリシーを確認
2. ユーザーが認証されているか確認
3. ブラウザのコンソールでエラーを確認

---

## 📞 サポート

問題が解決しない場合は、以下を確認：

1. Supabaseのログ（Logs & Reports）
2. ブラウザのコンソール（F12）
3. 実行したSQLとエラーメッセージ
