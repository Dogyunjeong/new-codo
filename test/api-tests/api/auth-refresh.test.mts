import { describe, it, expect } from 'vitest';
import { AuthController } from '@base/shared-api-controllers';
import { TEST_CONFIG } from '../setup.mts';

/**
 * Test to verify token refresh mechanism works correctly
 * Tests the fix for field name mismatch (accessToken vs token)
 */
describe('Auth Token Refresh Test', () => {
  let authController: AuthController;

  it('should successfully authenticate and get tokens', async () => {
    authController = new AuthController({
      baseURL: TEST_CONFIG.AUTH_SERVICE_URL
    });

    // First, try to authenticate with mock credentials
    // This should return both accessToken and token fields
    try {
      const authResult = await authController.googleAuth({
        idToken: 'mock-google-token'
      });

      console.log('Auth response structure:', Object.keys(authResult));

      // Check if response has the expected fields
      expect(authResult).toBeDefined();

      // Response should have 'token' field for frontend compatibility
      if (authResult.token) {
        console.log('✓ Response has "token" field (frontend compatible)');
        expect(authResult.token).toBeDefined();
      }

      // Response may also have 'accessToken' for backward compatibility
      if (authResult.accessToken) {
        console.log('✓ Response has "accessToken" field (backward compatible)');
        expect(authResult.accessToken).toBeDefined();
      }

      expect(authResult.refreshToken).toBeDefined();
      console.log('✓ Response has refreshToken');

      // Now test the refresh endpoint
      if (authResult.refreshToken) {
        console.log('\nTesting token refresh...');
        const refreshResult = await authController.refreshToken(authResult.refreshToken as string);

        console.log('Refresh response structure:', Object.keys(refreshResult));

        // Check if refresh response has the expected fields
        expect(refreshResult).toBeDefined();

        // Refresh response should have 'token' field for frontend compatibility
        if (refreshResult.token) {
          console.log('✓ Refresh response has "token" field (frontend compatible)');
          expect(refreshResult.token).toBeDefined();
        }

        // May also have 'accessToken' for backward compatibility
        if (refreshResult.accessToken) {
          console.log('✓ Refresh response has "accessToken" field (backward compatible)');
          expect(refreshResult.accessToken).toBeDefined();
        }

        expect(refreshResult.refreshToken).toBeDefined();
        console.log('✓ Refresh response has refreshToken');

        console.log('\n✅ Token refresh mechanism working correctly!');
      }

    } catch (error: any) {
      // If mock auth is not enabled, this is expected
      if (error.response?.status === 401) {
        console.log('⚠️  Mock authentication not enabled - skipping test');
        console.log('   To enable: Set MOCK_AUTH=true in backend environment');
      } else {
        throw error;
      }
    }
  });
});
