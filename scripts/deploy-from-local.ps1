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
Log-Info "BESS v2.0 API - リモートデプロイ開始"
Log-Info "========================================="
Write-Host ""

# ステップ1: VPS接続確認
Log-Info "ステップ1: VPS接続確認中..."
try {
    $testConnection = ssh -o ConnectTimeout=5 $VPS_SSH "echo 'Connection OK'" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Log-Success "VPS接続成功"
    } else {
        throw "接続失敗"
    }
} catch {
    Log-Error "VPS接続失敗。SSH接続情報を確認してください。"
    exit 1
}

# ステップ2: ローカルの変更をGitHubにプッシュ
Log-Info "ステップ2: ローカルの変更をGitHubにプッシュ中..."
$gitStatus = git status --porcelain
if ([string]::IsNullOrEmpty($gitStatus)) {
    Log-Info "変更なし。プッシュをスキップします。"
} else {
    Log-Warning "未コミットの変更があります。"
    $response = Read-Host "変更をコミットしてプッシュしますか？ (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        git add .
        $commitMsg = Read-Host "コミットメッセージを入力"
        git commit -m $commitMsg
        git push origin main
        Log-Success "GitHubへのプッシュ完了"
    } else {
        Log-Warning "プッシュをスキップしました。VPSは最新のコードを取得できません。"
    }
}

# ステップ3: VPS上でデプロイスクリプトを実行
Log-Info "ステップ3: VPS上でデプロイスクリプトを実行中..."

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
        Log-Success "VPS上でのデプロイ完了"
    } else {
        throw "デプロイ失敗"
    }
} catch {
    Log-Error "VPS上でのデプロイ失敗"
    exit 1
}

# ステップ4: 動作確認
Log-Info "ステップ4: 外部からの動作確認中..."
Start-Sleep -Seconds 3

# v2.0 ヘルスチェック
try {
    $healthCheck = Invoke-RestMethod -Uri "https://api.ps-system.jp/api/v2/health" -Method Get -ErrorAction Stop
    Log-Success "v2.0 API: 正常動作中"
    Write-Host ""
    $healthCheck | ConvertTo-Json -Depth 10
} catch {
    Log-Warning "v2.0 API: 応答なし（起動中の可能性があります）"
}

# 完了メッセージ
Write-Host ""
Log-Success "========================================="
Log-Success "リモートデプロイ完了！"
Log-Success "========================================="
Write-Host ""
Log-Info "📊 API情報:"
Log-Info "  - v1.0 API: https://api.ps-system.jp/api/v1"
Log-Info "  - v2.0 API: https://api.ps-system.jp/api/v2"
Write-Host ""
Log-Info "🔍 動作確認コマンド:"
Log-Info "  curl https://api.ps-system.jp/api/v2/health"
Log-Info "  curl https://api.ps-system.jp/api/v2/sites"
Write-Host ""
Log-Info "📝 VPSログ確認コマンド:"
Log-Info "  ssh $VPS_SSH 'pm2 logs bess-api --lines 50'"
Write-Host ""

