/**
 * Test Helpers for Authentication Testing
 */

import { SecureStorage } from '../services/storage/SecureStorage';

export const mockFirebaseToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6InRlc3QiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vemlycml0LWRldiIsImF1ZCI6InppcnJpdC1kZXYiLCJhdXRoX3RpbWUiOjE3MDAwMDAwMDAsInVzZXJfaWQiOiJ0ZXN0LXVzZXItMTIzIiwic3ViIjoidGVzdC11c2VyLTEyMyIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxNzAwMDAzNjAwLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJ0ZXN0QHRlc3QuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0';

export const mockAuthResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: {
    id: 'test-user-123',
    email: 'test@test.com',
    displayName: 'Test User',
    isVerified: true,
  },
  expiresIn: 900,
};

export const mockGoogleUser = {
  idToken: mockFirebaseToken,
  user: {
    id: 'google-user-123',
    email: 'google@test.com',
    name: 'Google User',
    photo: 'https://example.com/photo.jpg',
  },
};

export const mockAppleUser = {
  idToken: mockFirebaseToken,
  user: {
    id: 'apple-user-123',
    email: 'apple@test.com',
    fullName: {
      givenName: 'Apple',
      familyName: 'User',
    },
  },
};

/**
 * Setup test environment
 */
export async function setupTestEnvironment() {
  // Clear storage
  await SecureStorage.clearAll();
  
  // Mock fetch
  global.fetch = jest.fn();
  
  // Mock console methods
  global.console.error = jest.fn();
  global.console.warn = jest.fn();
}

/**
 * Clean up test environment
 */
export async function cleanupTestEnvironment() {
  await SecureStorage.clearAll();
  jest.clearAllMocks();
}

/**
 * Mock successful authentication
 */
export function mockSuccessfulAuth() {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => mockAuthResponse,
  });
}

/**
 * Mock failed authentication
 */
export function mockFailedAuth(error = 'Authentication failed') {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status: 401,
    json: async () => ({ error }),
  });
}

/**
 * Create mock Firebase user
 */
export function createMockFirebaseUser(overrides = {}) {
  return {
    uid: 'test-uid',
    email: 'test@test.com',
    displayName: 'Test User',
    photoURL: null,
    emailVerified: true,
    getIdToken: jest.fn().mockResolvedValue(mockFirebaseToken),
    reload: jest.fn(),
    delete: jest.fn(),
    ...overrides,
  };
}

/**
 * Wait for async operations
 */
export function waitForAsync(ms = 100) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test token expiry
 */
export function createExpiredToken() {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
    iat: Math.floor(Date.now() / 1000) - 7200,
    userId: 'test-user',
  }));
  return `${header}.${payload}.signature`;
}

/**
 * Test token that's about to expire
 */
export function createExpiringToken(secondsUntilExpiry = 60) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + secondsUntilExpiry,
    iat: Math.floor(Date.now() / 1000),
    userId: 'test-user',
  }));
  return `${header}.${payload}.signature`;
}