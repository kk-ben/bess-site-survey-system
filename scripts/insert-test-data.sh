#!/bin/bash

# Supabase接続情報
SUPABASE_URL="https://kcohexmvbccxixyfvjyw.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtjb2hleG12YmNjeGl4eWZ2anl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUxODQwMSwiZXhwIjoyMDc1MDk0NDAxfQ.CSUPZBrUNadTwxi3pmCorovhSmf8uogbrkpyQowj0N0"

echo "📊 テストデータ投入開始..."

# サイト1: 茨城県つくば市
echo "1. 茨城県つくば市 工業団地跡地"
curl -X POST "${SUPABASE_URL}/rest/v1/sites" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "茨城県つくば市 工業団地跡地",
    "latitude": 36.0839,
    "longitude": 140.0764,
    "address": "茨城県つくば市東光台5-19",
    "capacity_mw": 15.5,
    "status": "approved",
    "created_by": "admin@example.com"
  }'

echo ""
echo "2. 千葉県市原市 埋立地"
curl -X POST "${SUPABASE_URL}/rest/v1/sites" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "千葉県市原市 埋立地",
    "latitude": 35.4980,
    "longitude": 140.1156,
    "address": "千葉県市原市五井南海岸1-1",
    "capacity_mw": 12.0,
    "status": "approved",
    "created_by": "admin@example.com"
  }'

echo ""
echo "3. 大阪府堺市 臨海工業地帯"
curl -X POST "${SUPABASE_URL}/rest/v1/sites" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "大阪府堺市 臨海工業地帯",
    "latitude": 34.5833,
    "longitude": 135.4297,
    "address": "大阪府堺市西区築港新町1-5-1",
    "capacity_mw": 25.0,
    "status": "evaluated",
    "created_by": "admin@example.com"
  }'

echo ""
echo "✅ テストデータ投入完了！"
