# HTTPS移行スクリプト - 全ファイル一括更新

$ErrorActionPreference = "Stop"

$OLD_HTTP_URL = "http://153.121.61.164:3000"
$NEW_HTTPS_URL = "https://ps-system.jp"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HTTPS移行スクリプト" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "変更内容:" -ForegroundColor Yellow
Write-Host "  旧URL: $OLD_HTTP_URL" -ForegroundColor Red
Write-Host "  新URL: $NEW_HTTPS_URL" -ForegroundColor Green
Write-Host ""

# 確認プロンプト
$confirmation = Read-Host "この変更を実行しますか？ (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "キャンセルしました。" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ステップ1: フロントエンド環境設定" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. frontend/.env.production
$envProdFile = "frontend\.env.production"
if (Test-Path $envProdFile) {
    Write-Host "更新中: $envProdFile" -ForegroundColor Yellow
    $content = Get-Content $envProdFile -Raw -Encoding UTF8
    $content = $content -replace [regex]::Escape("$OLD_HTTP_URL/api/v2"), "$NEW_HTTPS_URL/api/v2"
    Set-Content $envProdFile -Value $content -Encoding UTF8 -NoNewline
    Write-Host "  ✅ 完了" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ ファイルが見つかりません: $envProdFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ステップ2: バックエンド環境設定" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 2. .env.example - ALLOWED_ORIGINS更新
$envExampleFile = ".env.example"
if (Test-Path $envExampleFile) {
    Write-Host "更新中: $envExampleFile" -ForegroundColor Yellow
    $content = Get-Content $envExampleFile -Raw -Encoding UTF8
    
    # ALLOWED_ORIGINSにHTTPSドメインを追加
    if ($content -match "ALLOWED_ORIGINS=([^\r\n]+)") {
        $currentOrigins = $matches[1]
        if ($currentOrigins -notmatch "https://ps-system\.jp") {
            $newOrigins = "$currentOrigins,https://ps-system.jp"
            $content = $content -replace "ALLOWED_ORIGINS=[^\r\n]+", "ALLOWED_ORIGINS=$newOrigins"
            Set-Content $envExampleFile -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  ✅ ALLOWED_ORIGINSを更新" -ForegroundColor Green
        } else {
            Write-Host "  ⏭️ 既に設定済み" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "  ⚠️ ファイルが見つかりません: $envExampleFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ステップ3: PowerShellスクリプト" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$scriptFiles = @(
    "scripts\vercel-set-env.ps1",
    "scripts\vercel-setup-complete.ps1",
    "scripts\vercel-setup-personal.ps1"
)

foreach ($file in $scriptFiles) {
    if (Test-Path $file) {
        Write-Host "更新中: $file" -ForegroundColor Yellow
        $content = Get-Content $file -Raw -Encoding UTF8
        $originalContent = $content
        
        # URL置換
        $content = $content -replace [regex]::Escape("$OLD_HTTP_URL/api/v2"), "$NEW_HTTPS_URL/api/v2"
        
        if ($content -ne $originalContent) {
            Set-Content $file -Value $content -Encoding UTF8 -NoNewline
            Write-Host "  ✅ 完了" -ForegroundColor Green
        } else {
            Write-Host "  ⏭️ 変更なし" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⚠️ ファイルが見つかりません: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  更新完了サマリー" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ ローカルファイルの更新が完了しました！" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  次のステップ（手動作業が必要）" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 ステップ1: VPS設定の更新" -ForegroundColor Yellow
Write-Host ""
Write-Host "  SSH接続:" -ForegroundColor White
Write-Host "    ssh ubuntu@153.121.61.164" -ForegroundColor Gray
Write-Host ""
Write-Host "  .env.productionを編集:" -ForegroundColor White
Write-Host "    cd /home/ubuntu/bess-site-survey-system" -ForegroundColor Gray
Write-Host "    nano .env.production" -ForegroundColor Gray
Write-Host ""
Write-Host "  以下の行を追加/更新:" -ForegroundColor White
Write-Host "    ALLOWED_ORIGINS=https://bess-site-survey-system.vercel.app,https://ps-system.jp" -ForegroundColor Cyan
Write-Host ""
Write-Host "  保存後、APIを再起動:" -ForegroundColor White
Write-Host "    pm2 restart bess-api" -ForegroundColor Gray
Write-Host "    pm2 logs bess-api --lines 50" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 ステップ2: Vercel環境変数の更新" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. https://vercel.com/dashboard にアクセス" -ForegroundColor White
Write-Host "  2. プロジェクト選択: bess-site-survey-system" -ForegroundColor White
Write-Host "  3. Settings → Environment Variables" -ForegroundColor White
Write-Host "  4. VITE_API_BASE_URL を編集:" -ForegroundColor White
Write-Host "     値: https://ps-system.jp/api/v2" -ForegroundColor Cyan
Write-Host "  5. Save をクリック" -ForegroundColor White
Write-Host ""

Write-Host "📋 ステップ3: 再デプロイ" -ForegroundColor Yellow
Write-Host ""
Write-Host "  方法1: Vercel CLIを使用" -ForegroundColor White
Write-Host "    cd frontend" -ForegroundColor Gray
Write-Host "    vercel --prod" -ForegroundColor Gray
Write-Host ""
Write-Host "  方法2: GitHubにプッシュ（自動デプロイ）" -ForegroundColor White
Write-Host "    git add ." -ForegroundColor Gray
Write-Host "    git commit -m `"Migrate to HTTPS (ps-system.jp)`"" -ForegroundColor Gray
Write-Host "    git push origin main" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 ステップ4: 動作確認" -ForegroundColor Yellow
Write-Host ""
Write-Host "  API Health Check:" -ForegroundColor White
Write-Host "    Invoke-RestMethod -Uri `"https://ps-system.jp/api/v2/health`"" -ForegroundColor Gray
Write-Host ""
Write-Host "  サイト一覧取得:" -ForegroundColor White
Write-Host "    Invoke-RestMethod -Uri `"https://ps-system.jp/api/v2/sites`"" -ForegroundColor Gray
Write-Host ""
Write-Host "  フロントエンド確認:" -ForegroundColor White
Write-Host "    ブラウザでVercel URLを開く" -ForegroundColor Gray
Write-Host "    F12 → Network タブでAPI呼び出しを確認" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  詳細情報" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📄 詳細な手順書: HTTPS_MIGRATION_PLAN.md" -ForegroundColor White
Write-Host "🔗 Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "🔗 新ドメイン: https://ps-system.jp" -ForegroundColor White
Write-Host ""
