#!/bin/bash

# Test Authentication Endpoints Script
# Usage: ./scripts/test-auth-endpoints.sh

BASE_URL="${AUTH_SERVICE_URL:-http://localhost:4101}"
MOCK_TOKEN="mock.firebase.idtoken"
DEVICE_ID="test-device-$(date +%s)"

echo "Testing Auth Service Endpoints at $BASE_URL"
echo "==========================================="

# Test health endpoint
echo -e "\n1. Testing Health Endpoint..."
curl -s "$BASE_URL/health" | jq '.'

# Test verify endpoint with mock token
echo -e "\n2. Testing Verify Endpoint (will fail with mock token)..."
curl -s -X POST "$BASE_URL/verify" \
  -H "Content-Type: application/json" \
  -d "{\"idToken\": \"$MOCK_TOKEN\", \"deviceId\": \"$DEVICE_ID\"}" | jq '.'

# Test refresh endpoint
echo -e "\n3. Testing Refresh Endpoint (will fail without valid token)..."
curl -s -X POST "$BASE_URL/refresh" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "mock.refresh.token"}' | jq '.'

# Test session endpoint (requires auth)
echo -e "\n4. Testing Session Endpoint (will fail without auth)..."
curl -s "$BASE_URL/session" \
  -H "Authorization: Bearer mock.access.token" | jq '.'

# Test me endpoint (requires auth)
echo -e "\n5. Testing Me Endpoint (will fail without auth)..."
curl -s "$BASE_URL/me" \
  -H "Authorization: Bearer mock.access.token" | jq '.'

echo -e "\n==========================================="
echo "Note: Failures are expected with mock tokens."
echo "To test with real tokens, you need to:"
echo "1. Configure Firebase service account credentials"
echo "2. Get a valid Firebase ID token from the mobile client"
echo "3. Replace MOCK_TOKEN with the real token"