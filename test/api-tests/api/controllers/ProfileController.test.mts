import { describe, it, expect, beforeEach } from 'vitest';
import { ProfileController } from '@base/shared-controllers';
import { TEST_CONFIG } from '../../setup.mts';

describe('Profile Service Controller', () => {
  let profileController: ProfileController;
  const testUserId = 'ff249605-088b-4595-9061-1a0108b73823';
  const testGoalId = '0d1d202d-f87d-43c0-95f4-7c6972289944';

  beforeEach(() => {
    profileController = new ProfileController({
      baseURL: TEST_CONFIG.PROFILE_SERVICE_URL
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const result = await profileController.healthCheck();
      expect(result).toBeDefined();
    });
  });

  describe('Profile Domain', () => {
    it('should handle getting user profile', async () => {
      const response = await profileController.getUserProfile(testUserId);
      expect(response).toBeDefined();
    });

    it('should handle non-existent profile', async () => {
      await expect(
        profileController.getUserProfile('non-existent-id')
      ).rejects.toThrow();
    });

    it('should validate user ID format', async () => {
      await expect(
        profileController.getUserProfile('')
      ).rejects.toThrow();
    });
  });

  describe('Goal Domain', () => {
    it('should get user goals', async () => {
      const response = await profileController.getUserGoals(testUserId);
      expect(response.goals).toBeDefined();
      expect(Array.isArray(response.goals)).toBe(true);
    });

    it('should get specific goal', async () => {
      const response = await profileController.getGoal(testGoalId);
      expect(response.goal).toBeDefined();
      expect(response.goal.id).toBe(testGoalId);
    });

    it('should handle non-existent goal', async () => {
      await expect(
        profileController.getGoal('non-existent-goal-id')
      ).rejects.toThrow();
    });

    it('should validate goal creation data', async () => {
      const invalidGoalData = {};
      await expect(
        profileController.createGoal(invalidGoalData)
      ).rejects.toThrow();
    });
  });

  describe('Social Domain', () => {
    it('should get user followers', async () => {
      const response = await profileController.getFollowers(testUserId);
      expect(response.followers).toBeDefined();
      expect(Array.isArray(response.followers)).toBe(true);
    });

    it('should get user following', async () => {
      const response = await profileController.getFollowing(testUserId);
      expect(response.following).toBeDefined();
      expect(Array.isArray(response.following)).toBe(true);
    });

    it('should get user relationship status', async () => {
      // This endpoint requires authentication, expecting 401 without auth token
      await expect(
        profileController.getRelationship(testUserId)
      ).rejects.toThrow();
    });

    it('should handle follow/unfollow operations', async () => {
      const targetUserId = 'target-user-id';
      
      // Test follow
      await expect(
        profileController.followUser(testUserId, targetUserId)
      ).rejects.toThrow(); // Will fail without proper auth
      
      // Test unfollow
      await expect(
        profileController.unfollowUser(testUserId, targetUserId)
      ).rejects.toThrow(); // Will fail without proper auth
    });
  });

  describe('Service Configuration', () => {
    it('should allow base URL updates', () => {
      const newUrl = 'http://localhost:9999';
      profileController.setBaseUrl(newUrl);
      expect(profileController['_httpRequest']).toBeDefined();
    });

    it('should allow access token configuration', () => {
      profileController.setAccessToken('test-token');
      expect(profileController['_httpRequest']).toBeDefined();
    });
  });
});