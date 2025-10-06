# BESS Site Survey System v2.0 - デプロイガイド

## 📋 目次

1. [事前準備](#事前準備)
2. [Supabaseセットアップ](#supabaseセットアップ)
3. [環境変数設定](#環境変数設定)
4. [ローカルテスト](#ローカルテスト)
5. [本番デプロイ](#本番デプロイ)
6. [デプロイ後の確認](#デプロイ後の確認)
7. [トラブルシューティング](#トラブルシューティング)

---

## 事前準備

### 必要なアカウント

- [ ] Supabase アカウント（無料プランでOK）
- [ ] Vercel アカウント（フロントエンド用）
- [ ] VPS または Heroku アカウント（バックエンド用）
- [ ] Google Maps API キー（オプション）

### 必要なツール

```bash
# Node.js (v20以上)
node -v

# npm (v9以上)
npm -v

# Git
git --version
```

---

## Supabaseセットアップ

### 1. プロジェクト作成

1. [Supabase](https://supabase.com)にログイン
2. 「New Project」をクリック
3. プロジェクト情報を入力
   - Name: `bess-site-survey-v2`
   - Database Password: 強力なパスワードを設定
   - Region: `Northeast Asia (Tokyo)`

### 2. データベーススキーマ作成

#### 方法A: SQL Editorで実行（推奨）

1. Supabase Dashboard → SQL Editor
2. 以下のファイルを順番に実行

```sql
-- 1. 正規化スキーマ
-- database/migrations/002_normalized_schema.sql の内容を実行

-- 2. パフォーマンスインデックス
-- database/migrations/004_v2_performance_indexes.sql の内容を実行
```

#### 方法B: Supabase CLIで実行

```bash
# Supabase CLI インストール
npm install -g supabase

# ログイン
supabase login

# プロジェクトにリンク
supabase link --project-ref your-project-ref

# マイグレーション実行
supabase db push
```

### 3. 認証情報の取得

Supabase Dashboard → Settings → API

以下の情報をコピー：
- `Project URL` → `SUPABASE_URL`
- `anon public` → `SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

### 4. テストデータ投入（オプション）

```sql
-- database/v2-test-data-fixed.sql の内容を実行
```

---

## 環境変数設定

### 1. バックエンド環境変数

`.env.production` ファイルを作成：

```bash
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis (Optional - Redisサービスを使用する場合)
REDIS_URL=redis://your-redis-url:6379

# JWT Secrets (必ず変更！)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-$(openssl rand -hex 32)
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-$(openssl rand -hex 32)

# Google Maps API (オプション)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# V2.0 Automation Settings
GOOGLE_ELEVATION_API_ENABLED=true
GOOGLE_ELEVATION_API_TIMEOUT=10000
GOOGLE_ELEVATION_API_RETRY_COUNT=3

# Server
PORT=4000
NODE_ENV=production

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app

# Monitoring
ENABLE_METRICS=true
```

### 2. フロントエンド環境変数

`frontend/.env.production` ファイルを作成：

```bash
VITE_API_URL=https://your-backend-domain.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## ローカルテスト

### 1. 依存関係のインストール

```bash
# バックエンド
npm install

# フロントエンド
cd frontend
npm install
cd ..
```

### 2. テスト実行

```bash
# バックエンドテスト
npm test

# フロントエンドテスト
cd frontend
npm test
cd ..
```

### 3. ローカル起動

```bash
# ターミナル1: バックエンド
npm run dev

# ターミナル2: フロントエンド
cd frontend
npm run dev
```

### 4. 動作確認

- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:4000/api/health

---

## 本番デプロイ

### オプション1: Vercel + VPS（推奨）

#### A. フロントエンド（Vercel）

```bash
cd frontend

# Vercel CLIインストール
npm install -g vercel

# ログイン
vercel login

# デプロイ
vercel --prod

# 環境変数設定（Vercel Dashboard）
# Settings → Environment Variables
# VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY を設定
```

#### B. バックエンド（VPS）

```bash
# VPSにSSH接続
ssh user@your-vps-ip

# リポジトリクローン
git clone https://github.com/your-repo/bess-site-survey-system.git
cd bess-site-survey-system

# 環境変数設定
cp .env.example .env.production
nano .env.production  # 環境変数を編集

# 依存関係インストール
npm ci --production

# ビルド
npm run build

# PM2でプロセス管理
npm install -g pm2
pm2 start dist/index.js --name bess-api
pm2 save
pm2 startup

# Nginx設定
sudo nano /etc/nginx/sites-available/bess-api
```

Nginx設定例：

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Nginx有効化
sudo ln -s /etc/nginx/sites-available/bess-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL証明書（Let's Encrypt）
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.your-domain.com
```

### オプション2: Docker Compose

```bash
# .env.production を設定
cp .env.example .env.production
nano .env.production

# ビルド & 起動
docker-compose -f docker-compose.prod.yml up -d --build

# ログ確認
docker-compose -f docker-compose.prod.yml logs -f
```

### オプション3: 自動デプロイスクリプト

```bash
# 実行権限付与
chmod +x scripts/deploy-production.sh

# デプロイ実行
./scripts/deploy-production.sh
```

---

## デプロイ後の確認

### 1. ヘルスチェック

```bash
# バックエンドAPI
curl https://api.your-domain.com/api/health

# 期待されるレスポンス
{
  "status": "ok",
  "timestamp": "2025-01-06T...",
  "version": "2.0.0"
}
```

### 2. データベース接続確認

```bash
# サイト一覧取得
curl https://api.your-domain.com/api/v2/sites

# 認証が必要な場合
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://api.your-domain.com/api/v2/sites
```

### 3. フロントエンド確認

1. ブラウザで https://your-frontend.vercel.app にアクセス
2. ログイン機能の確認
3. サイト一覧表示の確認
4. 地図表示の確認

### 4. パフォーマンス確認

```bash
# レスポンスタイム測定
curl -w "@curl-format.txt" -o /dev/null -s \
     https://api.your-domain.com/api/v2/sites
```

curl-format.txt:
```
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
```

### 5. ログ確認

```bash
# PM2の場合
pm2 logs bess-api

# Dockerの場合
docker-compose logs -f api

# VPSの場合
tail -f logs/app.log
```

---

## トラブルシューティング

### 問題1: データベース接続エラー

**症状**: `Error: connect ECONNREFUSED`

**解決策**:
```bash
# 環境変数確認
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY

# Supabase接続テスト
curl https://your-project.supabase.co/rest/v1/
```

### 問題2: CORS エラー

**症状**: `Access-Control-Allow-Origin` エラー

**解決策**:
```bash
# .env.production の ALLOWED_ORIGINS を確認
ALLOWED_ORIGINS=https://your-frontend.vercel.app

# 複数のオリジンを許可する場合
ALLOWED_ORIGINS=https://domain1.com,https://domain2.com
```

### 問題3: ビルドエラー

**症状**: `npm run build` が失敗

**解決策**:
```bash
# node_modules削除して再インストール
rm -rf node_modules package-lock.json
npm install

# TypeScriptエラー確認
npm run build 2>&1 | grep error
```

### 問題4: メモリ不足

**症状**: `JavaScript heap out of memory`

**解決策**:
```bash
# Node.jsのメモリ上限を増やす
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### 問題5: Redis接続エラー

**症状**: Redis関連のエラー

**解決策**:
```bash
# Redisをオプショナルにする
# キャッシュなしでも動作するように設計されています
# REDIS_URL を設定しない、または空にする
```

---

## パフォーマンスチューニング

### 1. データベースインデックス確認

```sql
-- インデックス使用状況
SELECT * FROM v2_index_usage;

-- テーブルサイズ確認
SELECT * FROM v2_table_sizes;
```

### 2. キャッシュ設定

```bash
# Redisを使用する場合
REDIS_URL=redis://your-redis-host:6379

# キャッシュTTL調整（秒）
CACHE_TTL_SHORT=60
CACHE_TTL_MEDIUM=300
CACHE_TTL_LONG=1800
```

### 3. API レート制限

```bash
# .env.production
RATE_LIMIT_WINDOW_MS=900000  # 15分
RATE_LIMIT_MAX_REQUESTS=100  # 100リクエスト/15分
```

---

## セキュリティチェックリスト

- [ ] JWT_SECRET を強力なランダム文字列に変更
- [ ] JWT_REFRESH_SECRET を強力なランダム文字列に変更
- [ ] Supabase RLS (Row Level Security) を有効化
- [ ] HTTPS/SSL証明書を設定
- [ ] CORS設定を本番ドメインのみに制限
- [ ] 環境変数ファイル (.env.production) を .gitignore に追加
- [ ] データベースバックアップを設定
- [ ] ログローテーションを設定
- [ ] ファイアウォール設定（必要なポートのみ開放）
- [ ] 定期的なセキュリティアップデート

---

## モニタリング設定

### 1. Supabase Dashboard

- Database → Performance
- API → Logs
- Storage → Usage

### 2. アプリケーションログ

```bash
# PM2モニタリング
pm2 monit

# ログ集約
pm2 install pm2-logrotate
```

### 3. アラート設定

```bash
# エラー率が高い場合にアラート
# Supabase Dashboard → Settings → Webhooks
```

---

## バックアップ戦略

### 1. データベースバックアップ

```bash
# Supabaseは自動バックアップあり（Pro plan）
# 手動バックアップ
supabase db dump -f backup.sql
```

### 2. アプリケーションバックアップ

```bash
# Gitタグでバージョン管理
git tag -a v2.0.0 -m "Production release v2.0.0"
git push origin v2.0.0
```

---

## ロールバック手順

### 1. アプリケーションロールバック

```bash
# PM2の場合
pm2 stop bess-api
git checkout v1.9.0  # 前のバージョン
npm ci --production
npm run build
pm2 restart bess-api

# Dockerの場合
docker-compose down
git checkout v1.9.0
docker-compose up -d --build
```

### 2. データベースロールバック

```bash
# バックアップから復元
supabase db reset --db-url "postgresql://..."
```

---

## サポート & リソース

### ドキュメント
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### コミュニティ
- GitHub Issues: プロジェクトのIssuesページ
- Supabase Discord: https://discord.supabase.com

---

## まとめ

このガイドに従って、BESS Site Survey System v2.0を本番環境にデプロイできます。

### デプロイ完了チェックリスト

- [ ] Supabaseプロジェクト作成完了
- [ ] データベーススキーマ適用完了
- [ ] 環境変数設定完了
- [ ] ローカルテスト成功
- [ ] バックエンドデプロイ完了
- [ ] フロントエンドデプロイ完了
- [ ] ヘルスチェック成功
- [ ] SSL証明書設定完了
- [ ] モニタリング設定完了
- [ ] バックアップ設定完了

**デプロイ成功おめでとうございます！** 🎉

---

**最終更新**: 2025-01-06  
**バージョン**: 2.0.0
