#!/bin/bash

# ============================================================================
# BESS Site Survey System v2.0 API テストスクリプト
# ============================================================================

API_URL="${API_URL:-http://localhost:4000}"
TOKEN="${JWT_TOKEN:-}"

echo "=========================================="
echo "BESS v2.0 API テスト"
echo "=========================================="
echo "API URL: $API_URL"
echo ""

# 色の定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ヘルパー関数
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    
    echo -e "${YELLOW}Testing:${NC} $description"
    echo "  $method $endpoint"
    
    if [ -n "$data" ]; then
        response=$(curl -s -X $method \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data" \
            "$API_URL$endpoint")
    else
        response=$(curl -s -X $method \
            -H "Authorization: Bearer $TOKEN" \
            "$API_URL$endpoint")
    fi
    
    if echo "$response" | grep -q '"success":true\|"status":"running"'; then
        echo -e "  ${GREEN}✓ Success${NC}"
    else
        echo -e "  ${RED}✗ Failed${NC}"
        echo "  Response: $response"
    fi
    echo ""
}

# 1. バージョン情報の確認
echo "=========================================="
echo "1. バージョン情報"
echo "=========================================="
test_endpoint "GET" "/api/v2" "v2.0 API情報取得"

# 2. CSVテンプレートのダウンロード
echo "=========================================="
echo "2. CSVテンプレート"
echo "=========================================="
if [ -n "$TOKEN" ]; then
    test_endpoint "GET" "/api/v2/import/template" "CSVテンプレートダウンロード"
else
    echo -e "${YELLOW}⚠ JWT_TOKEN が設定されていないため、認証が必要なエンドポイントはスキップします${NC}"
    echo ""
fi

# 3. サイト一覧の取得
echo "=========================================="
echo "3. サイト管理"
echo "=========================================="
if [ -n "$TOKEN" ]; then
    test_endpoint "GET" "/api/v2/sites?page=1&limit=10" "サイト一覧取得"
else
    echo -e "${YELLOW}⚠ JWT_TOKEN が設定されていないため、スキップします${NC}"
    echo ""
fi

echo "=========================================="
echo "テスト完了"
echo "=========================================="
echo ""
echo "認証が必要なエンドポイントをテストするには:"
echo "  export JWT_TOKEN='your-jwt-token'"
echo "  ./scripts/test-v2-api.sh"
echo ""
echo "カスタムAPIエンドポイントを使用するには:"
echo "  export API_URL='https://your-api.com'"
echo "  ./scripts/test-v2-api.sh"
echo ""
