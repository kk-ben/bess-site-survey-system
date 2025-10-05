#!/bin/bash

# ============================================================================
# BESS v2.0 API - VPS Home Directory Deploy Script
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================================
# Configuration
# ============================================================================

APP_DIR="$HOME/bess-site-survey-system"
APP_NAME="bess-api"

# ============================================================================
# Main Process
# ============================================================================

echo
log_info "========================================="
log_info "BESS v2.0 API - VPS Deploy Starting"
log_info "========================================="
echo

# Step 1: Navigate to project directory
log_info "Step 1: Navigating to project directory..."
cd $APP_DIR || {
    log_error "Project directory not found: $APP_DIR"
    exit 1
}
log_success "Directory navigation complete"

# Step 2: Pull latest code
log_info "Step 2: Pulling latest code..."
git fetch origin
git pull origin main
log_success "Code pull complete"

# Step 3: Install dependencies
log_info "Step 3: Installing dependencies..."
npm install
log_success "Dependencies installed"

# Step 4: Build TypeScript
log_info "Step 4: Building TypeScript..."
npm run build
log_success "Build complete"

# Step 5: Create/update environment file
log_info "Step 5: Checking environment file..."
if [ ! -f "$APP_DIR/.env.production" ]; then
    log_info "Creating .env.production..."
    cat > $APP_DIR/.env.production << 'ENVEOF'
# BESS Site Survey System v2.0 - Production Environment

NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Supabase Configuration
SUPABASE_URL=https://kcohexmvbccxixyfvjyw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUxODQwMSwiZXhwIjoyMDc1MDk0NDAxfQ.CSUPZBrUNadTwxi3pmCorovhSmf8uogbrkpyQowj0N0

DATABASE_URL=postgresql://postgres.kcohexmvbccxixyfvjyw:katsumi0536@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres

API_VERSION=v2.0
API_BASE_URL=https://api.ps-system.jp/api

CORS_ORIGIN=*

JWT_SECRET=bess-v2-production-secret-key-2025
JWT_EXPIRES_IN=7d

REDIS_HOST=localhost
REDIS_PORT=6379

LOG_LEVEL=info
LOG_DIR=./logs
ENVEOF
    log_success ".env.production created"
else
    log_info ".env.production already exists"
fi

# Step 6: Create log directory
log_info "Step 6: Creating log directory..."
mkdir -p $APP_DIR/logs
log_success "Log directory created"

# Step 7: Restart application with PM2
log_info "Step 7: Restarting application with PM2..."

# Stop existing process
pm2 stop $APP_NAME 2>/dev/null || log_info "No existing process found"

# Start new process
pm2 start $APP_DIR/dist/index.js --name $APP_NAME --env production

# Save PM2 configuration
pm2 save

log_success "PM2 restart complete"

# Step 8: Health check
log_info "Step 8: Performing health check..."
sleep 5

# v2.0 API check
if curl -f -s http://localhost:3000/api/v2/health > /dev/null 2>&1; then
    log_success "v2.0 API: Running normally"
else
    log_info "v2.0 API: No response (may be starting up)"
fi

# Step 9: Display PM2 status
log_info "Step 9: Checking PM2 status..."
pm2 status

# Completion message
echo
log_success "========================================="
log_success "BESS v2.0 API Deploy Complete!"
log_success "========================================="
echo
log_info "API Info:"
log_info "  - v1.0 API: https://api.ps-system.jp/api/v1"
log_info "  - v2.0 API: https://api.ps-system.jp/api/v2"
echo
log_info "Health Check Commands:"
log_info "  curl https://api.ps-system.jp/api/v2/health"
log_info "  curl https://api.ps-system.jp/api/v2/sites"
echo
log_info "Log Check Commands:"
log_info "  pm2 logs $APP_NAME"
log_info "  pm2 logs $APP_NAME --lines 100"
echo
log_info "Restart Command:"
log_info "  pm2 restart $APP_NAME"
echo

# Display latest logs
log_info "Latest logs (20 lines):"
pm2 logs $APP_NAME --lines 20 --nostream

echo
log_success "Deploy script execution complete!"
echo
