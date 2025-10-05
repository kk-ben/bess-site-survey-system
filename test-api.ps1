# ============================================================================
# BESS v2.0 API テストスクリプト
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BESS v2.0 API テスト" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# サーバー接続確認
Write-Host "🔍 サーバー接続確認..." -ForegroundColor Yellow
try {
    $null = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ サーバーが起動しています" -ForegroundColor Green
} catch {
    Write-Host "❌ サーバーに接続できません" -ForegroundColor Red
    Write-Host ""
    Write-Host "サーバーを起動してください:" -ForegroundColor Yellow
    Write-Host "  .\start-server.ps1" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""

# v2.0 API情報取得
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "テスト1: v2.0 API情報取得" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v2" -Method GET -ErrorAction Stop
    Write-Host "✅ 成功" -ForegroundColor Green
    Write-Host ""
    Write-Host "レスポンス:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ 失敗: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# CSVテンプレートダウンロード
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "テスト2: CSVテンプレートダウンロード" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/v2/import/template" -Method GET -ErrorAction Stop
    Write-Host "✅ 成功" -ForegroundColor Green
    Write-Host "  Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor White
    Write-Host "  サイズ: $($response.Content.Length) bytes" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ 失敗: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# サイト一覧取得（認証なし - エラーが期待される）
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "テスト3: サイト一覧取得（認証なし）" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/v2/sites" -Method GET -ErrorAction Stop
    Write-Host "✅ 成功（認証が不要になっています）" -ForegroundColor Yellow
    Write-Host ""
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ 期待通り（認証エラー）" -ForegroundColor Green
        Write-Host "  認証が正しく機能しています" -ForegroundColor White
    } else {
        Write-Host "❌ 予期しないエラー: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "テスト完了" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "次のステップ:" -ForegroundColor Yellow
Write-Host "1. Supabaseでテストデータを投入" -ForegroundColor White
Write-Host "2. 認証トークンを取得してAPIテスト" -ForegroundColor White
Write-Host ""
