# 🚀 オンライン環境デプロイ手順

## 現在の状態
- ✅ Supabaseアカウント: 作成済み
- ✅ ローカル環境: 動作確認済み
- ⏳ オンラインデプロイ: これから実施

---

## ステップ1: Supabaseプロジェクトの作成

### 1.1 プロジェクト作成
1. https://supabase.com/dashboard にアクセス
2. 「New Project」をクリック
3. 以下の設定で作成:
   - **Name**: `bess-survey-system`
   - **Database Password**: 強力なパスワードを生成（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)`
   - **Pricing Plan**: Free

### 1.2 プロジェクト情報の取得
プロジェクト作成後（2-3分かかります）、以下の情報を取得:

1. Settings → Database → Connection string
   - **Connection string**: コピーしてメモ
   - **Connection pooling**: コピーしてメモ

2. Settings → API
   - **Project URL**: コピーしてメモ
   - **anon public**: コピーしてメモ
   - **service_role**: コピーしてメモ

---

## ステップ2: データベースのセットアップ

### 2.1 PostGIS拡張の有効化
1. Supabase Dashboard → SQL Editor
2. 「New query」をクリック
3. 以下を実行:

```sql
-- PostGIS拡張を有効化
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- バージョン確認
SELECT PostGIS_version();
```

### 2.2 スキーマの作成
1. ローカルの `database/migrations/001_initial_schema.sql` を開く
2. 内容をコピー
3. Supabase SQL Editorに貼り付けて実行

---

## ステップ3: Vercelへのデプロイ

### 3.1 Vercel CLIのインストール（まだの場合）
```bash
npm i -g vercel
vercel login
```

### 3.2 バックエンドのデプロイ
```bash
cd bess-site-survey-system
vercel
```

プロンプトに従って設定:
- Project name: `bess-survey-api`
- Framework: `Other`
- Build command: `npm run build`
- Output directory: `dist`

### 3.3 環境変数の設定
```bash
# Supabaseから取得した接続文字列を使用
vercel env add DATABASE_URL production

# その他の環境変数
vercel env add JWT_SECRET production
vercel env add NODE_ENV production
```

### 3.4 フロントエンドのデプロイ
```bash
cd frontend
vercel
```

プロンプトに従って設定:
- Project name: `bess-survey-frontend`
- Framework: `Vite`

---

## ステップ4: 動作確認

### 4.1 バックエンドのテスト
```bash
curl https://your-backend-url.vercel.app/health
```

### 4.2 フロントエンドのアクセス
ブラウザで `https://your-frontend-url.vercel.app` を開く

---

## 次のステップ

準備ができたら、以下を実行してください：
1. Supabaseプロジェクトの作成
2. 接続情報の取得
3. 私に接続情報を共有（パスワードは伏せ字でOK）

その後、自動デプロイスクリプトを実行します！
