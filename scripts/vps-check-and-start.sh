#!/bin/bash

# VPS APIサーバー状態確認と起動スクリプト
# 使用方法: ssh ubuntu@153.121.61.164 'bash -s' < scripts/vps-check-and-start.sh

echo "=== BESS API Server Status Check ==="
echo "Date: $(date)"
echo ""

# 1. プロセス確認
echo "1. Checking Node.js processes..."
ps aux | grep node | grep -v grep || echo "No Node.js processes found"
echo ""

# 2. ポート確認
echo "2. Checking port 3000..."
netstat -tlnp 2>/dev/null | grep 3000 || echo "Port 3000 is not in use"
echo ""

# 3. プロジェクトディレクトリ確認
echo "3. Checking project directory..."
if [ -d "/home/ubuntu/bess-site-survey-system" ]; then
    echo "✓ Project directory exists"
    cd /home/ubuntu/bess-site-survey-system
    
    # Git status
    echo ""
    echo "4. Git status..."
    git branch
    git log --oneline -3
    
    # 環境変数確認
    echo ""
    echo "5. Checking .env file..."
    if [ -f ".env" ]; then
        echo "✓ .env file exists"
        echo "Environment variables (masked):"
        grep -E "^(PORT|NODE_ENV|DATABASE_URL|SUPABASE_URL)" .env | sed 's/=.*/=***/'
    else
        echo "✗ .env file not found"
    fi
    
    # package.json確認
    echo ""
    echo "6. Checking package.json..."
    if [ -f "package.json" ]; then
        echo "✓ package.json exists"
        node -v
        npm -v
    else
        echo "✗ package.json not found"
    fi
    
    # dist確認
    echo ""
    echo "7. Checking build directory..."
    if [ -d "dist" ]; then
        echo "✓ dist directory exists"
        ls -lh dist/ | head -5
    else
        echo "✗ dist directory not found - need to build"
    fi
    
else
    echo "✗ Project directory not found at /home/ubuntu/bess-site-survey-system"
fi

echo ""
echo "=== Status Check Complete ==="
echo ""
echo "To start the server, run:"
echo "  cd /home/ubuntu/bess-site-survey-system"
echo "  npm run build"
echo "  npm start"
echo ""
echo "Or with PM2:"
echo "  pm2 start dist/index.js --name bess-api"
echo "  pm2 save"
