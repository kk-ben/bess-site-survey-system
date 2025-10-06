# Vercelプロジェクト情報取得スクリプト

$VERCEL_TOKEN = "vck_2iKWpNXhHnxmPwuppODTnEgFHBi5qvwl9kjRPZAw2DmsltBzov3VxdHv"

Write-Host "=== Vercel プロジェクト情報取得 ===" -ForegroundColor Cyan
Write-Host ""

# プロジェクト一覧を取得
$response = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects" `
    -Method GET `
    -Headers @{
        "Authorization" = "Bearer $VERCEL_TOKEN"
    }

# bess-site-survey-systemを検索
$project = $response.projects | Where-Object { $_.name -eq "bess-site-survey-system" }

if ($project) {
    Write-Host "✓ プロジェクトが見つかりました" -ForegroundColor Green
    Write-Host ""
    Write-Host "プロジェクト名: $($project.name)" -ForegroundColor White
    Write-Host "プロジェクトID: $($project.id)" -ForegroundColor Yellow
    Write-Host "フレームワーク: $($project.framework)" -ForegroundColor White
    Write-Host "作成日: $($project.createdAt)" -ForegroundColor White
    Write-Host ""
    
    # PROJECT_CREDENTIALS.mdに保存する情報を表示
    Write-Host "=== PROJECT_CREDENTIALS.mdに追加する情報 ===" -ForegroundColor Cyan
    Write-Host "Project ID: $($project.id)" -ForegroundColor Yellow
    
    # 次のステップを表示
    Write-Host ""
    Write-Host "=== 次のステップ ===" -ForegroundColor Cyan
    Write-Host "1. このProject IDをPROJECT_CREDENTIALS.mdに保存" -ForegroundColor White
    Write-Host "2. scripts/vercel-set-env.ps1を実行して環境変数を設定" -ForegroundColor White
    
} else {
    Write-Host "✗ プロジェクトが見つかりませんでした" -ForegroundColor Red
    Write-Host ""
    Write-Host "利用可能なプロジェクト:" -ForegroundColor Yellow
    $response.projects | ForEach-Object {
        Write-Host "  - $($_.name) (ID: $($_.id))" -ForegroundColor White
    }
}
