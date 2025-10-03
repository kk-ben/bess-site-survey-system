# BESS Site Survey System - Local Deployment Script (Windows PowerShell)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BESS Site Survey System - Local Deploy" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Prerequisites
Write-Host "[1/8] Checking prerequisites..." -ForegroundColor Yellow

# Check Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker is not installed" -ForegroundColor Red
    Write-Host "Please install Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Check Docker Compose
if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Docker Compose is not installed" -ForegroundColor Red
    exit 1
}

# Check Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js 18+: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

$nodeVersion = node --version
Write-Host "SUCCESS: Docker, Docker Compose, Node.js ($nodeVersion) are available" -ForegroundColor Green
Write-Host ""

# 2. Create Environment Files
Write-Host "[2/8] Creating environment files..." -ForegroundColor Yellow

if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "SUCCESS: Created .env file" -ForegroundColor Green
    Write-Host "WARNING: Please edit .env file with your settings" -ForegroundColor Yellow
} else {
    Write-Host "SUCCESS: .env file already exists" -ForegroundColor Green
}

if (!(Test-Path "frontend/.env")) {
    if (Test-Path "frontend/.env.example") {
        Copy-Item "frontend/.env.example" "frontend/.env"
        Write-Host "SUCCESS: Created frontend/.env file" -ForegroundColor Green
        Write-Host "WARNING: Please set Google Maps API key" -ForegroundColor Yellow
    } else {
        Write-Host "WARNING: frontend/.env.example not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "SUCCESS: frontend/.env file already exists" -ForegroundColor Green
}
Write-Host ""

# 3. Install Dependencies
Write-Host "[3/8] Installing dependencies..." -ForegroundColor Yellow

Write-Host "Installing backend dependencies..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install backend dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "Installing frontend dependencies..." -ForegroundColor Gray
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install frontend dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host "SUCCESS: Dependencies installed" -ForegroundColor Green
Write-Host ""

# 4. Start Docker Containers
Write-Host "[4/8] Starting Docker containers..." -ForegroundColor Yellow

docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to start Docker containers" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: Docker containers started" -ForegroundColor Green
Write-Host ""

# 5. Wait for Database
Write-Host "[5/8] Waiting for database..." -ForegroundColor Yellow

$maxAttempts = 30
$attempt = 0
$dbReady = $false

while ($attempt -lt $maxAttempts -and !$dbReady) {
    $attempt++
    Write-Host "Connection attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    
    $result = docker exec bess-postgres pg_isready -U bess_user 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dbReady = $true
        Write-Host "SUCCESS: Database is ready" -ForegroundColor Green
    } else {
        Start-Sleep -Seconds 2
    }
}

if (!$dbReady) {
    Write-Host "ERROR: Database startup timeout" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 6. Run Database Migration
Write-Host "[6/8] Running database migration..." -ForegroundColor Yellow

npm run migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Database migration failed" -ForegroundColor Red
    Write-Host "Please run manually: npm run migrate" -ForegroundColor Yellow
} else {
    Write-Host "SUCCESS: Database migration completed" -ForegroundColor Green
}
Write-Host ""

# 7. Seed Initial Data
Write-Host "[7/8] Seeding initial data..." -ForegroundColor Yellow

if (Test-Path "scripts/seed.ts") {
    npm run seed
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Initial data seeded" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Skipped initial data seeding" -ForegroundColor Yellow
    }
} else {
    Write-Host "WARNING: Seed script not found" -ForegroundColor Yellow
}
Write-Host ""

# 8. Deployment Complete
Write-Host "[8/8] Deployment complete" -ForegroundColor Yellow

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUCCESS: Deployment completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend API: http://localhost:4000" -ForegroundColor Cyan
Write-Host "  PostgreSQL: localhost:5432" -ForegroundColor Cyan
Write-Host "  Redis: localhost:6379" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Start backend: npm run dev" -ForegroundColor White
Write-Host "  2. Start frontend: cd frontend; npm run dev" -ForegroundColor White
Write-Host "  3. Open browser: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Default Login:" -ForegroundColor Yellow
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Stop Services:" -ForegroundColor Yellow
Write-Host "  docker-compose down" -ForegroundColor White
Write-Host ""
Write-Host "View Logs:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f" -ForegroundColor White
Write-Host ""
Write-Host "Happy Surveying!" -ForegroundColor Cyan
