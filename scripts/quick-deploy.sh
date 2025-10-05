#!/bin/bash
# Quick VPS Deploy Script

ssh ubuntu@153.121.61.164 << 'ENDSSH'
set -e

echo "=== BESS v2.0 API - VPS Deploy ==="
echo ""

cd /var/www/bess-site-survey-system

echo "Pulling latest code..."
git pull origin main

echo "Setting permissions..."
chmod +x scripts/vps-deploy-v2.sh

echo "Running deploy script..."
./scripts/vps-deploy-v2.sh

echo ""
echo "=== Deploy Complete ==="
ENDSSH
