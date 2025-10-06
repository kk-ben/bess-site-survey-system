#!/bin/bash

# HTTPS設定確認スクリプト

echo "=== HTTPS設定確認 ==="
echo ""

echo "1. Nginx設定ファイルを確認"
echo "---"
sudo cat /etc/nginx/sites-available/default | grep -A 20 "server {"
echo ""

echo "2. SSL証明書の確認"
echo "---"
sudo ls -la /etc/letsencrypt/live/ 2>/dev/null || echo "Let's Encrypt証明書が見つかりません"
echo ""

echo "3. ポート443が開いているか確認"
echo "---"
sudo ufw status | grep 443 || echo "ファイアウォール設定を確認してください"
echo ""

echo "4. Nginxの状態確認"
echo "---"
sudo systemctl status nginx --no-pager | head -10
echo ""

echo "5. APIサーバーの状態確認"
echo "---"
pm2 status
echo ""

echo "6. HTTPSでアクセステスト"
echo "---"
curl -I https://ps-system.jp/api/v2/health 2>&1 | head -5
echo ""

echo "完了！"
