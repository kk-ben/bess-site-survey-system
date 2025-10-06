#!/bin/bash

# BESS Site Survey System - オンラインデプロイ完了スクリプト
# このスクリプトはVPS上で実行してください

set -e

echo "🚀 BESS Site Survey System - オンラインデプロイ最終設定"
echo "=================================================="

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. CORS設定の更新
echo -e "${YELLOW}ステップ1: CORS設定を更新中...${NC}"

cd ~/bess-site-survey-system

# .envファイルにCORS_ORIGINを追加または更新
if grep -q "CORS_ORIGIN=" .env; then
    # 既存の行を更新
    sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app|' .env
    echo -e "${GREEN}✓ CORS_ORIGIN を更新しました${NC}"
else
    # 新しい行を追加
    echo "CORS_ORIGIN=https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app" >> .env
    echo -e "${GREEN}✓ CORS_ORIGIN を追加しました${NC}"
fi

# 2. PM2でアプリケーションを再起動
echo -e "${YELLOW}ステップ2: アプリケーションを再起動中...${NC}"
pm2 restart bess-api
sleep 2

# 3. ログを確認
echo -e "${YELLOW}ステップ3: アプリケーションログを確認中...${NC}"
pm2 logs bess-api --lines 10 --nostream

# 4. ヘルスチェック
echo -e "${YELLOW}ステップ4: APIヘルスチェック...${NC}"
sleep 2
HEALTH_CHECK=$(curl -s http://localhost:3000/api/v2 || echo "failed")

if [[ $HEALTH_CHECK == *"BESS Site Survey System API"* ]]; then
    echo -e "${GREEN}✓ API正常稼働中${NC}"
else
    echo -e "${YELLOW}⚠ APIレスポンスを確認してください${NC}"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}🎉 VPS側の設定が完了しました！${NC}"
echo ""
echo "次のステップ:"
echo "1. Supabaseにテストデータを投入"
echo "2. Vercelのフロントエンドにアクセス"
echo ""
echo "Vercel URL:"
echo "https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app/login"
echo ""
