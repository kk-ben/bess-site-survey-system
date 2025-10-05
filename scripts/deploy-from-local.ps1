# ============================================================================
# BESS v2.0 API - ローカルからVPSへのリモートデプロイスクリプト (Windows)
# ============================================================================

$ErrorActionPreference = "Stop"

# 色付きログ関数
function Log-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Log-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Log-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Log-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# ============================================================================
# VPS接続情報
# ============================================================================

$VPS_USER = "ubuntu"
$VPS_HOST = "153.121.61.164"
$VPS_SSH = "$VPS_USER@$VPS_HOST"
$APP_DIR = "/var/www/bess-site-survey-system"

# ============================================================================
# メイン処理
# ============================================================================

Write-Host ""
Log-Info "========================================="
Log-Info "BESS v2.0 API - Remote Deploy Starting"
Log-Info "========================================="
Write-Host ""

# Step 1: VPS connection check
Log-Info "Step 1: Checking VPS connection..."
try {
    $testConnection = ssh -o ConnectTimeout=5 $VPS_SSH "echo 'Connection OK'" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Log-Success "VPS connection successful"
    } else {
        throw "Connection failed"
    }
} catch {
    Log-Error "VPS connection failed. Please check SSH connection info."
    exit 1
}

# Step 2: Push local changes to GitHub
Log-Info "Step 2: Pushing local changes to GitHub..."
$gitStatus = git status --porcelain
if ([string]::IsNullOrEmpty($gitStatus)) {
    Log-Info "No changes. Skipping push."
} else {
    Log-Warning "Uncommitted changes detected."
    $response = Read-Host "Commit and push changes? (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        git add .
        $commitMsg = Read-Host "Enter commit message"
        git commit -m $commitMsg
        git push origin main
        Log-Success "Pushed to GitHub successfully"
    } else {
        Log-Warning "Push skipped. VPS will not get latest code."
    }
}

# Step 3: Execute deploy script on VPS
Log-Info "Step 3: Executing deploy script on VPS..."

$deployScript = @'
set -e

# 色付きログ
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}[VPS]${NC} プロジェクトディレクトリに移動..."
cd /var/www/bess-site-survey-system

echo -e "${BLUE}[VPS]${NC} 最新コードを取得中..."
git fetch origin
git pull origin main

echo -e "${BLUE}[VPS]${NC} デプロイスクリプトに実行権限を付与..."
chmod +x scripts/vps-deploy-v2.sh

echo -e "${BLUE}[VPS]${NC} デプロイスクリプトを実行..."
./scripts/vps-deploy-v2.sh
'@

try {
    $deployScript | ssh $VPS_SSH "bash -s"
    if ($LASTEXITCODE -eq 0) {
        Log-Success "Deploy completed on VPS"
    } else {
        throw "Deploy failed"
    }
} catch {
    Log-Error "Deploy failed on VPS"
    exit 1
}

# Step 4: Health check
Log-Info "Step 4: Checking API health..."
Start-Sleep -Seconds 3

# v2.0 health check
try {
    $healthCheck = Invoke-RestMethod -Uri "https://api.ps-system.jp/api/v2/health" -Method Get -ErrorAction Stop
    Log-Success "v2.0 API: Running normally"
    Write-Host ""
    $healthCheck | ConvertTo-Json -Depth 10
} catch {
    Log-Warning "v2.0 API: No response (may be starting up)"
}

# Completion message
Write-Host ""
Log-Success "========================================="
Log-Success "Remote Deploy Completed!"
Log-Success "========================================="
Write-Host ""
Log-Info "API Info:"
Log-Info "  - v1.0 API: https://api.ps-system.jp/api/v1"
Log-Info "  - v2.0 API: https://api.ps-system.jp/api/v2"
Write-Host ""
Log-Info "Health Check Commands:"
Log-Info "  curl https://api.ps-system.jp/api/v2/health"
Log-Info "  curl https://api.ps-system.jp/api/v2/sites"
Write-Host ""
Log-Info "VPS Log Check Command:"
Log-Info "  ssh $VPS_SSH 'pm2 logs bess-api --lines 50'"
Write-Host ""

