# ================================================
# Supabase セットアップスクリプト
# ================================================
# このスクリプトは対話的にSupabaseの設定を行います
# ================================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  BESS Site Survey System" -ForegroundColor Cyan
Write-Host "  Supabase オンライン環境セットアップ" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ステップ1: Supabaseプロジェクト情報の入力
Write-Host "ステップ1: Supabaseプロジェクト情報" -ForegroundColor Yellow
Write-Host "Supabase Dashboard (https://supabase.com/dashboard) から以下の情報を取得してください" -ForegroundColor Gray
Write-Host ""

$projectRef = Read-Host "Project Reference ID (例: abcdefghijklmnop)"
$dbPassword = Read-Host "Database Password" -AsSecureString
$dbPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

# 接続文字列の生成
$databaseUrl = "postgresql://postgres.${projectRef}:${dbPasswordPlain}@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres"

Write-Host ""
Write-Host "✅ データベース接続文字列を生成しました" -ForegroundColor Green
Write-Host ""

# ステップ2: JWT Secretの生成
Write-Host "ステップ2: JWT Secretの生成" -ForegroundColor Yellow

$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$jwtRefreshSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

Write-Host "✅ JWT Secretを生成しました" -ForegroundColor Green
Write-Host ""

# ステップ3: .env.productionファイルの作成
Write-Host "ステップ3: 本番環境変数ファイルの作成" -ForegroundColor Yellow

$envContent = @"
# Supabase本番環境設定
# 生成日時: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Database
DATABASE_URL=$databaseUrl

# Redis (後で設定)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=$jwtSecret
JWT_REFRESH_SECRET=$jwtRefreshSecret

# Application
NODE_ENV=production
PORT=4000

# CORS (後でフロントエンドURLに更新)
ALLOWED_ORIGINS=http://localhost:3000

# Google Maps API (後で設定)
GOOGLE_MAPS_API_KEY=your-api-key-here

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# External APIs
OSM_OVERPASS_URL=https://overpass-api.de/api/interpreter
CHUDEN_CSV_URL=https://example.com/chuden-data.csv

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
"@

$envContent | Out-File -FilePath ".env.production" -Encoding UTF8

Write-Host "✅ .env.production ファイルを作成しました" -ForegroundColor Green
Write-Host ""

# ステップ4: 次のステップの案内
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  次のステップ" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Supabase SQL Editorで以下のファイルを実行:" -ForegroundColor White
Write-Host "   - database/supabase-setup.sql" -ForegroundColor Gray
Write-Host "   - database/migrations/001_initial_schema.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Vercel CLIをインストール（まだの場合）:" -ForegroundColor White
Write-Host "   npm i -g vercel" -ForegroundColor Gray
Write-Host "   vercel login" -ForegroundColor Gray
Write-Host ""
Write-Host "3. バックエンドをデプロイ:" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor Gray
Write-Host ""
Write-Host "4. フロントエンドをデプロイ:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   vercel --prod" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  生成された情報" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database URL: $databaseUrl" -ForegroundColor Gray
Write-Host "JWT Secret: $jwtSecret" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  これらの情報は .env.production に保存されています" -ForegroundColor Yellow
Write-Host "⚠️  セキュリティのため、このファイルをGitにコミットしないでください" -ForegroundColor Yellow
Write-Host ""
