# Vercel環境変数更新スクリプト - HTTPS対応

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Vercel環境変数更新（HTTPS対応）" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vercel CLIのインストール確認
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLIがインストールされていません" -ForegroundColor Red
    Write-Host ""
    Write-Host "インストール方法:" -ForegroundColor Yellow
    Write-Host "  npm install -g vercel" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""

# プロジェクト情報
$PROJECT_NAME = "bess-site-survey-system"
$NEW_API_URL = "https://ps-system.jp/api/v2"

Write-Host "プロジェクト: $PROJECT_NAME" -ForegroundColor Cyan
Write-Host "新しいAPI URL: $NEW_API_URL" -ForegroundColor Green
Write-Host ""

# 確認プロンプト
$confirmation = Read-Host "Vercel環境変数を更新しますか？ (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "キャンセルしました。" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  環境変数の更新" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# frontendディレクトリに移動
$frontendPath = "frontend"
if (Test-Path $frontendPath) {
    Push-Location $frontendPath
    Write-Host "✅ frontendディレクトリに移動しました" -ForegroundColor Green
} else {
    Write-Host "❌ frontendディレクトリが見つかりません" -ForegroundColor Red
    exit 1
}

Write-Host ""

try {
    # 既存の環境変数を削除
    Write-Host "既存のVITE_API_BASE_URLを削除中..." -ForegroundColor Yellow
    
    # Production環境
    try {
        vercel env rm VITE_API_BASE_URL production --yes 2>$null
        Write-Host "  ✅ Production環境から削除" -ForegroundColor Green
    } catch {
        Write-Host "  ⏭️ Production環境に存在しないか、既に削除済み" -ForegroundColor Gray
    }
    
    # Preview環境
    try {
        vercel env rm VITE_API_BASE_URL preview --yes 2>$null
        Write-Host "  ✅ Preview環境から削除" -ForegroundColor Green
    } catch {
        Write-Host "  ⏭️ Preview環境に存在しないか、既に削除済み" -ForegroundColor Gray
    }
    
    # Development環境
    try {
        vercel env rm VITE_API_BASE_URL development --yes 2>$null
        Write-Host "  ✅ Development環境から削除" -ForegroundColor Green
    } catch {
        Write-Host "  ⏭️ Development環境に存在しないか、既に削除済み" -ForegroundColor Gray
    }
    
    Write-Host ""
    
    # 新しい環境変数を追加
    Write-Host "新しいVITE_API_BASE_URLを追加中..." -ForegroundColor Yellow
    Write-Host "  値: $NEW_API_URL" -ForegroundColor Cyan
    Write-Host ""
    
    # Production環境に追加
    Write-Host "Production環境に追加中..." -ForegroundColor Yellow
    $env:VERCEL_ENV_VALUE = $NEW_API_URL
    echo $NEW_API_URL | vercel env add VITE_API_BASE_URL production
    Write-Host "  ✅ Production環境に追加完了" -ForegroundColor Green
    
    # Preview環境に追加
    Write-Host "Preview環境に追加中..." -ForegroundColor Yellow
    echo $NEW_API_URL | vercel env add VITE_API_BASE_URL preview
    Write-Host "  ✅ Preview環境に追加完了" -ForegroundColor Green
    
    # Development環境に追加
    Write-Host "Development環境に追加中..." -ForegroundColor Yellow
    echo $NEW_API_URL | vercel env add VITE_API_BASE_URL development
    Write-Host "  ✅ Development環境に追加完了" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  環境変数の確認" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # 環境変数一覧を表示
    Write-Host "現在の環境変数:" -ForegroundColor Yellow
    vercel env ls
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  更新完了" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Vercel環境変数の更新が完了しました！" -ForegroundColor Green
    Write-Host ""
    
    # 再デプロイの確認
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  再デプロイ" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $deployConfirmation = Read-Host "今すぐ本番環境に再デプロイしますか？ (y/N)"
    if ($deployConfirmation -eq 'y' -or $deployConfirmation -eq 'Y') {
        Write-Host ""
        Write-Host "本番環境にデプロイ中..." -ForegroundColor Yellow
        vercel --prod
        Write-Host ""
        Write-Host "✅ デプロイ完了！" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "後で手動でデプロイしてください:" -ForegroundColor Yellow
        Write-Host "  vercel --prod" -ForegroundColor White
        Write-Host ""
        Write-Host "または、GitHubにプッシュして自動デプロイ:" -ForegroundColor Yellow
        Write-Host "  git push origin main" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  次のステップ" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 動作確認:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. API Health Check:" -ForegroundColor White
    Write-Host "     Invoke-RestMethod -Uri `"https://ps-system.jp/api/v2/health`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. フロントエンドアクセス:" -ForegroundColor White
    Write-Host "     ブラウザでVercel URLを開く" -ForegroundColor Gray
    Write-Host "     F12 → Network タブでAPI呼び出しを確認" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. ログイン・データ取得テスト" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ エラーが発生しました: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "手動で設定する場合:" -ForegroundColor Yellow
    Write-Host "  1. https://vercel.com/dashboard にアクセス" -ForegroundColor White
    Write-Host "  2. プロジェクト選択: $PROJECT_NAME" -ForegroundColor White
    Write-Host "  3. Settings → Environment Variables" -ForegroundColor White
    Write-Host "  4. VITE_API_BASE_URL を編集" -ForegroundColor White
    Write-Host "     値: $NEW_API_URL" -ForegroundColor Cyan
    Write-Host ""
} finally {
    # 元のディレクトリに戻る
    Pop-Location
}

Write-Host ""
Write-Host "詳細な手順書: HTTPS_MIGRATION_PLAN.md" -ForegroundColor Cyan
Write-Host ""
