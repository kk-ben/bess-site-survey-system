#!/bin/bash

# BESS用地調査システム - さくらVPS自動セットアップスクリプト

set -e

echo "========================================="
echo "BESS Site Survey System - Sakura VPS Setup"
echo "========================================="
echo ""

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ルート権限チェック
if [ "$EUID" -eq 0 ]; then
    log_error "このスクリプトはrootユーザーで実行しないでください"
    log_info "通常ユーザーで実行してください: ./deploy-sakura-vps.sh"
    exit 1
fi

# ステップ1: システムの更新
log_info "[1/10] システムパッケージを更新中..."
sudo apt update
sudo apt upgrade -y
sudo apt install -y git curl wget vim ufw

# ステップ2: Dockerのインストール
log_info "[2/10] Dockerをインストール中..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    log_info "Dockerのインストールが完了しました"
else
    log_info "Dockerは既にインストールされています"
fi

# ステップ3: Docker Composeのインストール
log_info "[3/10] Docker Composeをインストール中..."
if ! command -v docker compose &> /dev/null; then
    sudo apt install -y docker-compose-plugin
    log_info "Docker Composeのインストールが完了しました"
else
    log_info "Docker Composeは既にインストールされています"
fi

# ステップ4: Nginxのインストール
log_info "[4/10] Nginxをインストール中..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    log_info "Nginxのインストールが完了しました"
else
    log_info "Nginxは既にインストールされています"
fi

# ステップ5: ファイアウォールの設定
log_info "[5/10] ファイアウォールを設定中..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
log_info "ファイアウォールの設定が完了しました"

# ステップ6: アプリケーションのクローン
log_info "[6/10] アプリケーションをクローン中..."
cd ~
if [ -d "bess-site-survey-system" ]; then
    log_warn "ディレクトリが既に存在します。更新します..."
    cd bess-site-survey-system
    git pull
else
    read -p "GitHubリポジトリのURL を入力してください: " REPO_URL
    git clone $REPO_URL
    cd bess-site-survey-system
fi

# ステップ7: 環境変数の設定
log_info "[7/10] 環境変数を設定中..."
if [ ! -f ".env.staging" ]; then
    cp .env.example .env.staging
    
    # ランダムなパスワードとシークレットを生成
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-48)
    JWT_REFRESH_SECRET=$(openssl rand -base64 48 | tr -d "=+/" | cut -c1-48)
    
    # 環境変数ファイルを更新
    sed -i "s/CHANGE_THIS_PASSWORD/$DB_PASSWORD/g" .env.staging
    sed -i "s/CHANGE_THIS_REDIS_PASSWORD/$REDIS_PASSWORD/g" .env.staging
    sed -i "s/CHANGE_THIS_TO_SECURE_RANDOM_STRING_32_CHARS/$JWT_SECRET/g" .env.staging
    sed -i "s/CHANGE_THIS_TO_ANOTHER_SECURE_STRING_32_CHARS/$JWT_REFRESH_SECRET/g" .env.staging
    sed -i "s/NODE_ENV=development/NODE_ENV=staging/g" .env.staging
    
    log_info "環境変数ファイルを作成しました: .env.staging"
    log_warn "必要に応じて .env.staging を編集してください"
else
    log_info "環境変数ファイルは既に存在します"
fi

# ステップ8: Dockerコンテナの起動
log_info "[8/10] Dockerコンテナを起動中..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d

# データベースの準備を待つ
log_info "データベースの準備を待機中..."
sleep 15

# ステップ9: データベースのセットアップ
log_info "[9/10] データベースをセットアップ中..."
docker compose -f docker-compose.prod.yml exec -T app npm run migrate || log_warn "マイグレーションに失敗しました"
docker compose -f docker-compose.prod.yml exec -T app npm run seed || log_warn "シードデータの投入に失敗しました"

# ステップ10: Nginxの設定
log_info "[10/10] Nginxを設定中..."

# サーバーのIPアドレスを取得
SERVER_IP=$(curl -s ifconfig.me)

# ドメインの設定を確認
read -p "カスタムドメインを使用しますか？ (y/N): " USE_DOMAIN
if [[ $USE_DOMAIN =~ ^[Yy]$ ]]; then
    read -p "ドメイン名を入力してください (例: test-bess.your-domain.com): " DOMAIN_NAME
    
    # ドメイン用のNginx設定
    sudo tee /etc/nginx/sites-available/bess-survey > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN_NAME;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN_NAME;

    # SSL証明書（Let's Encryptで後で設定）
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

    # SSL証明書の取得
    log_info "SSL証明書を取得中..."
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME || log_warn "SSL証明書の取得に失敗しました。手動で設定してください"
    
else
    # IPアドレス用のNginx設定
    sudo tee /etc/nginx/sites-available/bess-survey > /dev/null <<EOF
server {
    listen 80;
    server_name $SERVER_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
fi

# Nginx設定を有効化
sudo ln -sf /etc/nginx/sites-available/bess-survey /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# 完了メッセージ
echo ""
echo "========================================="
log_info "デプロイが完了しました！"
echo "========================================="
echo ""
echo "アクセス情報:"
if [[ $USE_DOMAIN =~ ^[Yy]$ ]]; then
    echo "  URL: https://$DOMAIN_NAME"
else
    echo "  URL: http://$SERVER_IP"
fi
echo ""
echo "初期ログイン情報:"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""
echo "管理コマンド:"
echo "  ログ確認: docker compose -f docker-compose.prod.yml logs -f"
echo "  再起動: docker compose -f docker-compose.prod.yml restart"
echo "  停止: docker compose -f docker-compose.prod.yml down"
echo ""
echo "環境変数ファイル: ~/bess-site-survey-system/.env.staging"
echo ""
log_warn "セキュリティのため、初期パスワードを変更してください！"
echo ""
echo "Happy Surveying! 🗺️⚡"
