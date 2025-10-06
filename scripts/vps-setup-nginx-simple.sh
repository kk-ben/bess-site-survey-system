#!/bin/bash

# ============================================================================
# Nginx簡易設定スクリプト - IPアドレスでアクセス可能にする
# ============================================================================

set -e

echo "🔧 Nginx設定を開始します..."
echo ""

# Nginx設定ファイルを作成
sudo tee /etc/nginx/sites-available/bess-api > /dev/null << 'EOF'
server {
    listen 80;
    server_name 153.121.61.164;

    # API v2
    location /api/v2 {
        proxy_pass http://localhost:3000/api/v2;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API v1
    location /api/v1 {
        proxy_pass http://localhost:3000/api/v1;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Root
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

echo "✅ Nginx設定ファイル作成完了"

# シンボリックリンクを作成（既存の場合は削除して再作成）
if [ -L /etc/nginx/sites-enabled/bess-api ]; then
    sudo rm /etc/nginx/sites-enabled/bess-api
fi

sudo ln -s /etc/nginx/sites-available/bess-api /etc/nginx/sites-enabled/
echo "✅ シンボリックリンク作成完了"

# Nginx設定テスト
echo ""
echo "🧪 Nginx設定をテスト中..."
sudo nginx -t

# Nginxをリロード
echo ""
echo "🔄 Nginxをリロード中..."
sudo systemctl reload nginx

echo ""
echo "✅ Nginx設定完了！"
echo ""
echo "📊 動作確認:"
echo "  curl http://153.121.61.164/api/v2"
echo "  curl http://153.121.61.164/health"
echo ""
