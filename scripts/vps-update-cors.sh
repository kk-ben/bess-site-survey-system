#!/bin/bash

# VPS CORS設定更新スクリプト
# このスクリプトはVPS上で実行してください

set -e

echo "========================================"
echo "  VPS CORS設定更新スクリプト"
echo "========================================"
echo ""

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# プロジェクトディレクトリ
PROJECT_DIR="/home/ubuntu/bess-site-survey-system"
ENV_FILE="$PROJECT_DIR/.env.production"

# ディレクトリの存在確認
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}エラー: プロジェクトディレクトリが見つかりません: $PROJECT_DIR${NC}"
    exit 1
fi

# .env.productionの存在確認
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}エラー: .env.productionファイルが見つかりません: $ENV_FILE${NC}"
    exit 1
fi

echo -e "${CYAN}現在の設定を確認中...${NC}"
echo ""

# 現在のALLOWED_ORIGINSを表示
if grep -q "ALLOWED_ORIGINS" "$ENV_FILE"; then
    CURRENT_ORIGINS=$(grep "ALLOWED_ORIGINS" "$ENV_FILE" | cut -d'=' -f2-)
    echo -e "${YELLOW}現在のALLOWED_ORIGINS:${NC}"
    echo "  $CURRENT_ORIGINS"
    echo ""
else
    echo -e "${YELLOW}ALLOWED_ORIGINSが設定されていません${NC}"
    echo ""
fi

# 新しい設定
NEW_ORIGINS="https://bess-site-survey-system.vercel.app,https://ps-system.jp"

echo -e "${CYAN}新しい設定:${NC}"
echo "  $NEW_ORIGINS"
echo ""

# 確認プロンプト
read -p "この設定で更新しますか？ (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}キャンセルしました。${NC}"
    exit 0
fi

echo ""
echo -e "${CYAN}バックアップを作成中...${NC}"

# バックアップ作成
BACKUP_FILE="$ENV_FILE.backup.$(date +%Y%m%d_%H%M%S)"
cp "$ENV_FILE" "$BACKUP_FILE"
echo -e "${GREEN}✅ バックアップ作成完了: $BACKUP_FILE${NC}"
echo ""

echo -e "${CYAN}設定を更新中...${NC}"

# ALLOWED_ORIGINSの更新または追加
if grep -q "ALLOWED_ORIGINS" "$ENV_FILE"; then
    # 既存の行を更新
    sed -i "s|ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=$NEW_ORIGINS|" "$ENV_FILE"
    echo -e "${GREEN}✅ ALLOWED_ORIGINSを更新しました${NC}"
else
    # 新規追加
    echo "" >> "$ENV_FILE"
    echo "# CORS Configuration" >> "$ENV_FILE"
    echo "ALLOWED_ORIGINS=$NEW_ORIGINS" >> "$ENV_FILE"
    echo -e "${GREEN}✅ ALLOWED_ORIGINSを追加しました${NC}"
fi

echo ""
echo -e "${CYAN}更新後の設定:${NC}"
grep "ALLOWED_ORIGINS" "$ENV_FILE"
echo ""

# PM2でAPIを再起動
echo -e "${CYAN}APIを再起動中...${NC}"

if command -v pm2 &> /dev/null; then
    pm2 restart bess-api
    echo -e "${GREEN}✅ API再起動完了${NC}"
    echo ""
    
    echo -e "${CYAN}ログを確認中...${NC}"
    echo ""
    pm2 logs bess-api --lines 20 --nostream
    echo ""
else
    echo -e "${YELLOW}⚠️ PM2が見つかりません。手動でAPIを再起動してください。${NC}"
fi

echo ""
echo "========================================"
echo "  更新完了"
echo "========================================"
echo ""
echo -e "${GREEN}✅ CORS設定の更新が完了しました！${NC}"
echo ""
echo -e "${CYAN}次のステップ:${NC}"
echo "  1. API動作確認:"
echo "     curl https://ps-system.jp/api/v2/health"
echo ""
echo "  2. Vercelの環境変数を更新"
echo "     https://vercel.com/dashboard"
echo "     VITE_API_BASE_URL = https://ps-system.jp/api/v2"
echo ""
echo "  3. Vercelで再デプロイ"
echo ""
echo -e "${CYAN}バックアップファイル:${NC}"
echo "  $BACKUP_FILE"
echo ""
echo -e "${YELLOW}問題が発生した場合は、以下のコマンドでロールバックできます:${NC}"
echo "  cp $BACKUP_FILE $ENV_FILE"
echo "  pm2 restart bess-api"
echo ""
