# Supabase v2.0 Schema Setup Guide

## 🎯 概要

BESS Site Survey System v2.0の正規化スキーマをSupabaseで実行するガイドです。

## 📋 前提条件

- Supabaseアカウント（無料プランでOK）
- プロジェクトが作成済み

## 🚀 セットアップ手順

### ステップ1: Supabaseにログイン

1. https://supabase.com にアクセス
2. プロジェクトを選択（または新規作成）

### ステップ2: SQL Editorを開く

1. 左サイドバーから「SQL Editor」をクリック
2. 「New query」をクリック

### ステップ3: v2.0スキーマを実行

1. `database/migrations/002_normalized_schema.sql` の内容をコピー
2. SQL Editorに貼り付け
3. 右下の「Run」ボタンをクリック

### ステップ4: 実行結果を確認

成功すると以下のテーブルが作成されます：

```
✅ sites                  - 候補地点の基本台帳
✅ grid_info             - 系統/電力系データ
✅ geo_risk              - 地理リスク
✅ land_regulatory       - 法規制
✅ access_physical       - 物理条件
✅ economics             - 経済性
✅ automation_sources    - 自動化ソース管理
✅ scores                - スコア履歴
✅ audit_log             - 監査ログ
✅ users                 - ユーザー管理
```

### ステップ5: テーブル確認

1. 左サイドバーから「Table Editor」をクリック
2. 上記のテーブルが表示されることを確認

## 🔑 接続情報の取得

### API設定を取得

1. 左サイドバーから「Settings」→「API」をクリック
2. 以下の情報をコピー：

```
Project URL:     https://xxxxx.supabase.co
anon public key: eyJhbGc...
service_role:    eyJhbGc... (管理用)
```

### 環境変数に設定

`bess-site-survey-system/.env` ファイルを作成：

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Database Connection (Direct)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

## 🧪 動作確認

### SQL Editorでテストクエリ実行

```sql
-- サンプルサイトを作成
INSERT INTO sites (site_code, name, address, lat, lon, area_m2, status)
VALUES (
    'STB2025-000001',
    'テストサイト1',
    '東京都千代田区丸の内1-1-1',
    35.6812,
    139.7671,
    5000,
    'draft'
);

-- 作成されたサイトを確認
SELECT * FROM sites;

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

-- JOINで確認
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

## 📊 v2.0スキーマの特徴

### 1. 正規化設計
- 1サイト = 複数の関連テーブル
- データの重複を排除
- 柔軟な拡張性

### 2. 自動化レベル管理
各テーブルに `automation_level` カラム：
- `AUTO`: 完全自動取得
- `SEMI`: 半自動（要レビュー）
- `MANUAL`: 手動入力

### 3. 監査ログ
すべての変更を `audit_log` テーブルに記録

### 4. スコア履歴
`scores` テーブルで時系列のスコア変化を追跡

## 🔐 Row Level Security (RLS) 設定

### 基本的なRLSポリシー

```sql
-- sitesテーブルのRLS有効化
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは全て読み取り可能
CREATE POLICY "Allow authenticated read access"
ON sites FOR SELECT
TO authenticated
USING (true);

-- 管理者のみ書き込み可能
CREATE POLICY "Allow admin write access"
ON sites FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);
```

## 🎯 次のステップ

1. ✅ Supabaseでv2.0スキーマ実行 ← 今ここ
2. 🔄 VPSにv2.0 APIをデプロイ
3. 🧪 v2.0 APIの動作確認
4. 🚀 フロントエンドv2.0対応

## 📝 トラブルシューティング

### エラー: "extension postgis does not exist"

```sql
-- PostGIS拡張を有効化
CREATE EXTENSION IF NOT EXISTS postgis;
```

### エラー: "relation users already exists"

既存のusersテーブルがある場合は正常です。スキップされます。

### パスワードハッシュの生成

デフォルト管理者のパスワードを変更する場合：

```javascript
// Node.jsで実行
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash('your-password', 10);
console.log(hash);
```

## 🆘 サポート

問題が発生した場合：
1. SQL Editorのエラーメッセージを確認
2. Table Editorでテーブル一覧を確認
3. Settings → Database → Connection stringで接続情報を確認
