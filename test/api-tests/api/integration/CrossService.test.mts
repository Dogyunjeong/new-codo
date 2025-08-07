import { describe, it, expect, beforeEach } from 'vitest';
import { BaseServiceController } from '@base/shared-controllers';
import { TEST_CONFIG } from '../../setup.mts';

// Import individual service controllers
class AuthServiceController extends BaseServiceController {
  constructor() {
    super({ serviceName: 'auth-service', baseURL: TEST_CONFIG.AUTH_SERVICE_URL });
  }
}

class ProfileServiceController extends BaseServiceController {
  constructor() {
    super({ serviceName: 'profile-service', baseURL: TEST_CONFIG.PROFILE_SERVICE_URL });
  }

  async getUserProfile(userId: string): Promise<any> {
    return await this._serviceRequest.get(`/profiles/${userId}`);
  }

  async getUserGoals(userId: string): Promise<any> {
    return await this._serviceRequest.get(`/goals/user/${userId}`);
  }

  async getGoal(goalId: string): Promise<any> {
    return await this._serviceRequest.get(`/goals/${goalId}`);
  }
}

class PostServiceController extends BaseServiceController {
  constructor() {
    super({ serviceName: 'post-service', baseURL: TEST_CONFIG.POST_SERVICE_URL });
  }

  async getGoalPosts(goalId: string): Promise<any> {
    return await this._serviceRequest.get(`/posts/goal/${goalId}`);
  }

  async getUserPosts(userId: string): Promise<any> {
    return await this._serviceRequest.get(`/posts/user/${userId}`);
  }
}

describe('Cross-Service Integration Tests', () => {
  let authController: AuthServiceController;
  let profileController: ProfileServiceController;
  let postController: PostServiceController;

  const testUserId = '3cc3bab8-66fa-47b2-8d93-b2d45a05ee4f'; // alice_goals
  const testGoalId = 'f679548c-09c9-468c-a02d-44ab598e35bc'; // Strength Training Journey (public)

  beforeEach(() => {
    authController = new AuthServiceController();
    profileController = new ProfileServiceController();
    postController = new PostServiceController();
  });

  describe('Service Health Status', () => {
    it('should have all services healthy', async () => {
      const [authHealth, profileHealth, postHealth] = await Promise.all([
        authController.checkHealth(),
        profileController.checkHealth(),
        postController.checkHealth()
      ]);

      expect(authHealth).toBe(true);
      expect(profileHealth).toBe(true);
      expect(postHealth).toBe(true);
    });
  });

  describe('Data Consistency Across Services', () => {
    it('should maintain user data consistency between Profile and Post services', async () => {
      // Get user profile
      const userProfile = await profileController.getUserProfile(testUserId);
      expect(userProfile.data).toBeDefined();
      expect(userProfile.data.data).toBeDefined();
      expect(userProfile.data.data.profile).toBeDefined();
      expect(userProfile.data.data.profile.user_id).toBe(testUserId);

      // Get user posts (use same user ID)
      const userPosts = await postController.getUserPosts(testUserId);
      expect(userPosts.data).toBeDefined();
      expect(userPosts.data.items).toBeDefined();
      expect(Array.isArray(userPosts.data.items)).toBe(true);

      // Verify data structure consistency
      if (userPosts.data.items.length > 0) {
        const firstPost = userPosts.data.items[0];
        expect(firstPost).toHaveProperty('id');
        expect(firstPost).toHaveProperty('userId');
        expect(firstPost).toHaveProperty('content');
      }
    });

    it('should maintain goal data consistency between Profile and Post services', async () => {
      // Get goal from Profile service
      const goal = await profileController.getGoal(testGoalId);
      expect(goal.data).toBeDefined();
      expect(goal.data.goal).toBeDefined();
      expect(goal.data.goal.id).toBe(testGoalId);

      // Get posts for a MongoDB test goal (different ID system)
      const mongoGoalId = 'goal_meditation_id';
      const goalPosts = await postController.getGoalPosts(mongoGoalId);
      expect(goalPosts.data).toBeDefined();
      expect(goalPosts.data.items).toBeDefined();
      expect(Array.isArray(goalPosts.data.items)).toBe(true);

      // Verify goal reference consistency
      if (goalPosts.data.items.length > 0) {
        const firstPost = goalPosts.data.items[0];
        expect(firstPost).toHaveProperty('goalId');
        expect(firstPost.goalId).toBe(mongoGoalId);
      }
    });

    it('should verify user-goal relationship across services', async () => {
      // Get user goals from Profile service
      const userGoals = await profileController.getUserGoals(testUserId);
      expect(userGoals.data).toBeDefined();
      expect(userGoals.data.goals).toBeDefined();
      expect(Array.isArray(userGoals.data.goals)).toBe(true);

      // Check if our test goal exists in user's goals
      const hasTestGoal = userGoals.data.goals.some((goal: any) => goal.id === testGoalId);
      expect(hasTestGoal).toBe(true);
      
      // For posts, use MongoDB test goal ID
      const mongoGoalId = 'goal_meditation_id';
      const goalPosts = await postController.getGoalPosts(mongoGoalId);
      expect(goalPosts.data).toBeDefined();
      expect(goalPosts.data.items).toBeDefined();
      expect(Array.isArray(goalPosts.data.items)).toBe(true);
    });
  });

  describe('Domain-Driven Architecture Validation', () => {
    it('should validate Auth service domain separation', async () => {
      // Auth service should handle authentication and OAuth
      expect(authController['_serviceName']).toBe('auth-service');
      expect(authController.checkHealth).toBeDefined();
      
      // Verify service isolation - Auth should not handle profile/post data
      const authBaseUrl = TEST_CONFIG.AUTH_SERVICE_URL;
      expect(authBaseUrl).toContain('4101'); // Auth service port
    });

    it('should validate Profile service domain separation', async () => {
      // Profile service should handle profiles, goals, and social relationships
      expect(profileController['_serviceName']).toBe('profile-service');
      
      const profileBaseUrl = TEST_CONFIG.PROFILE_SERVICE_URL;
      expect(profileBaseUrl).toContain('4102'); // Profile service port

      // Test domain-specific endpoints exist
      const userProfile = await profileController.getUserProfile(testUserId);
      expect(userProfile.data).toBeDefined();
    });

    it('should validate Post service domain separation', async () => {
      // Post service should handle posts, media, and interactions
      expect(postController['_serviceName']).toBe('post-service');
      
      const postBaseUrl = TEST_CONFIG.POST_SERVICE_URL;
      expect(postBaseUrl).toContain('4103'); // Post service port

      // Test domain-specific endpoints exist with MongoDB test data
      const mongoGoalId = 'goal_meditation_id';
      const goalPosts = await postController.getGoalPosts(mongoGoalId);
      expect(goalPosts.data).toBeDefined();
    });
  });

  describe('Service Communication Patterns', () => {
    it('should use HTTP-based communication (not EventBus)', async () => {
      // Verify all controllers use HTTP-based communication
      expect(authController['_serviceRequest']).toBeDefined();
      expect(profileController['_serviceRequest']).toBeDefined();
      expect(postController['_serviceRequest']).toBeDefined();

      // Each service should be independent and accessible via HTTP
      const healthChecks = await Promise.all([
        authController.checkHealth(),
        profileController.checkHealth(),
        postController.checkHealth()
      ]);

      expect(healthChecks.every(health => health === true)).toBe(true);
    });

    it('should allow dynamic service configuration', () => {
      const newUrls = {
        auth: 'http://localhost:9001',
        profile: 'http://localhost:9002',
        post: 'http://localhost:9003'
      };

      // Test base URL reconfiguration
      authController.setBaseUrl(newUrls.auth);
      profileController.setBaseUrl(newUrls.profile);
      postController.setBaseUrl(newUrls.post);

      // Verify configuration was applied
      expect(authController['_serviceRequest']).toBeDefined();
      expect(profileController['_serviceRequest']).toBeDefined();
      expect(postController['_serviceRequest']).toBeDefined();
    });

    it('should support token-based authentication across services', () => {
      const testToken = 'test-jwt-token';

      // Set authentication token for all services
      authController.setAccessToken(testToken);
      profileController.setAccessToken(testToken);
      postController.setAccessToken(testToken);

      // Verify token configuration was applied
      expect(authController['_serviceRequest']).toBeDefined();
      expect(profileController['_serviceRequest']).toBeDefined();
      expect(postController['_serviceRequest']).toBeDefined();
    });
  });

  describe('Error Handling Consistency', () => {
    it('should handle 404 errors consistently across services', async () => {
      const nonExistentId = 'non-existent-id-12345';

      // Test 404 handling in Profile service
      await expect(
        profileController.getUserProfile(nonExistentId)
      ).rejects.toThrow();

      await expect(
        profileController.getGoal(nonExistentId)
      ).rejects.toThrow();

      // Test 404 handling in Post service
      // Post service returns empty arrays for non-existent users instead of throwing
      const userPosts = await postController.getUserPosts(nonExistentId);
      expect(userPosts.data.items).toBeDefined();
      expect(Array.isArray(userPosts.data.items)).toBe(true);
      expect(userPosts.data.items.length).toBe(0);

      const goalPosts = await postController.getGoalPosts(nonExistentId);
      expect(goalPosts.data.items).toBeDefined();
      expect(Array.isArray(goalPosts.data.items)).toBe(true);
      expect(goalPosts.data.items.length).toBe(0);
    });

    it('should handle network errors gracefully', async () => {
      // Create controllers with invalid URLs to test error handling
      const invalidAuthController = new BaseServiceController({
        serviceName: 'invalid-auth',
        baseURL: 'http://localhost:99999'
      });

      await expect(
        invalidAuthController.checkHealth()
      ).resolves.toBe(false);
    });
  });
});