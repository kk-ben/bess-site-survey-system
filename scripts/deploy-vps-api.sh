#!/bin/bash

# =============================================================================
# BESS Site Survey System - VPS API自動デプロイスクリプト
# =============================================================================

set -e

# 色付きログ
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =============================================================================
# 設定
# =============================================================================

VPS_IP="153.121.61.164"
DOMAIN="api.ps-system.jp"
APP_DIR="/var/www/bess-site-survey-system"
APP_NAME="bess-api"
REPO_URL="https://github.com/kk-ben/bess-site-survey-system.git"

# =============================================================================
# メイン処理
# =============================================================================

log_info "BESS Site Survey System - VPS APIデプロイ開始"
log_info "VPS IP: $VPS_IP"
log_info "ドメイン: $DOMAIN"
echo

# ステップ1: システム更新
log_info "ステップ1: システム更新中..."
apt update && apt upgrade -y
log_success "システム更新完了"

# ステップ2: 必要なパッケージインストール
log_info "ステップ2: 必要なパッケージをインストール中..."
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw htop

# Node.js 18 LTS
if ! command -v node &> /dev/null; then
    log_info "Node.jsをインストール中..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    log_info "PM2をインストール中..."
    npm install -g pm2
    pm2 startup
fi

log_success "パッケージインストール完了"

# ステップ3: プロジェクトクローン
log_info "ステップ3: プロジェクトをクローン中..."
if [ ! -d "$APP_DIR" ]; then
    mkdir -p /var/www
    cd /var/www
    git clone $REPO_URL
else
    cd $APP_DIR
    git pull origin main
fi
log_success "プロジェクトクローン完了"

# ステップ4: 依存関係インストール・ビルド
log_info "ステップ4: 依存関係をインストール・ビルド中..."
cd $APP_DIR
npm install
npm run build
log_success "ビルド完了"

# ステップ5: 環境変数設定
log_info "ステップ5: 環境変数を設定中..."
if [ ! -f "$APP_DIR/.env.production" ]; then
    cat > $APP_DIR/.env.production << 'EOF'
# サーバー設定
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# CORS設定（Vercelデプロイ後に更新）
CORS_ORIGIN=*

# Supabase設定（要更新）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT設定
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Redis
REDIS_URL=redis://localhost:6379

# ログ設定
LOG_LEVEL=info
LOG_DIR=./logs
EOF
    log_warning "環境変数ファイルを作成しました。Supabase情報を更新してください。"
else
    log_info "環境変数ファイルは既に存在します。"
fi
log_success "環境変数設定完了"

# ステップ6: PM2設定
log_info "ステップ6: PM2を設定中..."
cat > $APP_DIR/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'bess-api',
    script: 'dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: '/var/log/pm2/bess-api-error.log',
    out_file: '/var/log/pm2/bess-api-out.log',
    log_file: '/var/log/pm2/bess-api.log',
    time: true,
    max_memory_restart: '500M'
  }]
};
EOF

mkdir -p /var/log/pm2

# PM2でアプリケーション起動
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start $APP_DIR/ecosystem.config.js --env production
pm2 save

log_success "PM2設定完了"

# ステップ7: Nginx設定
log_info "ステップ7: Nginxを設定中..."
cat > /etc/nginx/sites-available/$APP_NAME << 'EOF'
server {
    listen 80;
    server_name api.ps-system.jp;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
        
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
    }

    access_log /var/log/nginx/bess-api.access.log;
    error_log /var/log/nginx/bess-api.error.log;
}
EOF

ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl restart nginx

log_success "Nginx設定完了"

# ステップ8: ファイアウォール設定
log_info "ステップ8: ファイアウォールを設定中..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

log_success "ファイアウォール設定完了"

# ステップ9: SSL証明書取得
log_info "ステップ9: SSL証明書を取得中..."
log_warning "DNSレコードが正しく設定されていることを確認してください。"
read -p "SSL証明書を取得しますか？ (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@ps-system.jp || {
        log_warning "SSL証明書の取得に失敗しました。DNSレコードを確認してください。"
        log_warning "後で手動で実行: certbot --nginx -d $DOMAIN"
    }
    log_success "SSL証明書取得完了"
else
    log_warning "SSL証明書の取得をスキップしました。"
    log_warning "後で手動で実行: certbot --nginx -d $DOMAIN"
fi

# ステップ10: 動作確認
log_info "ステップ10: 動作確認中..."
sleep 3

if curl -f -s http://localhost:3000/api/v1/health > /dev/null; then
    log_success "APIが正常に起動しています！"
else
    log_warning "APIの起動確認に失敗しました。ログを確認してください。"
fi

# 完了メッセージ
echo
log_success "=== デプロイ完了 ==="
echo
log_info "API URL: https://$DOMAIN/api/v1"
log_info "ヘルスチェック: https://$DOMAIN/api/v1/health"
echo
log_warning "次の手順を実行してください："
log_warning "1. $APP_DIR/.env.production のSupabase情報を更新"
log_warning "2. pm2 restart $APP_NAME でアプリケーション再起動"
log_warning "3. Vercelでフロントエンドをデプロイ"
log_warning "4. CORS_ORIGINをVercelのURLに更新"
echo
log_info "ログ確認: pm2 logs $APP_NAME"
log_info "PM2状態: pm2 status"
log_info "Nginxログ: tail -f /var/log/nginx/bess-api.error.log"
echo
