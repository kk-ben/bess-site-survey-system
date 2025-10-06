# ============================================================================
# BESS Site Survey System v2.0 - Local Deployment Script (PowerShell)
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Blue
Write-Host "BESS Site Survey System v2.0 - Local Deployment" -ForegroundColor Blue
Write-Host "============================================================================" -ForegroundColor Blue
Write-Host ""

# ============================================================================
# 1. 環境確認
# ============================================================================
Write-Host "[1/7] 環境確認中..." -ForegroundColor Yellow

# Node.js確認
$nodeVersion = node -v
Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green

# npm確認
$npmVersion = npm -v
Write-Host "✓ npm: $npmVersion" -ForegroundColor Green

# .env.production確認
if (!(Test-Path ".env.production")) {
    Write-Host "❌ .env.production ファイルが見つかりません" -ForegroundColor Red
    Write-Host "   .env.production を作成してください" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ .env.production 確認完了" -ForegroundColor Green

Write-Host ""

# ============================================================================
# 2. 依存関係のインストール
# ============================================================================
Write-Host "[2/7] 依存関係のインストール中..." -ForegroundColor Yellow

Write-Host "  バックエンドの依存関係..." -ForegroundColor Cyan
npm install --legacy-peer-deps

Write-Host "  フロントエンドの依存関係..." -ForegroundColor Cyan
Set-Location frontend
npm install --legacy-peer-deps
Set-Location ..

Write-Host "✓ 依存関係のインストール完了" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 3. テスト実行（オプション）
# ============================================================================
Write-Host "[3/7] テスト実行（スキップ可能）..." -ForegroundColor Yellow
$runTests = Read-Host "テストを実行しますか？ (y/N)"

if ($runTests -eq "y" -or $runTests -eq "Y") {
    Write-Host "  バックエンドテスト..." -ForegroundColor Cyan
    npm test -- --passWithNoTests
    
    Write-Host "  フロントエンドテスト..." -ForegroundColor Cyan
    Set-Location frontend
    npm test -- --passWithNoTests --run
    Set-Location ..
    
    Write-Host "✓ テスト完了" -ForegroundColor Green
} else {
    Write-Host "  テストをスキップしました" -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# 4. ビルド
# ============================================================================
Write-Host "[4/7] ビルド中..." -ForegroundColor Yellow

Write-Host "  バックエンドビルド..." -ForegroundColor Cyan
npm run build

Write-Host "  フロントエンドビルド..." -ForegroundColor Cyan
Set-Location frontend
npm run build
Set-Location ..

Write-Host "✓ ビルド完了" -ForegroundColor Green
Write-Host ""

# ============================================================================
# 5. ログディレクトリ作成
# ============================================================================
Write-Host "[5/7] ログディレクトリ作成..." -ForegroundColor Yellow

if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
    Write-Host "✓ logsディレクトリ作成完了" -ForegroundColor Green
} else {
    Write-Host "✓ logsディレクトリ確認完了" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# 6. 起動方法の選択
# ============================================================================
Write-Host "[6/7] 起動方法の選択..." -ForegroundColor Yellow
Write-Host ""
Write-Host "起動方法を選択してください:" -ForegroundColor Cyan
Write-Host "  1) 開発モード（ホットリロード）" -ForegroundColor White
Write-Host "  2) 本番モード（ビルド済み）" -ForegroundColor White
Write-Host "  3) 両方を別ターミナルで起動（推奨）" -ForegroundColor White
Write-Host ""

$choice = Read-Host "選択 (1-3)"

Write-Host ""

# ============================================================================
# 7. アプリケーション起動
# ============================================================================
Write-Host "[7/7] アプリケーション起動..." -ForegroundColor Yellow

switch ($choice) {
    "1" {
        Write-Host "開発モードで起動します..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "バックエンド: http://localhost:4000" -ForegroundColor Green
        Write-Host "フロントエンド: 別ターミナルで 'cd frontend && npm run dev' を実行" -ForegroundColor Yellow
        Write-Host ""
        npm run dev
    }
    "2" {
        Write-Host "本番モードで起動します..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "バックエンド: http://localhost:4000" -ForegroundColor Green
        Write-Host "フロントエンド: frontend/dist を静的ホスティング" -ForegroundColor Yellow
        Write-Host ""
        npm start
    }
    "3" {
        Write-Host "両方を起動します..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✓ バックエンドを起動中..." -ForegroundColor Green
        Write-Host "  URL: http://localhost:4000" -ForegroundColor Cyan
        Write-Host ""
        
        # バックエンドを別プロセスで起動
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"
        
        Start-Sleep -Seconds 3
        
        Write-Host "✓ フロントエンドを起動中..." -ForegroundColor Green
        Write-Host "  URL: http://localhost:3000" -ForegroundColor Cyan
        Write-Host ""
        
        # フロントエンドを別プロセスで起動
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"
        
        Write-Host ""
        Write-Host "============================================================================" -ForegroundColor Green
        Write-Host "✅ デプロイ完了！" -ForegroundColor Green
        Write-Host "============================================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "アクセスURL:" -ForegroundColor Cyan
        Write-Host "  フロントエンド: http://localhost:3000" -ForegroundColor White
        Write-Host "  バックエンドAPI: http://localhost:4000" -ForegroundColor White
        Write-Host "  ヘルスチェック: http://localhost:4000/api/monitoring/health" -ForegroundColor White
        Write-Host ""
        Write-Host "停止方法: 各ターミナルで Ctrl+C" -ForegroundColor Yellow
        Write-Host ""
    }
    default {
        Write-Host "無効な選択です" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "デプロイ完了時刻: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Blue
