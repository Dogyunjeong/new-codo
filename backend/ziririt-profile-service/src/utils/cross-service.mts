import { authServiceController } from '../services/auth.controller.mts';

/**
 * Cross-service utilities for Profile Service
 * Uses shared-controllers for consistent service communication
 */

/**
 * Verify user authentication via Auth Service
 */
export async function verifyUserAuth(token: string): Promise<any> {
  try {
    authServiceController.setAccessToken(token);
    return await authServiceController.verifyToken();
  } catch (error) {
    throw new Error('Authentication verification failed');
  }
}

/**
 * Get current user information via Auth Service
 */
export async function getCurrentUser(token: string): Promise<any> {
  try {
    authServiceController.setAccessToken(token);
    return await authServiceController.getCurrentUser();
  } catch (error) {
    throw new Error('Failed to get current user information');
  }
}

/**
 * Health check for dependent services
 */
export async function checkDependentServicesHealth(): Promise<{
  auth: boolean;
}> {
  const authHealth = await authServiceController.healthCheck()
    .then(() => true)
    .catch(() => false);

  return {
    auth: authHealth
  };
}