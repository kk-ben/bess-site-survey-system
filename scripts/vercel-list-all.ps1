# Vercel全プロジェクト一覧取得

$VERCEL_TOKEN = "vck_2iKWpNXhHnxmPwuppODTnEgFHBi5qvwl9kjRPZAw2DmsltBzov3VxdHv"

Write-Host "=== Vercel 全プロジェクト一覧 ===" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    Write-Host "プロジェクト数: $($response.projects.Count)" -ForegroundColor Green
    Write-Host ""
    
    $response.projects | ForEach-Object {
        Write-Host "名前: $($_.name)" -ForegroundColor Yellow
        Write-Host "  ID: $($_.id)" -ForegroundColor White
        Write-Host "  Framework: $($_.framework)" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "エラー: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
