#!/bin/bash

# ============================================================================
# BESS v2.0 API - ローカルからVPSへのリモートデプロイスクリプト
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
# VPS接続情報
# ============================================================================

VPS_USER="ubuntu"
VPS_HOST="153.121.61.164"
VPS_SSH="${VPS_USER}@${VPS_HOST}"
APP_DIR="/home/ubuntu/bess-site-survey-system"

# ============================================================================
# メイン処理
# ============================================================================

echo
log_info "========================================="
log_info "BESS v2.0 API - リモートデプロイ開始"
log_info "========================================="
echo

# ステップ1: VPS接続確認
log_info "ステップ1: VPS接続確認中..."
if ssh -o ConnectTimeout=5 ${VPS_SSH} "echo 'Connection OK'" > /dev/null 2>&1; then
    log_success "VPS接続成功"
else
    log_error "VPS接続失敗。SSH接続情報を確認してください。"
    exit 1
fi

# ステップ2: ローカルの変更をGitHubにプッシュ
log_info "ステップ2: ローカルの変更をGitHubにプッシュ中..."
if git diff-index --quiet HEAD --; then
    log_info "変更なし。プッシュをスキップします。"
else
    log_warning "未コミットの変更があります。"
    read -p "変更をコミットしてプッシュしますか？ (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "コミットメッセージを入力: " commit_msg
        git commit -m "$commit_msg"
        git push origin main
        log_success "GitHubへのプッシュ完了"
    else
        log_warning "プッシュをスキップしました。VPSは最新のコードを取得できません。"
    fi
fi

# ステップ3: VPS上でデプロイスクリプトを実行
log_info "ステップ3: VPS上でデプロイスクリプトを実行中..."
ssh ${VPS_SSH} << 'ENDSSH'
    set -e
    
    # 色付きログ
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    BLUE='\033[0;34m'
    NC='\033[0m'
    
    echo -e "${BLUE}[VPS]${NC} プロジェクトディレクトリに移動..."
    cd /home/ubuntu/bess-site-survey-system
    
    echo -e "${BLUE}[VPS]${NC} 最新コードを取得中..."
    git fetch origin
    git pull origin main
    
    echo -e "${BLUE}[VPS]${NC} デプロイスクリプトに実行権限を付与..."
    chmod +x scripts/vps-deploy-v2.sh
    
    echo -e "${BLUE}[VPS]${NC} デプロイスクリプトを実行..."
    ./scripts/vps-deploy-v2.sh
ENDSSH

if [ $? -eq 0 ]; then
    log_success "VPS上でのデプロイ完了"
else
    log_error "VPS上でのデプロイ失敗"
    exit 1
fi

# ステップ4: 動作確認
log_info "ステップ4: 外部からの動作確認中..."
sleep 3

# v2.0 ヘルスチェック
if curl -f -s https://api.ps-system.jp/api/v2/health > /dev/null 2>&1; then
    log_success "v2.0 API: 正常動作中"
    echo
    curl -s https://api.ps-system.jp/api/v2/health | jq '.'
else
    log_warning "v2.0 API: 応答なし（起動中の可能性があります）"
fi

# 完了メッセージ
echo
log_success "========================================="
log_success "リモートデプロイ完了！"
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
log_info "📝 VPSログ確認コマンド:"
log_info "  ssh ${VPS_SSH} 'pm2 logs bess-api --lines 50'"
echo

