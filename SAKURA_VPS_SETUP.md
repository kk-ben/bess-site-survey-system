# 🌸 さくらVPS - テスト環境セットアップガイド

## 📋 前提条件

- さくらVPSの契約済み
- Ubuntu 22.04 LTS がインストール済み
- ルートアクセス権限
- ドメインまたはサブドメイン（オプション）

---

## 🚀 自動セットアップ（推奨）

### ワンコマンドインストール

```bash
# VPSにSSH接続後
curl -fsSL https://raw.githubusercontent.com/your-repo/bess-site-survey-system/main/scripts/deploy-sakura-vps.sh | bash
```

このスクリプトは以下を自動実行します：
1. 必要なパッケージのインストール
2. Docker & Docker Composeのインストール
3. Nginxのインストールと設定
4. ファイアウォールの設定
5. アプリケーションのデプロイ
6. SSL証明書の取得（ドメイン設定時）

---

## 🛠️ 手動セットアップ

### ステップ1: システムの更新

```bash
# システムパッケージを最新化
sudo apt update
sudo apt upgrade -y

# 必要なパッケージをインストール
sudo apt install -y git curl wget vim ufw
```

### ステップ2: Dockerのインストール

```bash
# Dockerの公式GPGキーを追加
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Dockerリポジトリを追加
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Dockerをインストール
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Dockerサービスを開始
sudo systemctl start docker
sudo systemctl enable docker

# 現在のユーザーをdockerグループに追加
sudo usermod -aG docker $USER

# 再ログインして権限を反映
exit
# 再度SSH接続
```

### ステップ3: Docker Composeのインストール

```bash
# Docker Compose v2をインストール（既にインストール済みの場合はスキップ）
sudo apt install -y docker-compose-plugin

# バージョン確認
docker compose version
```

### ステップ4: Nginxのインストール

```bash
# Nginxをインストール
sudo apt install -y nginx

# Nginxを起動
sudo systemctl start nginx
sudo systemctl enable nginx
```

### ステップ5: ファイアウォールの設定

```bash
# UFWを有効化
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# 状態確認
sudo ufw status
```

### ステップ6: アプリケーションのデプロイ

```bash
# ホームディレクトリに移動
cd ~

# リポジトリをクローン
git clone https://github.com/your-repo/bess-site-survey-system.git
cd bess-site-survey-system

# 環境変数ファイルを作成
cp .env.example .env.staging
nano .env.staging
```

#### .env.staging の設定

```env
# 環境
NODE_ENV=staging
PORT=4000

# データベース
DATABASE_URL=postgresql://bess_user:CHANGE_THIS_PASSWORD@localhost:5432/bess_survey_staging
POSTGRES_USER=bess_user
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD
POSTGRES_DB=bess_survey_staging

# Redis
REDIS_URL=redis://:CHANGE_THIS_REDIS_PASSWORD@localhost:6379
REDIS_PASSWORD=CHANGE_THIS_REDIS_PASSWORD

# JWT（32文字以上のランダム文字列）
JWT_SECRET=CHANGE_THIS_TO_SECURE_RANDOM_STRING_32_CHARS
JWT_REFRESH_SECRET=CHANGE_THIS_TO_ANOTHER_SECURE_STRING_32_CHARS

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# CORS（ドメインを設定）
CORS_ORIGIN=https://test-bess.your-domain.com

# ログ
LOG_LEVEL=info
LOG_DIR=./logs

# レート制限
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### ステップ7: Docker Composeでアプリケーションを起動

```bash
# 本番用のDocker Composeファイルを使用
docker compose -f docker-compose.prod.yml up -d

# コンテナの状態を確認
docker compose -f docker-compose.prod.yml ps

# ログを確認
docker compose -f docker-compose.prod.yml logs -f
```

### ステップ8: データベースのセットアップ

```bash
# データベースマイグレーションを実行
docker compose -f docker-compose.prod.yml exec app npm run migrate

# 初期データを投入
docker compose -f docker-compose.prod.yml exec app npm run seed
```

### ステップ9: Nginxの設定

```bash
# Nginx設定ファイルを作成
sudo nano /etc/nginx/sites-available/bess-survey
```

#### Nginx設定（ドメインなし・IPアドレスのみ）

```nginx
server {
    listen 80;
    server_name your-vps-ip;

    # フロントエンド
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # バックエンドAPI
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Nginx設定（ドメインあり）

```nginx
server {
    listen 80;
    server_name test-bess.your-domain.com;

    # Let's Encrypt用
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    # HTTPSにリダイレクト
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name test-bess.your-domain.com;

    # SSL証明書（Let's Encryptで自動設定）
    ssl_certificate /etc/letsencrypt/live/test-bess.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/test-bess.your-domain.com/privkey.pem;

    # セキュリティヘッダー
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # フロントエンド
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # バックエンドAPI
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# 設定ファイルを有効化
sudo ln -s /etc/nginx/sites-available/bess-survey /etc/nginx/sites-enabled/

# デフォルト設定を無効化
sudo rm /etc/nginx/sites-enabled/default

# 設定をテスト
sudo nginx -t

# Nginxを再起動
sudo systemctl restart nginx
```

### ステップ10: SSL証明書の取得（ドメインがある場合）

```bash
# Certbotをインストール
sudo apt install -y certbot python3-certbot-nginx

# SSL証明書を取得
sudo certbot --nginx -d test-bess.your-domain.com

# 自動更新を設定（既に設定済みの場合が多い）
sudo certbot renew --dry-run
```

---

## ✅ 動作確認

### 1. ヘルスチェック

```bash
# バックエンドAPI
curl http://localhost:4000/api/v1/health

# または外部から
curl http://your-vps-ip/api/v1/health
curl https://test-bess.your-domain.com/api/v1/health
```

### 2. ブラウザでアクセス

- IPアドレス: `http://your-vps-ip`
- ドメイン: `https://test-bess.your-domain.com`

### 3. 初期ログイン

- Email: `admin@example.com`
- Password: `admin123`

---

## 🔄 更新・メンテナンス

### アプリケーションの更新

```bash
cd ~/bess-site-survey-system

# 最新コードを取得
git pull origin main

# コンテナを再ビルド＆再起動
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

# マイグレーションを実行
docker compose -f docker-compose.prod.yml exec app npm run migrate
```

### ログの確認

```bash
# アプリケーションログ
docker compose -f docker-compose.prod.yml logs -f app

# Nginxログ
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# システムログ
sudo journalctl -u docker -f
```

### バックアップ

```bash
# データベースバックアップ
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U bess_user bess_survey_staging > backup_$(date +%Y%m%d).sql

# 自動バックアップ（cron）
crontab -e

# 以下を追加（毎日午前2時にバックアップ）
0 2 * * * cd ~/bess-site-survey-system && docker compose -f docker-compose.prod.yml exec postgres pg_dump -U bess_user bess_survey_staging > ~/backups/backup_$(date +\%Y\%m\%d).sql
```

---

## 🛡️ セキュリティ強化

### SSH鍵認証の設定

```bash
# ローカルPCで鍵を生成
ssh-keygen -t ed25519 -C "your_email@example.com"

# 公開鍵をVPSにコピー
ssh-copy-id user@your-vps-ip

# VPS側でパスワード認証を無効化
sudo nano /etc/ssh/sshd_config

# 以下を変更
PasswordAuthentication no

# SSHを再起動
sudo systemctl restart sshd
```

### Fail2Banのインストール

```bash
# Fail2Banをインストール
sudo apt install -y fail2ban

# 設定ファイルをコピー
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Fail2Banを起動
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

---

## 📊 監視設定

### Uptime監視（UptimeRobot）

1. [UptimeRobot](https://uptimerobot.com)に登録（無料）
2. 「Add New Monitor」をクリック
3. Monitor Type: HTTP(s)
4. URL: `https://test-bess.your-domain.com/api/v1/health`
5. Monitoring Interval: 5 minutes

---

## 🚨 トラブルシューティング

### コンテナが起動しない

```bash
# ログを確認
docker compose -f docker-compose.prod.yml logs

# コンテナを再作成
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d
```

### Nginxエラー

```bash
# 設定をテスト
sudo nginx -t

# エラーログを確認
sudo tail -f /var/log/nginx/error.log
```

### データベース接続エラー

```bash
# PostgreSQLコンテナに接続
docker compose -f docker-compose.prod.yml exec postgres psql -U bess_user -d bess_survey_staging

# 接続情報を確認
\conninfo
```

---

## 📞 サポート

問題が解決しない場合：
1. ログを確認
2. GitHubでIssueを作成
3. ドキュメントを再確認

---

**さくらVPSでのテスト環境構築完了！🌸**
