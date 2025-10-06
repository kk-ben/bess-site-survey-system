#!/bin/bash

# VPS CORS設定更新スクリプト
# 実行: ssh ubuntu@153.121.61.164 'bash -s' < bess-site-survey-system/scripts/vps-cors-update.sh

echo "🔧 VPS CORS設定を更新中..."

cd ~/bess-site-survey-system

# CORS_ORIGINを追加または更新
if grep -q "CORS_ORIGIN=" .env; then
    # 既存の行を更新
    sed -i 's|CORS_ORIGIN=.*|CORS_ORIGIN=https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app|' .env
    echo "✅ CORS_ORIGIN を更新しました"
else
    # 新しい行を追加
    echo "CORS_ORIGIN=https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app" >> .env
    echo "✅ CORS_ORIGIN を追加しました"
fi

# PM2で再起動
echo "🔄 アプリケーションを再起動中..."
pm2 restart bess-api

# ログ確認
echo "📋 最新ログ:"
pm2 logs bess-api --lines 10 --nostream

echo ""
echo "✅ 完了！"
echo ""
echo "次のステップ:"
echo "https://bess-site-survey-system-ahozqbxd6-kk-bens-projects.vercel.app/login"
echo "Email: admin@bess.com"
echo "Password: password123"
