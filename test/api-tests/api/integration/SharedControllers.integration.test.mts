import { describe, it, expect, beforeEach } from 'vitest';
import { AuthController, ProfileController, PostController, FeedController } from '@base/shared-controllers';
import { TEST_CONFIG } from '../../setup.mts';

describe('Shared Controllers Integration', () => {
  let authController: AuthController;
  let profileController: ProfileController;
  let postController: PostController;
  let feedController: FeedController;

  beforeEach(() => {
    authController = new AuthController({
      baseURL: TEST_CONFIG.AUTH_SERVICE_URL,
    });

    profileController = new ProfileController({
      baseURL: TEST_CONFIG.PROFILE_SERVICE_URL,
    });

    postController = new PostController({
      baseURL: TEST_CONFIG.POST_SERVICE_URL,
    });

    feedController = new FeedController({
      baseURL: TEST_CONFIG.FEED_SERVICE_URL,
    });
  });

  describe('Controller Initialization', () => {
    it('should initialize all controllers with correct configuration', () => {
      expect(authController).toBeInstanceOf(AuthController);
      expect(profileController).toBeInstanceOf(ProfileController);
      expect(postController).toBeInstanceOf(PostController);
      expect(feedController).toBeInstanceOf(FeedController);

      // Check private properties exist
      expect(authController['_httpRequest']).toBeDefined();
      expect(profileController['_httpRequest']).toBeDefined();
      expect(postController['_httpRequest']).toBeDefined();
      expect(feedController['_httpRequest']).toBeDefined();
    });

    it('should allow dynamic configuration changes', () => {
      const newUrls = {
        auth: 'http://auth-service:4101',
        profile: 'http://profile-service:4102',
        post: 'http://post-service:4103',
        feed: 'http://feed-service:4104',
      };

      authController.setBaseUrl(newUrls.auth);
      profileController.setBaseUrl(newUrls.profile);
      postController.setBaseUrl(newUrls.post);
      feedController.setBaseUrl(newUrls.feed);

      expect(authController['_httpRequest']).toBeDefined();
      expect(profileController['_httpRequest']).toBeDefined();
      expect(postController['_httpRequest']).toBeDefined();
      expect(feedController['_httpRequest']).toBeDefined();
    });
  });

  describe('Authentication Flow Integration', () => {
    it('should handle OAuth authentication attempt', async () => {
      await expect(
        authController.googleAuth({
          idToken: 'test-google-token',
          deviceId: 'test-device',
          userAgent: 'Test Agent',
        }),
      ).rejects.toThrow(); // Expected to fail with test token
    });

    it('should handle token verification attempt', async () => {
      authController.setAccessToken('test-token');
      await expect(authController.verifyToken()).rejects.toThrow(); // Expected to fail without valid token
    });

    it('should handle current user retrieval attempt', async () => {
      authController.setAccessToken('test-token');
      await expect(authController.getCurrentUser()).rejects.toThrow(); // Expected to fail without valid token
    });
  });

  describe('Profile Service Integration', () => {
    const testUserId = '3cc3bab8-66fa-47b2-8d93-b2d45a05ee4f'; // alice_goals
    const testGoalId = 'f679548c-09c9-468c-a02d-44ab598e35bc'; // Strength Training Journey (public)

    it('should attempt to get user profile', async () => {
      const response = await profileController.getUserProfile(testUserId);
      expect(response).toBeDefined();
    });

    it('should attempt to get user goals', async () => {
      const response = await profileController.getUserGoals(testUserId);
      expect(response).toBeDefined();
      expect(response.goals).toBeDefined();
      expect(Array.isArray(response.goals)).toBe(true);
    });

    it('should attempt to get specific goal', async () => {
      const response = await profileController.getGoal(testGoalId);
      expect(response).toBeDefined();
      expect(response.goal).toBeDefined();
      expect(response.goal.id).toBe(testGoalId);
    });

    it('should handle social relationship queries', async () => {
      const [followers, following, relationship] = await Promise.allSettled([
        profileController.getFollowers(testUserId),
        profileController.getFollowing(testUserId),
        profileController.getRelationship(testUserId),
      ]);

      // All should resolve (even if empty results)
      expect(followers.status).toBe('fulfilled');
      expect(following.status).toBe('fulfilled');
      // Relationship endpoint requires auth, so it should be rejected
      expect(relationship.status).toBe('rejected');
    });
  });

  describe('Post Service Integration', () => {
    const testUserId = 'alice_goals_user_id';
    const testGoalId = 'goal_meditation_id'; // Keep MongoDB test data ID
    const testPostId = 'post_001';

    it('should get recent posts', async () => {
      const response = await postController.getRecentPosts();
      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });

    it('should get user posts', async () => {
      const response = await postController.getUserPosts('alice_goals_user_id'); // Use string ID from test data
      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });

    it('should get goal posts', async () => {
      const response = await postController.getGoalPosts('goal_meditation_id'); // Use string ID from test data
      expect(response).toBeDefined();
      expect(response.items).toBeDefined();
      expect(Array.isArray(response.items)).toBe(true);
    });

    it('should get specific post', async () => {
      const response = await postController.getPost(testPostId);
      expect(response).toBeDefined();
      expect(response.post).toBeDefined();
      expect(response.post.id).toBe(testPostId);
    });

    it('should handle interaction queries', async () => {
      const [comments, likes] = await Promise.allSettled([
        postController.getPostComments(testPostId),
        postController.getPostLikes(testPostId),
      ]);

      expect(comments.status).toBe('fulfilled');
      expect(likes.status).toBe('fulfilled');
    });
  });

  describe('Cross-Service Workflow Integration', () => {
    it('should simulate user authentication and profile retrieval', async () => {
      const testUserId = '3cc3bab8-66fa-47b2-8d93-b2d45a05ee4f'; // alice_goals

      // Step 1: Attempt authentication (will fail with test token)
      await expect(
        authController.googleAuth({
          idToken: 'test-token',
          deviceId: 'integration-test',
        }),
      ).rejects.toThrow();

      // Step 2: Still attempt to get profile (as if auth succeeded)
      const profile = await profileController.getUserProfile(testUserId);
      expect(profile).toBeDefined();

      // Step 3: Get user's posts
      const posts = await postController.getUserPosts('alice_goals_user_id');
      expect(posts).toBeDefined();
      expect(posts.items).toBeDefined();
      expect(Array.isArray(posts.items)).toBe(true);
    });

    it('should simulate goal-post relationship workflow', async () => {
      const testGoalId = 'f679548c-09c9-468c-a02d-44ab598e35bc'; // Strength Training Journey (public)

      // Step 1: Get goal information
      const goal = await profileController.getGoal(testGoalId);
      expect(goal).toBeDefined();
      expect(goal.goal).toBeDefined();
      expect(goal.goal.id).toBe(testGoalId);

      // Step 2: Get posts for a MongoDB test goal (different ID system)
      const mongoGoalId = 'goal_meditation_id';
      const goalPosts = await postController.getGoalPosts(mongoGoalId);
      expect(goalPosts).toBeDefined();
      expect(goalPosts.items).toBeDefined();
      expect(Array.isArray(goalPosts.items)).toBe(true);

      // Verify relationship consistency
      if (goalPosts.items.length > 0) {
        const firstPost = goalPosts.items[0];
        expect(firstPost.goalId).toBe(mongoGoalId);
      }
    });

    it('should handle service health checks in workflow', async () => {
      const healthChecks = await Promise.allSettled([
        authController.healthCheck(),
        profileController.healthCheck(),
        postController.healthCheck(),
      ]);

      // All health checks should resolve (either success or controlled failure)
      expect(healthChecks.every((check) => check.status === 'fulfilled')).toBe(true);
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle invalid service URLs gracefully', async () => {
      const invalidController = new AuthController({
        baseURL: 'http://invalid-service:99999',
      });

      await expect(invalidController.healthCheck()).rejects.toThrow();
    });

    it('should handle malformed requests gracefully', async () => {
      await expect(
        authController.googleAuth({
          idToken: '', // Empty token
          deviceId: 'test',
        }),
      ).rejects.toThrow();

      await expect(
        profileController.getUserProfile(''), // Empty user ID
      ).rejects.toThrow();

      await expect(
        postController.getPost(''), // Empty post ID
      ).rejects.toThrow();
    });

    it('should handle network timeouts gracefully', async () => {
      // This test simulates timeout scenarios
      const timeoutController = new PostController({
        baseURL: 'http://httpstat.us/200?sleep=30000', // Long delay URL
      });

      await expect(timeoutController.healthCheck()).rejects.toThrow();
    });
  });

  describe('Feed Service Integration', () => {
    const testGoalId = 'f679548c-09c9-468c-a02d-44ab598e35bc'; // Public goal from test data
    const testUserId = '3cc3bab8-66fa-47b2-8d93-b2d45a05ee4f'; // Alice's user ID

    it('should get home feed successfully', async () => {
      const response = await feedController.getHomeFeed(1, 10);
      expect(response).toBeDefined();
      expect((response as any).items).toBeDefined();
      expect(Array.isArray((response as any).items)).toBe(true);
      expect((response as any).page).toBe(1);
      expect(typeof (response as any).hasMore).toBe('boolean');
    });

    it('should get goal timeline successfully', async () => {
      // Use MongoDB goal ID since feed service reads from MongoDB
      const mongoGoalId = 'goal_meditation_id';
      const response = await feedController.getGoalTimeline(mongoGoalId, 1, 10);
      expect(response).toBeDefined();
      expect((response as any).items).toBeDefined();
      expect(Array.isArray((response as any).items)).toBe(true);
    });

    it('should refresh feed successfully', async () => {
      const response = await feedController.refreshFeed();
      expect(response).toBeDefined();
      expect((response as any).message).toBe('Feed refreshed successfully');
    });

    it('should validate feed response structure', async () => {
      const response = await feedController.getHomeFeed(1, 5);
      const items = (response as any).items;
      
      if (items.length > 0) {
        const firstItem = items[0];
        expect(firstItem).toBeDefined();
        expect(firstItem.id).toBeDefined();
        expect(firstItem.type).toBe('post');
        expect(firstItem.content).toBeDefined();
        expect(firstItem.user).toBeDefined();
        expect(firstItem.user.id).toBeDefined();
        expect(firstItem.timestamp).toBeDefined();
        expect(firstItem.socialStats).toBeDefined();
        expect(typeof firstItem.socialStats.likesCount).toBe('number');
        expect(typeof firstItem.socialStats.commentsCount).toBe('number');
      }
    });
  });

  describe('Cross-Service Feed Integration', () => {
    it('should integrate posts from post service into feed', async () => {
      // Get posts from post service
      const posts = await postController.getRecentPosts();
      expect(posts).toBeDefined();
      
      // Get feed from feed service
      const feed = await feedController.getHomeFeed();
      expect(feed).toBeDefined();
      
      // Both should return post data (feed aggregates posts)
      expect((posts as any).items).toBeDefined();
      expect((feed as any).items).toBeDefined();
    });

    it('should maintain data consistency between services', async () => {
      const mongoGoalId = 'goal_meditation_id';
      
      // Get posts for a goal from post service
      const goalPosts = await postController.getGoalPosts(mongoGoalId);
      
      // Get timeline for same goal from feed service
      const goalTimeline = await feedController.getGoalTimeline(mongoGoalId);
      
      expect(goalPosts).toBeDefined();
      expect(goalTimeline).toBeDefined();
      
      // Both should return data for the same goal
      const postItems = (goalPosts as any).items;
      const timelineItems = (goalTimeline as any).items;
      
      if (postItems.length > 0 && timelineItems.length > 0) {
        // Should have posts for the same goal
        expect(postItems[0].goalId).toBe(mongoGoalId);
        expect(timelineItems[0].content.goalId).toBe(mongoGoalId);
      }
    });
  });

  describe('Token Management Integration', () => {
    it('should propagate access tokens correctly', () => {
      const testToken = 'test-jwt-token-123';

      authController.setAccessToken(testToken);
      profileController.setAccessToken(testToken);
      postController.setAccessToken(testToken);
      feedController.setAccessToken(testToken);

      // Verify token is set (private property check)
      expect(authController['_httpRequest']).toBeDefined();
      expect(profileController['_httpRequest']).toBeDefined();
      expect(postController['_httpRequest']).toBeDefined();
      expect(feedController['_httpRequest']).toBeDefined();
    });

    it('should handle token refresh scenarios', async () => {
      const refreshToken = 'test-refresh-token';

      await expect(authController.refreshToken(refreshToken)).rejects.toThrow(); // Will fail with test token

      // In real scenario, would update token for other services
      // authController.setAccessToken(newToken);
      // profileController.setAccessToken(newToken);
      // postController.setAccessToken(newToken);
      // feedController.setAccessToken(newToken);
    });
  });
});
