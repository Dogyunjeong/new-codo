import { describe, it, expect, beforeEach } from 'vitest';
import { AuthController } from '@base/shared-api-controllers';
import { TEST_CONFIG } from '../../setup.mts';

describe('Auth Service Controller', () => {
  let authController: AuthController;

  beforeEach(() => {
    authController = new AuthController({
      baseURL: TEST_CONFIG.AUTH_SERVICE_URL
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const result = await authController.healthCheck();
      expect(result).toBeDefined();
    });
  });

  describe('OAuth Domain', () => {
    describe('Google OAuth', () => {
      it('should handle Google ID token (mock auth)', async () => {
        // With mock auth enabled, any token is accepted
        const result = await authController.googleAuth({ idToken: 'mock-google-token' });
        expect(result).toBeDefined();
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
      });

      it('should still require idToken field', async () => {
        await expect(
          authController.googleAuth({ idToken: '' })
        ).rejects.toThrow();
      });
    });

    describe('Apple OAuth', () => {
      it('should handle Apple ID token (mock auth)', async () => {
        // With mock auth enabled, any token is accepted
        const result = await authController.appleAuth({ idToken: 'mock-apple-token' });
        expect(result).toBeDefined();
        expect(result).toHaveProperty('accessToken');
        expect(result).toHaveProperty('refreshToken');
      });

      it('should still require idToken field', async () => {
        await expect(
          authController.appleAuth({ idToken: '' })
        ).rejects.toThrow();
      });
    });
  });

  describe('Authentication Domain', () => {
    describe('Token Management', () => {
      it('should handle refresh token validation', async () => {
        await expect(
          authController.refreshToken('fake-refresh-token')
        ).rejects.toThrow();
      });

      it('should handle logout with refresh token', async () => {
        // API currently accepts any refresh token and returns success message
        const response = await authController.logout('fake-refresh-token');
        expect(response).toBeDefined();
        expect(response.message).toBe('Logged out successfully');
      });
    });

    describe('Protected Endpoints', () => {
      it('should require authentication for token verification', async () => {
        await expect(
          authController.verifyToken()
        ).rejects.toThrow();
      });

      it('should require authentication for user info', async () => {
        await expect(
          authController.getCurrentUser()
        ).rejects.toThrow();
      });
    });
  });

  describe('Service Configuration', () => {
    it('should allow base URL updates', () => {
      const newUrl = 'http://localhost:9999';
      authController.setBaseUrl(newUrl);
      expect(authController['_httpRequest']).toBeDefined();
    });

    it('should allow access token configuration', () => {
      authController.setAccessToken('test-token');
      expect(authController['_httpRequest']).toBeDefined();
    });
  });
});