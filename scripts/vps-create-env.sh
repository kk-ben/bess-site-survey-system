#!/bin/bash

# ============================================================================
# VPS環境変数ファイル作成スクリプト
# ============================================================================

set -e

APP_DIR="/home/ubuntu/bess-site-survey-system"

echo "Creating .env.production file..."

cat > $APP_DIR/.env.production << 'EOF'
# ============================================================================
# BESS Site Survey System v2.0 - Production Environment
# ============================================================================

# Server Configuration
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Supabase Configuration
SUPABASE_URL=https://kcohexmvbccxixyfvjyw.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MTg0MDEsImV4cCI6MjA3NTA5NDQwMX0.KWt6AlZanxkgcvyqT8iCbomUVzdFGc5NZGOJzcg8k7k
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUxODQwMSwiZXhwIjoyMDc1MDk0NDAxfQ.CSUPZBrUNadTwxi3pmCorovhSmf8uogbrkpyQowj0N0

# Database Direct Connection
DATABASE_URL=postgresql://postgres.kcohexmvbccxixyfvjyw:katsumi0536@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres

# API Configuration
API_VERSION=v2.0
API_BASE_URL=https://api.ps-system.jp/api

# CORS Configuration
CORS_ORIGIN=*
ALLOWED_ORIGINS=https://bess-site-survey-system.vercel.app,https://ps-system.jp,http://localhost:3000,http://localhost:5173

# JWT Configuration
JWT_SECRET=bess-v2-production-secret-key-2025
JWT_EXPIRES_IN=7d

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# External APIs
GOOGLE_MAPS_API_KEY=
OSM_API_URL=https://nominatim.openstreetmap.org
GSI_API_URL=https://cyberjapandata.gsi.go.jp

# n8n Workflow
N8N_WEBHOOK_URL=
N8N_API_KEY=
EOF

echo "✅ .env.production file created successfully!"
echo ""
echo "File location: $APP_DIR/.env.production"
echo ""
echo "Next steps:"
echo "1. pm2 restart bess-api"
echo "2. pm2 logs bess-api"
