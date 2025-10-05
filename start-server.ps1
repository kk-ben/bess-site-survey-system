# ============================================================================
# BESS v2.0 サーバー起動スクリプト
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BESS v2.0 サーバー起動" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 環境変数チェック
if (-not (Test-Path ".env")) {
    Write-Host "❌ .envファイルが見つかりません" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 環境変数ファイル確認完了" -ForegroundColor Green
Write-Host ""

# ビルド確認
if (-not (Test-Path "dist")) {
    Write-Host "📦 ビルドを実行します..." -ForegroundColor Yellow
    npm run build:backend
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ビルドに失敗しました" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ ビルド確認完了" -ForegroundColor Green
Write-Host ""

# サーバー起動
Write-Host "🚀 サーバーを起動します..." -ForegroundColor Cyan
Write-Host ""
Write-Host "サーバーを停止するには Ctrl+C を押してください" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev:backend
