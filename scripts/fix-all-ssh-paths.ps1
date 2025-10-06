# SSH情報とパス一括修正スクリプト

$ErrorActionPreference = "Stop"

Write-Host "=== SSH情報とパス一括修正 ===" -ForegroundColor Cyan

$files = Get-ChildItem -Path "." -Include "*.md","*.sh","*.ps1" -Recurse | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*dist*" }

$count = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($null -eq $content) { continue }
    
    $modified = $false
    $original = $content
    
    # ubuntu@153.121.61.164 → ubuntu@153.121.61.164
    if ($content -match "root@153\.121\.61\.164") {
        $content = $content -replace "root@153\.121\.61\.164", "ubuntu@153.121.61.164"
        $modified = $true
    }
    
    # /home/ubuntu/bess-site-survey-system → /home/ubuntu/bess-site-survey-system
    if ($content -match "/home/ubuntu/bess-site-survey-system") {
        $content = $content -replace "/home/ubuntu/bess-site-survey-system", "/home/ubuntu/bess-site-survey-system"
        $modified = $true
    }
    
    if ($modified) {
        Set-Content $file.FullName -Value $content -Encoding UTF8 -NoNewline
        Write-Host "✅ $($file.Name)" -ForegroundColor Green
        $count++
    }
}

Write-Host "`n完了: $count ファイルを修正しました" -ForegroundColor Green
