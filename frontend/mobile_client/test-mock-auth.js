#!/usr/bin/env node

/**
 * Test script for mock authentication flow
 * Tests both frontend mock token generation and backend verification
 */

const AUTH_SERVICE_URL = 'http://localhost:4101';

// Simulate a mock Firebase ID token (matching frontend MockAuthService format)
function generateMockFirebaseToken(email = 'test@test.com') {
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };
  
  const payload = {
    iss: 'https://securetoken.google.com/mock-project',
    aud: 'mock-project',
    auth_time: Math.floor(Date.now() / 1000),
    user_id: 'mock-firebase-005',
    sub: 'mock-firebase-005',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    email: email,
    email_verified: true,
    firebase: {
      identities: {
        email: [email],
      },
      sign_in_provider: 'password',
    },
  };
  
  const encodeBase64 = (obj) => {
    const json = JSON.stringify(obj);
    return Buffer.from(json).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };
  
  return `${encodeBase64(header)}.${encodeBase64(payload)}.mock-firebase-signature`;
}

// Test the /api/auth/verify endpoint
async function testMockAuthentication() {
  console.log('🧪 Testing Mock Authentication Flow\n');
  console.log('================================\n');
  
  const testCases = [
    { email: 'test@test.com', name: 'Default Test User' },
    { email: 'john.hero@test.com', name: 'John Hero' },
    { email: 'sarah.journey@test.com', name: 'Sarah Journey' },
  ];
  
  for (const testCase of testCases) {
    console.log(`\n📧 Testing with user: ${testCase.name} (${testCase.email})`);
    console.log('-'.repeat(50));
    
    try {
      // Generate mock token
      const mockToken = generateMockFirebaseToken(testCase.email);
      console.log('✅ Generated mock Firebase token');
      
      // Send to backend
      const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: mockToken,
          deviceId: 'test-device-123',
          userAgent: 'TestScript/1.0',
        }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Backend rejected token:', error);
        continue;
      }
      
      const data = await response.json();
      console.log('✅ Backend accepted token and returned JWT');
      console.log('📝 Response:', {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        userId: data.user?.id,
        userEmail: data.user?.email,
        displayName: data.user?.displayName,
      });
      
      // Verify the access token works
      if (data.accessToken) {
        const verifyResponse = await fetch(`${AUTH_SERVICE_URL}/api/auth/verify`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.accessToken}`,
          },
        });
        
        if (verifyResponse.ok) {
          console.log('✅ Access token verified successfully');
        } else {
          console.log('⚠️  Access token verification failed');
        }
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    }
  }
  
  console.log('\n================================');
  console.log('✨ Mock Authentication Tests Complete!\n');
}

// Check if backend is running
async function checkBackendHealth() {
  try {
    const response = await fetch(`${AUTH_SERVICE_URL}/api/auth/health`);
    if (!response.ok) {
      throw new Error('Backend is not responding');
    }
    const data = await response.json();
    console.log('✅ Backend is running:', data);
    return true;
  } catch (error) {
    console.error('❌ Backend is not accessible at', AUTH_SERVICE_URL);
    console.error('   Make sure docker-compose is running');
    return false;
  }
}

// Main execution
async function main() {
  console.log('\n🚀 Mock Authentication Test Script\n');
  
  // Check backend health first
  const isBackendReady = await checkBackendHealth();
  if (!isBackendReady) {
    process.exit(1);
  }
  
  // Run authentication tests
  await testMockAuthentication();
}

main().catch(console.error);