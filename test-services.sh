#!/bin/bash

# Comprehensive Test Script for Job Tracker Microservices
echo "🧪 Testing Job Tracker Microservices"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    response=$(curl -s -w "%{http_code}" "$url" -o /tmp/test_response)
    status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $status_code, expected $expected_status)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "Response: $(cat /tmp/test_response)"
    fi
}

# Test POST endpoint
test_post_endpoint() {
    local name=$1
    local url=$2
    local data=$3
    local expected_status=${4:-200}
    
    echo -n "Testing $name... "
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    response=$(curl -s -w "%{http_code}" -X POST "$url" \
        -H "Content-Type: application/json" \
        -d "$data" -o /tmp/test_response)
    status_code="${response: -3}"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $status_code, expected $expected_status)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        echo "Response: $(cat /tmp/test_response)"
    fi
}

echo "🔍 Testing Health Endpoints..."

# Health checks
test_endpoint "API Gateway Health" "http://localhost:3000/api/health"
test_endpoint "Applications Service Health" "http://localhost:4001/api/health"
test_endpoint "Contacts Service Health" "http://localhost:4002/api/health"
test_endpoint "Analytics Service Health" "http://localhost:4003/api/health"
test_endpoint "Resumes Service Health" "http://localhost:4004/api/health"
test_endpoint "Export Service Health" "http://localhost:4005/api/health"
test_endpoint "Templates Service Health" "http://localhost:4006/api/health"
test_endpoint "Chrome Extension Service Health" "http://localhost:4007/api/health"
test_endpoint "Payments Service Health" "http://localhost:4008/api/health"

echo ""
echo "📊 Testing Data Endpoints..."

# Test Applications endpoints
test_endpoint "Get Applications (via Gateway)" "http://localhost:3000/api/applications"
test_endpoint "Get Applications (Direct)" "http://localhost:4001/api/applications"

# Test sample application creation
test_post_endpoint "Create Application (via Gateway)" "http://localhost:3000/api/applications" \
    '{"jobTitle":"Test Engineer","company":"Test Corp","status":"Applied","applicationDate":"2024-01-15"}' 201

# Test Contacts endpoints
test_endpoint "Get Contacts (via Gateway)" "http://localhost:3000/api/contacts"
test_endpoint "Get Contacts (Direct)" "http://localhost:4002/api/contacts"

# Test sample contact creation
test_post_endpoint "Create Contact (via Gateway)" "http://localhost:3000/api/contacts" \
    '{"name":"Test Person","email":"test@example.com","company":"Test Corp","position":"Engineer"}' 201

# Test Analytics endpoints
test_endpoint "Analytics Overview" "http://localhost:3000/api/analytics/overview"
test_endpoint "Status Distribution" "http://localhost:3000/api/analytics/status-distribution"
test_endpoint "Timeline Data" "http://localhost:3000/api/analytics/timeline"
test_endpoint "Portal Analysis" "http://localhost:3000/api/analytics/portals"

# Test Templates endpoints
test_endpoint "Get Templates" "http://localhost:3000/api/templates"
test_endpoint "Get Template Categories" "http://localhost:3000/api/templates/categories"

# Test Payments endpoints
test_endpoint "Get Subscription Plans" "http://localhost:3000/api/payments/plans"
test_endpoint "Get User Subscription" "http://localhost:3000/api/payments/subscription/test_user"
test_endpoint "Get Usage Analytics" "http://localhost:3000/api/payments/usage/test_user"

# Test Chrome Extension endpoints
test_endpoint "Extension Summary" "http://localhost:3000/api/chrome-extension/summary"
test_endpoint "Extension Health" "http://localhost:3000/api/chrome-extension/health"

echo ""
echo "📁 Testing Export Endpoints..."

# Test Export endpoints (these should trigger downloads)
test_endpoint "Export Applications CSV" "http://localhost:3000/api/export/applications/csv"
test_endpoint "Export Contacts CSV" "http://localhost:3000/api/export/contacts/csv"
test_endpoint "Export Applications JSON" "http://localhost:3000/api/export/applications/json"

echo ""
echo "🎯 Testing Frontend Access..."

# Test Frontend
test_endpoint "Frontend Access" "http://localhost:8080"

echo ""
echo "📈 Test Results Summary"
echo "======================="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Your microservices are working correctly.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check the services and try again.${NC}"
    exit 1
fi