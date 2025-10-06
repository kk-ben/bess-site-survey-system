# Git コミット & プッシュスクリプト - HTTPS移行

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Git コミット & プッシュ" -ForegroundColor Cyan
Write-Host "  HTTPS移行対応" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Gitの状態確認
Write-Host "Git状態を確認中..." -ForegroundColor Yellow
Write-Host ""

try {
    $gitStatus = git status --porcelain
    
    if ([string]::IsNullOrWhiteSpace($gitStatus)) {
        Write-Host "✅ 変更されたファイルはありません" -ForegroundColor Green
        Write-Host ""
        Write-Host "すでにコミット済みか、変更がない状態です。" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "変更されたファイル:" -ForegroundColor Cyan
    git status --short
    Write-Host ""
    
} catch {
    Write-Host "❌ Gitリポジトリではないか、Gitがインストールされていません" -ForegroundColor Red
    Write-Host ""
    Write-Host "Gitのインストール:" -ForegroundColor Yellow
    Write-Host "  https://git-scm.com/download/win" -ForegroundColor White
    exit 1
}

# 変更内容の確認
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  変更内容の確認" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$confirmation = Read-Host "変更内容を確認しますか？ (y/N)"
if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    Write-Host ""
    git diff --stat
    Write-Host ""
}

# コミットメッセージ
$defaultMessage = "Migrate to HTTPS: Update API URL to https://ps-system.jp"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  コミットメッセージ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "デフォルトメッセージ:" -ForegroundColor Yellow
Write-Host "  $defaultMessage" -ForegroundColor White
Write-Host ""

$customMessage = Read-Host "カスタムメッセージを入力（Enterでデフォルト使用）"
if ([string]::IsNullOrWhiteSpace($customMessage)) {
    $commitMessage = $defaultMessage
} else {
    $commitMessage = $customMessage
}

Write-Host ""
Write-Host "使用するメッセージ:" -ForegroundColor Cyan
Write-Host "  $commitMessage" -ForegroundColor Green
Write-Host ""

# 最終確認
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  最終確認" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "以下の操作を実行します:" -ForegroundColor Yellow
Write-Host "  1. git add ." -ForegroundColor White
Write-Host "  2. git commit -m `"$commitMessage`"" -ForegroundColor White
Write-Host "  3. git push origin main" -ForegroundColor White
Write-Host ""

$finalConfirmation = Read-Host "実行しますか？ (y/N)"
if ($finalConfirmation -ne 'y' -and $finalConfirmation -ne 'Y') {
    Write-Host ""
    Write-Host "キャンセルしました。" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "手動でコミットする場合:" -ForegroundColor Cyan
    Write-Host "  git add ." -ForegroundColor White
    Write-Host "  git commit -m `"$commitMessage`"" -ForegroundColor White
    Write-Host "  git push origin main" -ForegroundColor White
    Write-Host ""
    exit 0
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  実行中" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

try {
    # git add
    Write-Host "ステップ1: ファイルをステージング中..." -ForegroundColor Yellow
    git add .
    Write-Host "  ✅ git add 完了" -ForegroundColor Green
    Write-Host ""
    
    # git commit
    Write-Host "ステップ2: コミット中..." -ForegroundColor Yellow
    git commit -m $commitMessage
    Write-Host "  ✅ git commit 完了" -ForegroundColor Green
    Write-Host ""
    
    # 現在のブランチを取得
    $currentBranch = git branch --show-current
    Write-Host "現在のブランチ: $currentBranch" -ForegroundColor Cyan
    Write-Host ""
    
    # git push
    Write-Host "ステップ3: プッシュ中..." -ForegroundColor Yellow
    Write-Host "  リモート: origin" -ForegroundColor Gray
    Write-Host "  ブランチ: $currentBranch" -ForegroundColor Gray
    Write-Host ""
    
    git push origin $currentBranch
    
    Write-Host ""
    Write-Host "  ✅ git push 完了" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  完了" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ GitHubへのプッシュが完了しました！" -ForegroundColor Green
    Write-Host ""
    
    # コミット情報を表示
    Write-Host "最新のコミット:" -ForegroundColor Cyan
    git log -1 --oneline
    Write-Host ""
    
    # リモートURLを表示
    $remoteUrl = git remote get-url origin
    Write-Host "リモートリポジトリ:" -ForegroundColor Cyan
    Write-Host "  $remoteUrl" -ForegroundColor White
    Write-Host ""
    
    # Vercel自動デプロイの案内
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  次のステップ" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Vercelの自動デプロイを確認:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. Vercel Dashboard にアクセス" -ForegroundColor White
    Write-Host "     https://vercel.com/dashboard" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. プロジェクトを選択: bess-site-survey-system" -ForegroundColor White
    Write-Host ""
    Write-Host "  3. Deployments タブで進行状況を確認" -ForegroundColor White
    Write-Host ""
    Write-Host "  4. デプロイ完了後、動作確認:" -ForegroundColor White
    Write-Host "     - ブラウザでVercel URLを開く" -ForegroundColor Gray
    Write-Host "     - F12 → Network タブでAPI呼び出しを確認" -ForegroundColor Gray
    Write-Host "     - https://ps-system.jp/api/v2/... が呼ばれているか確認" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "⚠️ 注意事項:" -ForegroundColor Yellow
    Write-Host "  - Vercelの環境変数が更新されていることを確認してください" -ForegroundColor White
    Write-Host "  - VITE_API_BASE_URL = https://ps-system.jp/api/v2" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  環境変数が未更新の場合:" -ForegroundColor White
    Write-Host "    .\scripts\vercel-update-https.ps1" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ エラーが発生しました: $_" -ForegroundColor Red
    Write-Host ""
    
    # よくあるエラーの対処法
    if ($_ -match "rejected") {
        Write-Host "🔧 リモートに新しい変更がある可能性があります" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "解決方法:" -ForegroundColor Cyan
        Write-Host "  1. リモートの変更を取得:" -ForegroundColor White
        Write-Host "     git pull origin $currentBranch" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  2. 競合を解決（必要な場合）" -ForegroundColor White
        Write-Host ""
        Write-Host "  3. 再度プッシュ:" -ForegroundColor White
        Write-Host "     git push origin $currentBranch" -ForegroundColor Gray
        Write-Host ""
    }
    elseif ($_ -match "authentication" -or $_ -match "permission") {
        Write-Host "🔧 認証エラーの可能性があります" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "解決方法:" -ForegroundColor Cyan
        Write-Host "  1. GitHubの認証情報を確認" -ForegroundColor White
        Write-Host "  2. Personal Access Token (PAT) を使用している場合は有効期限を確認" -ForegroundColor White
        Write-Host "  3. SSH鍵を使用している場合は設定を確認" -ForegroundColor White
        Write-Host ""
        Write-Host "GitHub認証設定:" -ForegroundColor Cyan
        Write-Host "  https://docs.github.com/ja/authentication" -ForegroundColor Gray
        Write-Host ""
    }
    else {
        Write-Host "🔧 一般的な解決方法:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  1. Git状態を確認:" -ForegroundColor White
        Write-Host "     git status" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  2. リモート設定を確認:" -ForegroundColor White
        Write-Host "     git remote -v" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  3. ブランチを確認:" -ForegroundColor White
        Write-Host "     git branch -a" -ForegroundColor Gray
        Write-Host ""
    }
    
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  完了チェックリスト" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "- [ ] GitHubリポジトリで最新コミットを確認" -ForegroundColor White
Write-Host "- [ ] Vercelで自動デプロイが開始されたか確認" -ForegroundColor White
Write-Host "- [ ] Vercel環境変数が更新済みか確認" -ForegroundColor White
Write-Host "- [ ] デプロイ完了後、フロントエンドにアクセス" -ForegroundColor White
Write-Host "- [ ] API呼び出しがHTTPSになっているか確認" -ForegroundColor White
Write-Host "- [ ] ログイン・データ取得テスト" -ForegroundColor White
Write-Host ""

Write-Host "詳細な手順書: HTTPS_MIGRATION_QUICKSTART.md" -ForegroundColor Cyan
Write-Host ""
