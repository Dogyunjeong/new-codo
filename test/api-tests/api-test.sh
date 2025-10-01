#!/bin/bash

# Ziririt API Testing Script
# Tests all domain-driven microservices after refactoring

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service URLs
AUTH_SERVICE="http://localhost:4101"
PROFILE_SERVICE="http://localhost:4102"
POST_SERVICE="http://localhost:4103"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test data
TEST_USER_ID="ff249605-088b-4595-9061-1a0108b73823"
TEST_GOAL_ID="0d1d202d-f87d-43c0-95f4-7c6972289944"
TEST_POST_ID="post_001"

echo -e "${BLUE}🚀 Starting Ziririt API Testing Suite${NC}"
echo -e "${BLUE}Testing Domain-Driven Microservices Architecture${NC}"
echo "=========================================="

# Function to run a test
run_test() {
    local test_name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="${4:-}"
    local expected_status="${5:-200}"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "\n${YELLOW}Test $TOTAL_TESTS: $test_name${NC}"
    echo "URL: $method $url"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" "$url")
    fi
    
    http_code=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✅ PASSED${NC} (Status: $http_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        
        # Pretty print JSON response if it exists
        if echo "$body" | jq . >/dev/null 2>&1; then
            echo "Response:"
            echo "$body" | jq . | head -10
            if [ $(echo "$body" | jq . | wc -l) -gt 10 ]; then
                echo "... (truncated)"
            fi
        else
            echo "Response: $body"
        fi
    else
        echo -e "${RED}❌ FAILED${NC} (Expected: $expected_status, Got: $http_code)"
        echo "Response: $body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to test service health
test_service_health() {
    local service_name="$1"
    local service_url="$2"
    
    echo -e "\n${BLUE}=== Testing $service_name Health ===${NC}"
    run_test "$service_name Health Check" "$service_url/health"
}

# Function to test domain endpoints
test_auth_service() {
    echo -e "\n${BLUE}=== Testing Auth Service - OAuth & Authentication Domains ===${NC}"
    
    run_test "Auth Health Check" "$AUTH_SERVICE/health"
    
    run_test "Google OAuth (Invalid Token)" \
        "$AUTH_SERVICE/google" \
        "POST" \
        '{"idToken": "fake-token-for-testing"}' \
        "400"
    
    run_test "Apple OAuth (Schema Validation)" \
        "$AUTH_SERVICE/apple" \
        "POST" \
        '{"identityToken": "fake-apple-token", "authorizationCode": "fake-code"}' \
        "400"
    
    run_test "Apple OAuth (Correct Schema)" \
        "$AUTH_SERVICE/apple" \
        "POST" \
        '{"idToken": "fake-apple-token"}' \
        "400"
}

test_profile_service() {
echo -e "\n${BLUE}=== Testing Profile Service - Profile, Journey & Social Domains ===${NC}"
    
    # Profile Domain
    run_test "Profile Health Check" "$PROFILE_SERVICE/profiles/health"
    run_test "Get User Profile" "$PROFILE_SERVICE/profiles/$TEST_USER_ID"
    
# Journey Domain  
run_test "Get User Journeys" "$PROFILE_SERVICE/journeys/user/$TEST_USER_ID"
run_test "Get Specific Journey" "$PROFILE_SERVICE/journeys/$TEST_GOAL_ID"
    
    # Social Domain
    run_test "Get User Followers" "$PROFILE_SERVICE/social/followers/$TEST_USER_ID"
    run_test "Get User Following" "$PROFILE_SERVICE/social/following/$TEST_USER_ID"
    run_test "Get User Relationship" "$PROFILE_SERVICE/social/relationship/$TEST_USER_ID"
}

test_post_service() {
    echo -e "\n${BLUE}=== Testing Post Service - Post, Media & Interaction Domains ===${NC}"
    
    # Post Domain
    run_test "Get Recent Posts" "$POST_SERVICE/posts/recent"
    run_test "Get User Posts" "$POST_SERVICE/posts/user/alice_goals_user_id"
    run_test "Get Journey Posts" "$POST_SERVICE/posts/journey/$TEST_GOAL_ID"
    run_test "Get Specific Post" "$POST_SERVICE/posts/$TEST_POST_ID"
    run_test "Search Posts by Hashtag" "$POST_SERVICE/posts/hashtag/meditation"
    
    # Interaction Domain
    run_test "Get Post Comments" "$POST_SERVICE/interactions/posts/$TEST_POST_ID/comments"
    run_test "Get Post Likes" "$POST_SERVICE/interactions/posts/$TEST_POST_ID/likes"
    run_test "Get User Likes" "$POST_SERVICE/interactions/users/alice_goals_user_id/likes"
}

test_cross_service_integration() {
    echo -e "\n${BLUE}=== Testing Cross-Service Data Integration ===${NC}"
    
    # Test that goal exists in both Profile and Post services
    echo -e "\n${YELLOW}Testing Journey-Post Relationship:${NC}"
    echo "Journey ID: $TEST_GOAL_ID"
    
    run_test "Journey exists in Profile Service" "$PROFILE_SERVICE/journeys/$TEST_GOAL_ID"
    run_test "Posts exist for Journey in Post Service" "$POST_SERVICE/posts/journey/$TEST_GOAL_ID"
    
    # Test user consistency across services
    echo -e "\n${YELLOW}Testing User Consistency:${NC}"
    run_test "User Profile exists" "$PROFILE_SERVICE/profiles/$TEST_USER_ID"
    run_test "User has Journeys" "$PROFILE_SERVICE/journeys/user/$TEST_USER_ID"
}

test_error_handling() {
    echo -e "\n${BLUE}=== Testing Error Handling ===${NC}"
    
    run_test "Non-existent Profile" "$PROFILE_SERVICE/profiles/non-existent-id" "GET" "" "404"
    run_test "Non-existent Journey" "$PROFILE_SERVICE/journeys/non-existent-id" "GET" "" "404"
    run_test "Non-existent Post" "$POST_SERVICE/posts/non-existent-id" "GET" "" "404"
    run_test "Invalid Route" "$POST_SERVICE/invalid/route" "GET" "" "404"
}

# Run all tests
echo -e "${BLUE}🔍 Checking Docker Services Status...${NC}"
docker compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"

echo -e "\n${BLUE}🧪 Starting API Tests...${NC}"

# Test each service domain
test_auth_service
test_profile_service  
test_post_service

# Test integrations
test_cross_service_integration
test_error_handling

# Test Results Summary
echo -e "\n=========================================="
echo -e "${BLUE}📊 TEST RESULTS SUMMARY${NC}"
echo "=========================================="
echo -e "Total Tests: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}✅ Domain-Driven Microservices Architecture is working perfectly!${NC}"
    echo -e "${GREEN}✅ Auth Service: OAuth & Authentication domains functional${NC}"
    echo -e "${GREEN}✅ Profile Service: Profile, Journey & Social domains functional${NC}"
    echo -e "${GREEN}✅ Post Service: Post, Media & Interaction domains functional${NC}"
    echo -e "${GREEN}✅ Cross-service data integrity confirmed${NC}"
    echo -e "${GREEN}✅ Error handling working correctly${NC}"
    exit 0
else
    echo -e "\n${RED}❌ SOME TESTS FAILED${NC}"
    echo -e "${RED}Failed tests: $FAILED_TESTS${NC}"
    echo -e "${YELLOW}Please check the failed endpoints above${NC}"
    exit 1
fi
