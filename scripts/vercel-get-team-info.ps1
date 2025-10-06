# Vercelチーム情報とプロジェクト取得スクリプト

$VERCEL_TOKEN = "vck_2iKWpNXhHnxmPwuppODTnEgFHBi5qvwl9kjRPZAw2DmsltBzov3VxdHv"

Write-Host "=== Vercel チーム情報取得 ===" -ForegroundColor Cyan
Write-Host ""

try {
    # チーム情報を取得
    $teams = Invoke-RestMethod -Uri "https://api.vercel.com/v2/teams" `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $VERCEL_TOKEN"
        }
    
    Write-Host "チーム数: $($teams.teams.Count)" -ForegroundColor Green
    Write-Host ""
    
    foreach ($team in $teams.teams) {
        Write-Host "チーム名: $($team.name)" -ForegroundColor Yellow
        Write-Host "  ID: $($team.id)" -ForegroundColor White
        Write-Host "  Slug: $($team.slug)" -ForegroundColor Gray
        Write-Host ""
        
        # 各チームのプロジェクトを取得
        try {
            $projects = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects?teamId=$($team.id)" `
                -Method GET `
                -Headers @{
                    "Authorization" = "Bearer $VERCEL_TOKEN"
                }
            
            Write-Host "  プロジェクト数: $($projects.projects.Count)" -ForegroundColor Cyan
            
            foreach ($project in $projects.projects) {
                Write-Host "    - $($project.name)" -ForegroundColor White
                Write-Host "      ID: $($project.id)" -ForegroundColor Gray
                
                if ($project.name -eq "bess-site-survey-system") {
                    Write-Host "      ★ 目的のプロジェクトが見つかりました！" -ForegroundColor Green
                    Write-Host ""
                    Write-Host "=== 設定情報 ===" -ForegroundColor Cyan
                    Write-Host "Team ID: $($team.id)" -ForegroundColor Yellow
                    Write-Host "Project ID: $($project.id)" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "  プロジェクト取得エラー: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host ""
    }
    
    # 個人アカウントのプロジェクトも確認
    Write-Host "=== 個人アカウントのプロジェクト ===" -ForegroundColor Cyan
    try {
        $personalProjects = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects" `
            -Method GET `
            -Headers @{
                "Authorization" = "Bearer $VERCEL_TOKEN"
            }
        
        Write-Host "個人プロジェクト数: $($personalProjects.projects.Count)" -ForegroundColor Green
        
        foreach ($project in $personalProjects.projects) {
            Write-Host "  - $($project.name)" -ForegroundColor White
            Write-Host "    ID: $($project.id)" -ForegroundColor Gray
            
            if ($project.name -eq "bess-site-survey-system") {
                Write-Host "    ★ 目的のプロジェクトが見つかりました！" -ForegroundColor Green
                Write-Host ""
                Write-Host "=== 設定情報 ===" -ForegroundColor Cyan
                Write-Host "Project ID: $($project.id)" -ForegroundColor Yellow
                Write-Host "Team ID: (個人アカウント - 不要)" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "個人プロジェクト取得エラー: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "エラー: $($_.Exception.Message)" -ForegroundColor Red
}
