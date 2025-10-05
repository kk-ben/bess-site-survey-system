# ============================================================================
# BESS Site Survey System v2.0 API テストスクリプト (PowerShell)
# ============================================================================

param(
    [string]$ApiUrl = "http://localhost:4000",
    [string]$Token = $env:JWT_TOKEN
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "BESS v2.0 API テスト" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "API URL: $ApiUrl"
Write-Host ""

# ヘルパー関数
function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [string]$Data = $null
    )
    
    Write-Host "Testing: " -NoNewline -ForegroundColor Yellow
    Write-Host $Description
    Write-Host "  $Method $Endpoint"
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$ApiUrl$Endpoint"
            Method = $Method
            Headers = $headers
        }
        
        if ($Data) {
            $params["Body"] = $Data
        }
        
        $response = Invoke-RestMethod @params
        
        if ($response.success -eq $true -or $response.status -eq "running") {
            Write-Host "  ✓ Success" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Failed" -ForegroundColor Red
            Write-Host "  Response: $($response | ConvertTo-Json -Depth 3)"
        }
    }
    catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

# 1. バージョン情報の確認
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "1. バージョン情報" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/v2" -Description "v2.0 API情報取得"

# 2. CSVテンプレートのダウンロード
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "2. CSVテンプレート" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
if ($Token) {
    Test-Endpoint -Method "GET" -Endpoint "/api/v2/import/template" -Description "CSVテンプレートダウンロード"
} else {
    Write-Host "⚠ JWT_TOKEN が設定されていないため、認証が必要なエンドポイントはスキップします" -ForegroundColor Yellow
    Write-Host ""
}

# 3. サイト一覧の取得
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "3. サイト管理" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
if ($Token) {
    Test-Endpoint -Method "GET" -Endpoint "/api/v2/sites?page=1&limit=10" -Description "サイト一覧取得"
} else {
    Write-Host "⚠ JWT_TOKEN が設定されていないため、スキップします" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "テスト完了" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "認証が必要なエンドポイントをテストするには:"
Write-Host '  $env:JWT_TOKEN = "your-jwt-token"'
Write-Host "  .\scripts\test-v2-api.ps1"
Write-Host ""
Write-Host "カスタムAPIエンドポイントを使用するには:"
Write-Host '  .\scripts\test-v2-api.ps1 -ApiUrl "https://your-api.com"'
Write-Host ""
