# ============================================================================
# Supabase v2.0 スキーマセットアップ支援スクリプト
# ============================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Supabase v2.0 スキーマセットアップ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# スキーマファイルのパス
$schemaFile = "database\migrations\002_v2_clean_install.sql"

if (-not (Test-Path $schemaFile)) {
    Write-Host "❌ スキーマファイルが見つかりません: $schemaFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 スキーマファイル: $schemaFile" -ForegroundColor Green
Write-Host ""

# ファイルの内容を読み込む
$schemaContent = Get-Content $schemaFile -Raw
$lineCount = ($schemaContent -split "`n").Count

Write-Host "📊 スキーマ情報:" -ForegroundColor Yellow
Write-Host "   行数: $lineCount"
Write-Host "   サイズ: $([math]::Round((Get-Item $schemaFile).Length / 1KB, 2)) KB"
Write-Host ""

# クリップボードにコピー
try {
    Set-Clipboard -Value $schemaContent
    Write-Host "✅ スキーマをクリップボードにコピーしました！" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "⚠️  クリップボードへのコピーに失敗しました" -ForegroundColor Yellow
    Write-Host "   手動でファイルを開いてコピーしてください" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "次の手順:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ブラウザでSupabaseを開く" -ForegroundColor White
Write-Host "   https://supabase.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. プロジェクトを選択" -ForegroundColor White
Write-Host ""
Write-Host "3. SQL Editorを開く" -ForegroundColor White
Write-Host "   左サイドバー → SQL Editor → New query" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. スキーマを貼り付けて実行" -ForegroundColor White
Write-Host "   Ctrl+V で貼り付け → Run ボタンをクリック" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. 成功を確認" -ForegroundColor White
Write-Host '   "Success. No rows returned" と表示されればOK' -ForegroundColor Cyan
Write-Host ""
Write-Host "6. テーブルを確認" -ForegroundColor White
Write-Host "   左サイドバー → Table Editor" -ForegroundColor Cyan
Write-Host "   以下のテーブルが作成されていることを確認：" -ForegroundColor Cyan
Write-Host "   - sites" -ForegroundColor White
Write-Host "   - grid_info" -ForegroundColor White
Write-Host "   - geo_risk" -ForegroundColor White
Write-Host "   - land_regulatory" -ForegroundColor White
Write-Host "   - access_physical" -ForegroundColor White
Write-Host "   - economics" -ForegroundColor White
Write-Host "   - automation_sources" -ForegroundColor White
Write-Host "   - scores" -ForegroundColor White
Write-Host "   - audit_log" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Supabaseを開くか確認
$response = Read-Host "Supabaseをブラウザで開きますか？ (y/n)"
if ($response -eq "y") {
    Start-Process "https://supabase.com"
    Write-Host "✅ ブラウザでSupabaseを開きました" -ForegroundColor Green
}

Write-Host ""
Write-Host "スキーマ実行後、以下のコマンドで接続情報を設定してください：" -ForegroundColor Yellow
Write-Host ""
Write-Host "  # .envファイルを編集" -ForegroundColor Cyan
Write-Host "  notepad .env" -ForegroundColor White
Write-Host ""
Write-Host "  # 以下を追加（Supabaseから取得）" -ForegroundColor Cyan
Write-Host "  SUPABASE_URL=https://xxxxx.supabase.co" -ForegroundColor White
Write-Host "  SUPABASE_SERVICE_ROLE_KEY=eyJhbGc..." -ForegroundColor White
Write-Host ""
