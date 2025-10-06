# VPSサーバー状態確認と起動スクリプト（PowerShell版）
# SSH経由でVPSサーバーの状態を確認し、必要に応じて起動

$VPS_HOST = "153.121.61.164"
$VPS_USER = "ubuntu"
$PROJECT_DIR = "/home/ubuntu/bess-site-survey-system"

Write-Host "=== BESS VPS Server Check ===" -ForegroundColor Cyan
Write-Host "Connecting to $VPS_USER@$VPS_HOST..." -ForegroundColor Yellow
Write-Host ""

# SSH接続してサーバー状態を確認
$checkScript = @"
echo '=== 1. Checking Node.js processes ==='
ps aux | grep node | grep -v grep || echo 'No Node.js processes found'
echo ''

echo '=== 2. Checking port 3000 ==='
netstat -tlnp 2>/dev/null | grep 3000 || echo 'Port 3000 is not in use'
echo ''

echo '=== 3. Checking project directory ==='
if [ -d '$PROJECT_DIR' ]; then
    echo '✓ Project directory exists'
    cd $PROJECT_DIR
    
    echo ''
    echo '=== 4. Git status ==='
    git log --oneline -3
    
    echo ''
    echo '=== 5. Checking .env file ==='
    if [ -f '.env' ]; then
        echo '✓ .env file exists'
    else
        echo '✗ .env file not found'
    fi
    
    echo ''
    echo '=== 6. Checking build ==='
    if [ -d 'dist' ]; then
        echo '✓ dist directory exists'
    else
        echo '✗ dist directory not found - need to build'
    fi
else
    echo '✗ Project directory not found'
fi
"@

# SSH経由でスクリプトを実行
ssh -o StrictHostKeyChecking=no "$VPS_USER@$VPS_HOST" $checkScript

Write-Host ""
Write-Host "=== Check Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "To start the server manually, run:" -ForegroundColor Yellow
Write-Host "  ssh $VPS_USER@$VPS_HOST" -ForegroundColor White
Write-Host "  cd $PROJECT_DIR" -ForegroundColor White
Write-Host "  npm run build && npm start" -ForegroundColor White
