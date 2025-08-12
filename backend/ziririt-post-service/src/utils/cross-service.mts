import { authServiceController } from '../services/auth.controller.mts';
import { profileServiceController } from '../services/profile.controller.mts';

/**
 * Cross-service utilities for Post Service
 * Uses shared-api-clients for consistent service communication
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
 * Get user profile information via Profile Service
 */
export async function getUserProfile(userId: string): Promise<any> {
  try {
    return await profileServiceController.getUserProfile(userId);
  } catch (error) {
    throw new Error(`Failed to get user profile: ${userId}`);
  }
}

/**
 * Get goal information via Profile Service
 */
export async function getGoalInfo(goalId: string): Promise<any> {
  try {
    return await profileServiceController.getGoal(goalId);
  } catch (error) {
    throw new Error(`Failed to get goal info: ${goalId}`);
  }
}

/**
 * Check if users are connected (following relationship) via Profile Service
 */
export async function checkUserRelationship(userId: string, targetUserId: string): Promise<any> {
  try {
    return await profileServiceController.getRelationship(userId);
  } catch (error) {
    throw new Error(`Failed to check user relationship: ${userId} -> ${targetUserId}`);
  }
}

/**
 * Health check for dependent services
 */
export async function checkDependentServicesHealth(): Promise<{
  auth: boolean;
  profile: boolean;
}> {
  const [authHealth, profileHealth] = await Promise.allSettled([
    authServiceController.healthCheck(),
    profileServiceController.healthCheck()
  ]);

  return {
    auth: authHealth.status === 'fulfilled',
    profile: profileHealth.status === 'fulfilled'
  };
}