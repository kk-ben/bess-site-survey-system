#!/bin/bash

# ============================================================================
# BESS v2.0 API - VPS自動デプロイスクリプト
# VPS: ubuntu@153.121.61.164
# ============================================================================

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

# ============================================================================
# 設定
# ============================================================================

APP_DIR="/home/ubuntu/bess-site-survey-system"
APP_NAME="bess-api"

# ============================================================================
# メイン処理
# ============================================================================

echo
log_info "========================================="
log_info "BESS v2.0 API - VPSデプロイ開始"
log_info "========================================="
echo

# ステップ1: プロジェクトディレクトリに移動
log_info "ステップ1: プロジェクトディレクトリに移動..."
cd $APP_DIR || {
    log_error "プロジェクトディレクトリが見つかりません: $APP_DIR"
    exit 1
}
log_success "ディレクトリ移動完了"

# ステップ2: 最新コードを取得
log_info "ステップ2: 最新コードを取得中..."
git fetch origin
git pull origin main
log_success "コード取得完了"

# ステップ3: 依存関係を更新
log_info "ステップ3: 依存関係を更新中..."
npm install
log_success "バックエンド依存関係更新完了"

# ステップ3-2: フロントエンド依存関係を更新
log_info "ステップ3-2: フロントエンド依存関係を更新中..."
cd frontend
npm install
cd ..
log_success "フロントエンド依存関係更新完了"

# ステップ4: TypeScriptビルド
log_info "ステップ4: TypeScriptビルド中..."
npm run build
log_success "ビルド完了"

# ステップ5: 環境変数ファイルを作成/更新
log_info "ステップ5: 環境変数ファイルを確認中..."
if [ ! -f "$APP_DIR/.env.production" ]; then
    log_warning ".env.productionが存在しません。作成します..."
    cat > $APP_DIR/.env.production << 'ENVEOF'
# ============================================================================
# BESS Site Survey System v2.0 - Production Environment
# ============================================================================

# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Supabase Configuration
SUPABASE_URL=https://kcohexmvbccxixyfvjyw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUxODQwMSwiZXhwIjoyMDc1MDk0NDAxfQ.CSUPZBrUNadTwxi3pmCorovhSmf8uogbrkpyQowj0N0

# Database Direct Connection
DATABASE_URL=postgresql://postgres.kcohexmvbccxixyfvjyw:katsumi0536@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres

# API Configuration
API_VERSION=v2.0
API_BASE_URL=https://api.ps-system.jp/api

# CORS Configuration
CORS_ORIGIN=*

# JWT Configuration
JWT_SECRET=bess-v2-production-secret-key-2025
JWT_EXPIRES_IN=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# External APIs
GOOGLE_MAPS_API_KEY=
OSM_API_URL=https://nominatim.openstreetmap.org
GSI_API_URL=https://cyberjapandata.gsi.go.jp

# n8n Workflow
N8N_WEBHOOK_URL=
N8N_API_KEY=
ENVEOF
    log_success ".env.production作成完了"
else
    log_info ".env.productionは既に存在します"
fi

# ステップ6: ログディレクトリ作成
log_info "ステップ6: ログディレクトリを作成中..."
mkdir -p $APP_DIR/logs
mkdir -p /var/log/pm2
log_success "ログディレクトリ作成完了"

# ステップ7: PM2でアプリケーション再起動
log_info "ステップ7: PM2でアプリケーション再起動中..."

# 既存のプロセスを停止
pm2 stop $APP_NAME 2>/dev/null || log_warning "既存のプロセスが見つかりません"

# 新しいプロセスを起動
pm2 start $APP_DIR/ecosystem.config.js --env production --update-env

# PM2設定を保存
pm2 save

log_success "PM2再起動完了"

# ステップ8: 動作確認
log_info "ステップ8: 動作確認中..."
sleep 5

# v1.0 APIチェック
if curl -f -s http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    log_success "v1.0 API: 正常動作中"
else
    log_warning "v1.0 API: 応答なし"
fi

# v2.0 APIチェック
if curl -f -s http://localhost:3000/api/v2/health > /dev/null 2>&1; then
    log_success "v2.0 API: 正常動作中"
else
    log_warning "v2.0 API: 応答なし（起動中の可能性があります）"
fi

# ステップ9: PM2ステータス表示
log_info "ステップ9: PM2ステータス確認..."
pm2 status

# 完了メッセージ
echo
log_success "========================================="
log_success "BESS v2.0 API デプロイ完了！"
log_success "========================================="
echo
log_info "📊 API情報:"
log_info "  - v1.0 API: https://api.ps-system.jp/api/v1"
log_info "  - v2.0 API: https://api.ps-system.jp/api/v2"
echo
log_info "🔍 動作確認コマンド:"
log_info "  curl https://api.ps-system.jp/api/v2/health"
log_info "  curl https://api.ps-system.jp/api/v2/sites"
echo
log_info "📝 ログ確認コマンド:"
log_info "  pm2 logs $APP_NAME"
log_info "  pm2 logs $APP_NAME --lines 100"
echo
log_info "🔄 再起動コマンド:"
log_info "  pm2 restart $APP_NAME"
echo

# 最後にログを表示
log_info "最新のログ（20行）:"
pm2 logs $APP_NAME --lines 20 --nostream

echo
log_success "デプロイスクリプト実行完了！"
echo
