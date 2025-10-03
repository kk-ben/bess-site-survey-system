# 🚀 Supabase + Vercel - 本番環境セットアップガイド

## 📋 概要

本番環境は以下の構成で構築します：

```
Vercel（フロントエンド + バックエンドAPI）
    ↓
Supabase（PostgreSQL + PostGIS）
    ↓
Upstash（Redis）
```

---

## 🗄️ ステップ1: Supabaseプロジェクトの作成

### 1.1 アカウント作成とプロジェクト作成

1. [Supabase](https://supabase.com)にアクセス
2. 「Start your project」をクリック
3. GitHubアカウントでサインイン
4. 「New Project」をクリック

### 1.2 プロジェクト設定

- **Name**: `bess-survey-production`
- **Database Password**: 強力なパスワードを生成（保存しておく）
- **Region**: `Northeast Asia (Tokyo)` を選択
- **Pricing Plan**: Free（開始時）→ Pro（必要に応じて）

「Create new project」をクリック（数分かかります）

### 1.3 PostGIS拡張の有効化

1. Supabase Dashboard → SQL Editor
2. 「New query」をクリック
3. 以下のSQLを実行:

```sql
-- PostGIS拡張を有効化
CREATE EXTENSION IF NOT EXISTS postgis;

-- バージョン確認
SELECT PostGIS_version();
```

### 1.4 データベーススキーマの作成

1. `database/migrations/001_initial_schema.sql`の内容をコピー
2. SQL Editorに貼り付けて実行

```sql
-- ここに001_initial_schema.sqlの内容を貼り付け
```

### 1.5 Row Level Security（RLS）の設定

```sql
-- ユーザーテーブルのRLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- サイトテーブルのRLS
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sites"
ON sites FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert sites"
ON sites FOR INSERT
TO authenticated
WITH CHECK (true);

-- 他のテーブルも同様に設定
```

### 1.6 接続情報の取得

1. Settings → Database
2. 「Connection string」セクションで以下をコピー:
   - **URI**: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
   - **Connection pooling**: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true`

---

## 📦 ステップ2: Upstash Redis の設定

### 2.1 アカウント作成

1. [Upstash](https://upstash.com)にアクセス
2. GitHubアカウントでサインイン

### 2.2 Redisデータベースの作成

1. 「Create Database」をクリック
2. 設定:
   - **Name**: `bess-survey-redis`
   - **Type**: Regional
   - **Region**: `ap-northeast-1 (Tokyo)`
   - **TLS**: Enabled

3. 「Create」をクリック

### 2.3 接続情報の取得

1. Database Details → REST API
2. 以下をコピー:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**

---

## 🌐 ステップ3: Vercel（フロントエンド）のデプロイ

### 3.1 Vercel CLIのインストール

```bash
# Vercel CLIをインストール
npm i -g vercel

# ログイン
vercel login
```

### 3.2 フロントエンドのデプロイ

```bash
# プロジェクトディレクトリに移動
cd bess-site-survey-system/frontend

# Vercelにデプロイ
vercel

# プロジェクト設定
# ? Set up and deploy "~/bess-site-survey-system/frontend"? [Y/n] y
# ? Which scope do you want to deploy to? [あなたのアカウント]
# ? Link to existing project? [N/y] n
# ? What's your project's name? bess-survey-frontend
# ? In which directory is your code located? ./
```

### 3.3 環境変数の設定

```bash
# 本番環境の環境変数を設定
vercel env add VITE_API_BASE_URL production
# 値を入力: https://bess-survey-api.vercel.app/api/v1

vercel env add VITE_GOOGLE_MAPS_API_KEY production
# 値を入力: your_google_maps_api_key_here
```

### 3.4 本番デプロイ

```bash
# 本番環境にデプロイ
vercel --prod
```

デプロイ完了後、URLが表示されます（例: `https://bess-survey-frontend.vercel.app`）

---

## 🔧 ステップ4: Vercel（バックエンド）のデプロイ

### 4.1 バックエンドのデプロイ

```bash
# ルートディレクトリに移動
cd ..

# Vercelにデプロイ
vercel

# プロジェクト設定
# ? Set up and deploy "~/bess-site-survey-system"? [Y/n] y
# ? Which scope do you want to deploy to? [あなたのアカウント]
# ? Link to existing project? [N/y] n
# ? What's your project's name? bess-survey-api
# ? In which directory is your code located? ./
```

### 4.2 環境変数の設定

```bash
# データベース接続（Supabase）
vercel env add DATABASE_URL production
# 値: postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true

# Redis接続（Upstash）
vercel env add REDIS_URL production
# 値: [UPSTASH_REDIS_REST_URL]

vercel env add REDIS_TOKEN production
# 値: [UPSTASH_REDIS_REST_TOKEN]

# JWT設定
vercel env add JWT_SECRET production
# 値: [32文字以上のランダム文字列]

vercel env add JWT_REFRESH_SECRET production
# 値: [別の32文字以上のランダム文字列]

# 環境設定
vercel env add NODE_ENV production
# 値: production

vercel env add PORT production
# 値: 4000

# CORS設定
vercel env add CORS_ORIGIN production
# 値: https://bess-survey-frontend.vercel.app

# Google Maps API
vercel env add GOOGLE_MAPS_API_KEY production
# 値: your_google_maps_api_key_here

# ログ設定
vercel env add LOG_LEVEL production
# 値: info

# レート制限
vercel env add RATE_LIMIT_WINDOW_MS production
# 値: 900000

vercel env add RATE_LIMIT_MAX_REQUESTS production
# 値: 100
```

### 4.3 本番デプロイ

```bash
# 本番環境にデプロイ
vercel --prod
```

---

## 🔗 ステップ5: カスタムドメインの設定

### 5.1 フロントエンドのドメイン設定

1. Vercel Dashboard → bess-survey-frontend → Settings → Domains
2. 「Add」をクリック
3. ドメインを入力: `bess.your-domain.com`
4. DNSレコードを設定:

```
Type: CNAME
Name: bess
Value: cname.vercel-dns.com
```

### 5.2 バックエンドのドメイン設定

1. Vercel Dashboard → bess-survey-api → Settings → Domains
2. 「Add」をクリック
3. ドメインを入力: `api.bess.your-domain.com`
4. DNSレコードを設定:

```
Type: CNAME
Name: api.bess
Value: cname.vercel-dns.com
```

### 5.3 環境変数の更新

```bash
# フロントエンドのAPI URLを更新
cd frontend
vercel env rm VITE_API_BASE_URL production
vercel env add VITE_API_BASE_URL production
# 値: https://api.bess.your-domain.com/api/v1

# バックエンドのCORS設定を更新
cd ..
vercel env rm CORS_ORIGIN production
vercel env add CORS_ORIGIN production
# 値: https://bess.your-domain.com

# 再デプロイ
cd frontend
vercel --prod
cd ..
vercel --prod
```

---

## ✅ ステップ6: 動作確認

### 6.1 ヘルスチェック

```bash
# バックエンドAPI
curl https://api.bess.your-domain.com/api/v1/health

# レスポンス例
{
  "status": "ok",
  "timestamp": "2025-10-03T12:00:00.000Z",
  "database": "connected",
  "redis": "connected"
}
```

### 6.2 ブラウザでアクセス

1. `https://bess.your-domain.com` を開く
2. 初期ログイン:
   - Email: `admin@example.com`
   - Password: `admin123`

---

## 📊 ステップ7: 監視とログ

### 7.1 Vercel Analytics

1. Vercel Dashboard → Analytics
2. 自動的にトラフィック、パフォーマンスを監視

### 7.2 Supabase Monitoring

1. Supabase Dashboard → Database → Logs
2. クエリパフォーマンス、エラーログを確認

### 7.3 Sentry（エラー追跡）

```bash
# Sentryをインストール
npm install @sentry/node @sentry/tracing

# 環境変数を追加
vercel env add SENTRY_DSN production
# 値: [SentryのDSN]
```

---

## 🔄 ステップ8: CI/CDの設定（GitHub Actions）

### 8.1 GitHubリポジトリとの連携

1. Vercel Dashboard → Settings → Git
2. 「Connect Git Repository」をクリック
3. GitHubリポジトリを選択

### 8.2 自動デプロイの設定

- **main ブランチ**: 本番環境に自動デプロイ
- **develop ブランチ**: プレビュー環境に自動デプロイ

---

## 💰 コスト最適化

### Free Tierの制限

**Supabase Free:**
- データベース: 500MB
- ストレージ: 1GB
- 帯域幅: 2GB/月
- API リクエスト: 無制限

**Vercel Free:**
- 帯域幅: 100GB/月
- ビルド時間: 6,000分/月
- サーバーレス実行: 100GB-時間/月

**Upstash Free:**
- コマンド数: 10,000/日
- データサイズ: 256MB

### Pro Tierへのアップグレード

**必要になるタイミング:**
- データベースが500MBを超える
- 月間トラフィックが増加
- より高いパフォーマンスが必要

**コスト:**
- Supabase Pro: $25/月
- Vercel Pro: $20/月
- Upstash Pro: $10/月

**合計: 約$55/月（約7,500円）**

---

## 🔒 セキュリティ強化

### 環境変数の暗号化

Vercelは自動的に環境変数を暗号化します。

### Supabase RLSの確認

```sql
-- RLSが有効か確認
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### レート制限の設定

Vercelの設定ファイル `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🛠️ メンテナンス

### アプリケーションの更新

```bash
# コードを更新
git add .
git commit -m "Update feature"
git push origin main

# Vercelが自動的にデプロイ
```

### データベースのバックアップ

Supabaseは自動的に毎日バックアップを作成します。

手動バックアップ:
1. Supabase Dashboard → Database → Backups
2. 「Create backup」をクリック

### ロールバック

```bash
# Vercelでロールバック
vercel rollback
```

---

## 📈 スケーリング

### 水平スケーリング

Vercelは自動的にスケーリングします。

### データベースのスケーリング

1. Supabase Dashboard → Settings → Billing
2. Proプランにアップグレード
3. Compute Add-onsで性能を追加

---

## 🚨 トラブルシューティング

### デプロイエラー

```bash
# ログを確認
vercel logs

# 環境変数を確認
vercel env ls
```

### データベース接続エラー

1. Supabase Dashboard → Settings → Database
2. 接続文字列を確認
3. IPアドレス制限を確認（Vercelは動的IPなので制限なし）

### パフォーマンス問題

1. Vercel Analytics でボトルネックを特定
2. Supabase Dashboard → Database → Query Performance
3. インデックスの追加を検討

---

## 📞 サポート

- **Supabase**: [Discord](https://discord.supabase.com)
- **Vercel**: [サポートページ](https://vercel.com/support)
- **Upstash**: [Discord](https://discord.gg/w9SenAtbme)

---

**本番環境の構築完了！🎉**

次のステップ:
1. 監視ダッシュボードの確認
2. パフォーマンステスト
3. セキュリティ監査
4. ユーザーへの公開

**Happy Deploying! 🚀**
