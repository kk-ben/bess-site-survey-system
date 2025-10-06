# Vercel環境変数更新スクリプト - Nginx経由のURL

Write-Host "🔧 Vercel環境変数を更新します..." -ForegroundColor Cyan
Write-Host ""

# プロジェクトID
$PROJECT_ID = "prj_gYxqLqxqLqxqLqxqLqxqLqxq"

# 環境変数を更新
Write-Host "📝 VITE_API_BASE_URLを更新中..." -ForegroundColor Yellow
vercel env rm VITE_API_BASE_URL production --yes
vercel env add VITE_API_BASE_URL production

Write-Host ""
Write-Host "✅ 環境変数更新完了！" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 次のコマンドでデプロイしてください:" -ForegroundColor Cyan
Write-Host "  cd bess-site-survey-system/frontend" -ForegroundColor White
Write-Host "  vercel --prod" -ForegroundColor White
Write-Host ""
