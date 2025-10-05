# 📘 Supabase v2.0 スキーマ実行手順

## 🎯 これから行うこと

BESS Site Survey System v2.0の正規化スキーマをSupabaseで実行します。
所要時間：約5分

---

## ステップ1️⃣：Supabaseにログイン

1. ブラウザで https://supabase.com を開く
2. 「Sign in」をクリックしてログイン
3. プロジェクト一覧から使用するプロジェクトを選択
   - まだプロジェクトがない場合は「New Project」で作成

---

## ステップ2️⃣：SQL Editorを開く

1. 左サイドバーの「SQL Editor」をクリック
2. 右上の「New query」ボタンをクリック

---

## ステップ3️⃣：v2.0スキーマをコピー＆実行

### 3-1. スキーマファイルを開く

このファイルを開いてください：
```
bess-site-survey-system/database/migrations/002_normalized_schema.sql
```

### 3-2. 全文をコピー

- ファイルの内容を全選択（Ctrl+A）してコピー（Ctrl+C）

### 3-3. Supabaseに貼り付けて実行

1. Supabaseの SQL Editor に貼り付け（Ctrl+V）
2. 右下の「Run」ボタンをクリック
3. 実行完了を待つ（10〜20秒程度）

### 3-4. 成功確認

画面下部に「Success. No rows returned」と表示されればOK！

---

## ステップ4️⃣：テーブルが作成されたか確認

1. 左サイドバーの「Table Editor」をクリック
2. 以下の10個のテーブルが表示されることを確認：

```
✅ sites                  候補地点の基本台帳
✅ grid_info             系統/電力系データ
✅ geo_risk              地理リスク（ハザード等）
✅ land_regulatory       法規制（都市計画等）
✅ access_physical       物理条件（道路等）
✅ economics             経済性（価格・コスト）
✅ automation_sources    自動化ソース管理
✅ scores                スコア履歴
✅ audit_log             監査ログ
✅ users                 ユーザー管理
```

---

## ステップ5️⃣：接続情報を取得

### 5-1. API設定ページを開く

1. 左サイドバーの「Settings」をクリック
2. 「API」をクリック

### 5-2. 必要な情報をコピー

以下の3つをメモ帳などにコピーしておいてください：

```
📌 Project URL:
https://xxxxxxxxxxxxx.supabase.co

📌 anon public (公開用キー):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...

📌 service_role (管理用キー):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

### 5-3. データベースパスワードを確認

1. 「Settings」→「Database」をクリック
2. 「Connection string」セクションの「URI」をコピー
   - または「Database password」を確認

---

## ステップ6️⃣：環境変数ファイルを作成

### 6-1. .envファイルを作成

`bess-site-survey-system/.env` ファイルを作成して、以下を記入：

```bash
# Supabase設定
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# データベース直接接続（オプション）
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

⚠️ `[YOUR-PASSWORD]` は実際のパスワードに置き換えてください

---

## ステップ7️⃣：動作確認（テストデータ投入）

### 7-1. SQL Editorに戻る

左サイドバーの「SQL Editor」→「New query」

### 7-2. テストクエリを実行

以下をコピー＆貼り付けて「Run」：

```sql
-- テストサイトを1件作成
INSERT INTO sites (site_code, name, address, lat, lon, area_m2, status)
VALUES (
    'STB2025-000001',
    'テストサイト（東京駅）',
    '東京都千代田区丸の内1-9-1',
    35.6812,
    139.7671,
    5000,
    'draft'
);

-- Grid Infoを追加
INSERT INTO grid_info (
    site_id,
    target_voltage_kv,
    substation_distance_m,
    capacity_available_mw,
    automation_level
)
SELECT 
    id,
    66,
    1500,
    10.5,
    'MANUAL'
FROM sites WHERE site_code = 'STB2025-000001';

-- 確認クエリ
SELECT 
    s.site_code,
    s.name,
    s.address,
    g.target_voltage_kv,
    g.capacity_available_mw,
    g.automation_level
FROM sites s
LEFT JOIN grid_info g ON s.id = g.site_id;
```

### 7-3. 結果確認

テーブルに以下のようなデータが表示されればOK：

| site_code | name | address | target_voltage_kv | capacity_available_mw | automation_level |
|-----------|------|---------|-------------------|----------------------|------------------|
| STB2025-000001 | テストサイト（東京駅） | 東京都千代田区... | 66 | 10.5 | MANUAL |

---

## 🎉 完了！

v2.0スキーマのセットアップが完了しました！

---

## 📊 v2.0スキーマの特徴

### 1. 正規化設計
- 1つのサイトに対して複数の関連テーブル
- データの重複を排除
- 柔軟な拡張が可能

### 2. 自動化レベル管理
各テーブルに `automation_level` カラムがあります：
- `AUTO`：完全自動取得（Google API等）
- `SEMI`：半自動（要レビュー）
- `MANUAL`：手動入力

### 3. 監査ログ
すべての変更を `audit_log` テーブルに記録

### 4. スコア履歴
`scores` テーブルで時系列のスコア変化を追跡可能

---

## 🚀 次のステップ

1. ✅ Supabaseでv2.0スキーマ実行 ← 完了！
2. 🔄 VPSにv2.0 APIをデプロイ
3. 🧪 v2.0 APIの動作確認
4. 📱 フロントエンドv2.0対応

---

## ❓ トラブルシューティング

### エラー: "extension postgis does not exist"

SQL Editorで以下を実行：
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### エラー: "relation users already exists"

既存のusersテーブルがある場合は正常です。問題ありません。

### テーブルが表示されない

1. ブラウザをリフレッシュ（F5）
2. Table Editorで左上の「Refresh」ボタンをクリック

### パスワードがわからない

1. Settings → Database
2. 「Reset database password」で新しいパスワードを設定

---

## 📞 サポート

問題が解決しない場合は、以下を確認してください：
- SQL Editorのエラーメッセージ
- ブラウザのコンソールログ（F12キー）
- Supabaseのプロジェクト設定
