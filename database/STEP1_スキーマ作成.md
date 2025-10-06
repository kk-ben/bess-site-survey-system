# 🚨 ステップ1: v2.0スキーマ作成

## 問題

エラー: `column "latitude" of relation "sites" does not exist`

これは、Supabaseにv2.0スキーマが作成されていないためです。

---

## ✅ 解決方法

### 1. Supabaseにログイン

1. ブラウザで https://supabase.com を開く
2. プロジェクトを選択

### 2. SQL Editorを開く

1. 左サイドバーの「SQL Editor」をクリック
2. 右上の「New query」ボタンをクリック

### 3. v2.0スキーマSQLをコピー

以下のファイルを開いてください：

```
bess-site-survey-system/database/migrations/002_normalized_schema.sql
```

**全文をコピー**してください（Ctrl+A → Ctrl+C）

### 4. Supabaseで実行

1. Supabase SQL Editorに貼り付け（Ctrl+V）
2. 右下の「Run」ボタンをクリック
3. 実行完了を待つ（10〜20秒）

### 5. 成功確認

画面下部に「Success. No rows returned」と表示されればOK！

---

## 📊 作成されるテーブル（10個）

実行後、以下のテーブルが作成されます：

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

## 🔍 テーブル確認方法

1. 左サイドバーの「Table Editor」をクリック
2. 上記10個のテーブルが表示されることを確認

---

## ⚠️ トラブルシューティング

### エラー: "extension postgis does not exist"

SQL Editorで以下を実行：
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

その後、再度スキーマSQLを実行してください。

### エラー: "relation users already exists"

既存のusersテーブルがある場合は正常です。問題ありません。

---

## 🎯 次のステップ

スキーマ作成が完了したら、次はテストデータを投入します：

```
bess-site-survey-system/database/v2-test-data.sql
```

このファイルを同じ手順でSupabase SQL Editorで実行してください。

---

## 📞 サポート

スキーマ作成が完了したら、「スキーマ作成完了しました」と教えてください！
次のステップ（テストデータ投入）に進みます。
