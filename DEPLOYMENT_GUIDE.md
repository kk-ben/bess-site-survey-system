# BESS用地調査システム デプロイガイド

## 🚀 デプロイオプション

### オプション1: ローカル環境（Docker Compose）

最も簡単な方法。開発・テスト・デモに最適。

**必要なもの:**
- Docker Desktop
- Node.js 18以上
- 8GB以上のRAM

**手順:**
```bash
# 1. 環境変数の設定
cp .env.example .env
cd frontend && cp .env.example .env && cd ..

# 2. Docker Composeで起動
docker-compose up -d

# 3. データベースマイグレーション
npm run migrate

# 4. 初期ユーザー作成
npm run seed

# 5. アクセス
# フロントエンド: http://localhost:5173
# バックエンド: http://localhost:4000
```

---

### オプション2: VPS/クラウドサーバー（推奨）

本番環境に最適。さくらVPS、AWS EC2、GCP等で利用可能。

**必要なもの:**
- Ubuntu 22.04 LTS サーバー
- 2GB以上のRAM
- ドメイン（オプション）
- SSL証明書（Let's Encrypt推奨）

**自動セットアップスクリプト:**
```bash
# サーバーにSSH接続後
curl -fsSL https://raw.githubusercontent.com/your-repo/bess-site-survey-system/main/scripts/deploy-vps.sh | bash
```

**手動セットアップ:**
```bash
# 1. 依存関係のインストール
sudo apt update
sudo apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# 2. プロジェクトのクローン
git clone https://github.com/your-repo/bess-site-survey-system.git
cd bess-site-survey-system

# 3. 環境変数の設定
cp .env.example .env
nano .env  # 本番環境用の値を設定

# 4. Docker Composeで起動
docker-compose -f docker-compose.prod.yml up -d

# 5. Nginx設定
sudo cp nginx/bess-survey.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/bess-survey.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 6. SSL証明書の取得
sudo certbot --nginx -d yourdomain.com
```

---

### オプション3: Vercel + Supabase（サーバーレス）

フロントエンドとバックエンドを分離。スケーラブルで管理が簡単。

**必要なもの:**
- Vercelアカウント
- Supabaseアカウント
- GitHubリポジトリ

**手順:**

#### 3.1 Supabaseセットアップ

1. [Supabase](https://supabase.com)でプロジェクト作成
2. SQL Editorでマイグレーション実行:
```sql
-- database/migrations/001_initial_schema.sql の内容を実行
```
3. PostGIS拡張を有効化:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```
4. 接続情報を取得（Settings → Database）

#### 3.2 Vercel デプロイ（フロントエンド）

```bash
# Vercel CLIインストール
npm i -g vercel

# フロントエンドディレクトリで実行
cd frontend
vercel

# 環境変数を設定
vercel env add VITE_API_BASE_URL
vercel env add VITE_GOOGLE_MAPS_API_KEY
```

#### 3.3 バックエンドデプロイ

**オプションA: Vercel Serverless Functions**
```bash
# ルートディレクトリで
vercel

# 環境変数を設定
vercel env add DATABASE_URL
vercel env add REDIS_URL
vercel env add JWT_SECRET
```

**オプションB: Railway/Render**
1. GitHubリポジトリを接続
2. 環境変数を設定
3. 自動デプロイ

---

## 📋 環境変数一覧

### バックエンド (.env)

```bash
# サーバー設定
NODE_ENV=production
PORT=4000
API_VERSION=v1

# データベース
DATABASE_URL=postgresql://user:password@localhost:5432/bess_survey
POSTGRES_USER=bess_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=bess_survey

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# JWT認証
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://yourdomain.com

# ファイルアップロード
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# ログ
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# レート制限
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### フロントエンド (frontend/.env)

```bash
# API
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## 🔒 セキュリティチェックリスト

デプロイ前に必ず確認：

- [ ] すべての環境変数を本番用の値に変更
- [ ] JWT_SECRETを強力なランダム文字列に設定
- [ ] データベースパスワードを変更
- [ ] Redisパスワードを設定
- [ ] CORS_ORIGINを本番ドメインに設定
- [ ] SSL証明書を設定（HTTPS）
- [ ] ファイアウォール設定（必要なポートのみ開放）
- [ ] データベースバックアップの設定
- [ ] ログローテーションの設定

---

## 🛠️ デプロイ後の確認

### ヘルスチェック

```bash
# APIヘルスチェック
curl https://api.yourdomain.com/health

# データベース接続確認
curl https://api.yourdomain.com/health/db

# Redis接続確認
curl https://api.yourdomain.com/health/redis
```

### ログ確認

```bash
# Dockerログ
docker-compose logs -f api

# Nginxログ
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# アプリケーションログ
tail -f logs/app.log
```

---

## 📊 監視・メンテナンス

### 推奨監視ツール

1. **Uptime監視**: UptimeRobot, Pingdom
2. **エラー追跡**: Sentry
3. **ログ管理**: Papertrail, Loggly
4. **パフォーマンス**: New Relic, DataDog

### バックアップ

```bash
# データベースバックアップ（毎日実行推奨）
docker exec bess-postgres pg_dump -U bess_user bess_survey > backup_$(date +%Y%m%d).sql

# 自動バックアップ設定（cron）
0 2 * * * /path/to/backup-script.sh
```

### アップデート

```bash
# 1. 最新コードを取得
git pull origin main

# 2. 依存関係を更新
npm install
cd frontend && npm install && cd ..

# 3. データベースマイグレーション
npm run migrate

# 4. ビルド
npm run build
cd frontend && npm run build && cd ..

# 5. 再起動
docker-compose restart
```

---

## 🚨 トラブルシューティング

### データベース接続エラー

```bash
# PostgreSQL接続確認
docker exec -it bess-postgres psql -U bess_user -d bess_survey

# PostGIS拡張確認
SELECT PostGIS_version();
```

### Redis接続エラー

```bash
# Redis接続確認
docker exec -it bess-redis redis-cli
AUTH your_redis_password
PING
```

### Nginx 502 Bad Gateway

```bash
# バックエンドが起動しているか確認
docker ps
curl http://localhost:4000/health

# Nginx設定確認
sudo nginx -t
```

### フロントエンドが表示されない

```bash
# ビルド確認
cd frontend
npm run build
ls -la dist/

# 環境変数確認
cat .env
```

---

## 📞 サポート

問題が解決しない場合：

1. ログを確認（上記参照）
2. GitHubでIssueを作成
3. ドキュメントを再確認

---

## 🎯 次のステップ

デプロイ完了後：

1. 初期ユーザーでログイン
2. Google Maps APIキーを設定
3. テストデータをインポート
4. ユーザーを招待
5. 監視を設定

**Happy Deploying! 🚀**
