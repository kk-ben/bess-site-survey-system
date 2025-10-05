# ============================================================================
# BESS v2.0 クイックスタートスクリプト
# ============================================================================

param(
    [switch]$SkipBuild,
    [switch]$SkipEnvCheck
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BESS v2.0 クイックスタート" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# カレントディレクトリを確認
$currentDir = Get-Location
if (-not (Test-Path "package.json")) {
    Write-Host "❌ エラー: package.jsonが見つかりません" -ForegroundColor Red
    Write-Host "   bess-site-survey-systemディレクトリで実行してください" -ForegroundColor Yellow
    exit 1
}

# ステップ1: 環境変数チェック
Write-Host "ステップ1: 環境変数チェック" -ForegroundColor Yellow
Write-Host "----------------------------------------"

if (-not $SkipEnvCheck) {
    if (-not (Test-Path ".env")) {
        Write-Host "⚠️  .envファイルが見つかりません" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "以下の手順で.envファイルを作成してください：" -ForegroundColor Cyan
        Write-Host "1. .env.exampleをコピーして.envを作成"
        Write-Host "2. Supabase接続情報を設定"
        Write-Host "   - SUPABASE_URL"
        Write-Host "   - SUPABASE_SERVICE_ROLE_KEY"
        Write-Host ""
        
        $response = Read-Host ".envファイルを作成しましたか？ (y/n)"
        if ($response -ne "y") {
            Write-Host "❌ 中断しました" -ForegroundColor Red
            exit 1
        }
    }
    
    # .envファイルの内容を確認
    $envContent = Get-Content ".env" -Raw
    $hasSupabaseUrl = $envContent -match "SUPABASE_URL="
    $hasSupabaseKey = $envContent -match "SUPABASE_SERVICE_ROLE_KEY="
    
    if (-not $hasSupabaseUrl -or -not $hasSupabaseKey) {
        Write-Host "⚠️  Supabase設定が不完全です" -ForegroundColor Yellow
        Write-Host "   .envファイルに以下を追加してください：" -ForegroundColor Cyan
        Write-Host "   SUPABASE_URL=https://xxxxx.supabase.co"
        Write-Host "   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc..."
        Write-Host ""
        
        $response = Read-Host "設定を完了しましたか？ (y/n)"
        if ($response -ne "y") {
            Write-Host "❌ 中断しました" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "✅ 環境変数チェック完了" -ForegroundColor Green
} else {
    Write-Host "⏭️  環境変数チェックをスキップ" -ForegroundColor Yellow
}
Write-Host ""

# ステップ2: 依存関係のインストール
Write-Host "ステップ2: 依存関係のインストール" -ForegroundColor Yellow
Write-Host "----------------------------------------"

$nodeModulesExists = Test-Path "node_modules"
if (-not $nodeModulesExists) {
    Write-Host "📦 npm install を実行中..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install に失敗しました" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 依存関係のインストール完了" -ForegroundColor Green
} else {
    Write-Host "✅ node_modules が存在します（スキップ）" -ForegroundColor Green
}
Write-Host ""

# ステップ3: ビルド
Write-Host "ステップ3: ビルド" -ForegroundColor Yellow
Write-Host "----------------------------------------"

if (-not $SkipBuild) {
    Write-Host "🔨 ビルド中..." -ForegroundColor Cyan
    npm run build:backend
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ビルドに失敗しました" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ ビルド完了" -ForegroundColor Green
} else {
    Write-Host "⏭️  ビルドをスキップ" -ForegroundColor Yellow
}
Write-Host ""

# ステップ4: v2.0 APIテスト
Write-Host "ステップ4: v2.0 APIテスト準備" -ForegroundColor Yellow
Write-Host "----------------------------------------"
Write-Host "開発サーバーを起動します..." -ForegroundColor Cyan
Write-Host ""
Write-Host "別のターミナルで以下のコマンドを実行してテストしてください：" -ForegroundColor Yellow
Write-Host ""
Write-Host "  # v2.0 API情報取得" -ForegroundColor Cyan
Write-Host '  Invoke-RestMethod -Uri "http://localhost:4000/api/v2" -Method GET' -ForegroundColor White
Write-Host ""
Write-Host "  # または、テストスクリプトを使用" -ForegroundColor Cyan
Write-Host "  .\scripts\test-v2-api.ps1" -ForegroundColor White
Write-Host ""
Write-Host "サーバーを停止するには Ctrl+C を押してください" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# サーバー起動
npm run dev:backend
