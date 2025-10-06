#!/bin/bash

# ============================================================================
# Nginx手動設定スクリプト - 確実にインストールして設定
# ============================================================================

set -e

echo "🔧 Nginx設定を開始します..."
echo ""

# 1. Nginxがインストールされているか確認
if ! command -v nginx &> /dev/null; then
    echo "📦 Nginxをインストールします..."
    sudo apt update
    sudo apt install -y nginx
    echo "✅ Nginxインストール完了"
else
    echo "✅ Nginx既にインストール済み"
fi

# 2. Nginxを起動
echo ""
echo "🚀 Nginxを起動します..."
sudo systemctl start nginx
sudo systemctl enable nginx
echo "✅ Nginx起動完了"

# 3. 必要なディレクトリを作成
echo ""
echo "📁 ディレクトリを確認・作成します..."
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled
echo "✅ ディレクトリ作成完了"

# 4. メインのnginx.confにsites-enabledのincludeがあるか確認
if ! grep -q "include /etc/nginx/sites-enabled/\*;" /etc/nginx/nginx.conf; then
    echo ""
    echo "⚠️  nginx.confにsites-enabledのincludeを追加します..."
    sudo sed -i '/http {/a \    include /etc/nginx/sites-enabled/*;' /etc/nginx/nginx.conf
    echo "✅ nginx.conf更新完了"
fi

# 5. 設定ファイルを作成
echo ""
echo "📝 Nginx設定ファイルを作成します..."
sudo bash -c 'cat > /etc/nginx/sites-available/bess-api << "EOF"
server {
    listen 80;
    server_name 153.121.61.164;

    # API v2
    location /api/v2 {
        proxy_pass http://localhost:3000/api/v2;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # API v1
    location /api/v1 {
        proxy_pass http://localhost:3000/api/v1;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # Root
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF'
echo "✅ 設定ファイル作成完了"

# 6. シンボリックリンクを作成
echo ""
echo "🔗 シンボリックリンクを作成します..."
if [ -L /etc/nginx/sites-enabled/bess-api ]; then
    sudo rm /etc/nginx/sites-enabled/bess-api
fi
sudo ln -s /etc/nginx/sites-available/bess-api /etc/nginx/sites-enabled/
echo "✅ シンボリックリンク作成完了"

# 7. デフォルト設定を無効化（競合を避けるため）
if [ -L /etc/nginx/sites-enabled/default ]; then
    echo ""
    echo "🗑️  デフォルト設定を無効化します..."
    sudo rm /etc/nginx/sites-enabled/default
    echo "✅ デフォルト設定無効化完了"
fi

# 8. Nginx設定テスト
echo ""
echo "🧪 Nginx設定をテスト中..."
sudo nginx -t

# 9. Nginxを再起動
echo ""
echo "🔄 Nginxを再起動中..."
sudo systemctl restart nginx

# 10. ステータス確認
echo ""
echo "📊 Nginxステータス:"
sudo systemctl status nginx --no-pager | head -10

echo ""
echo "✅ Nginx設定完了！"
echo ""
echo "📊 動作確認コマンド:"
echo "  curl http://localhost/api/v2"
echo "  curl http://localhost/health"
echo "  curl http://153.121.61.164/api/v2"
echo ""
