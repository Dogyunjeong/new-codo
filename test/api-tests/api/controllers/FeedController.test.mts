import { describe, it, expect, beforeEach } from 'vitest';
import { FeedController } from '@base/shared-api-controllers';
import { TEST_CONFIG } from '../../setup.mts';

describe('Feed Service Controller', () => {
  let feedController: FeedController;
  const testGoalId = 'f679548c-09c9-468c-a02d-44ab598e35bc'; // Public goal from test data
  const testUserId = '3cc3bab8-66fa-47b2-8d93-b2d45a05ee4f'; // Alice's user ID

  beforeEach(() => {
    feedController = new FeedController({
      baseURL: TEST_CONFIG.FEED_SERVICE_URL
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const result = await feedController.healthCheck();
      expect(result).toBeDefined();
      expect((result as any).status).toBe('healthy');
      expect((result as any).service).toBe('ziririt-feed-service');
    });
  });

  describe('Feed Domain', () => {
    it('should get home feed with good performance', async () => {
      const startTime = Date.now();
      const response = await feedController.getHomeFeed(1, 20);
      const responseTime = Date.now() - startTime;
      
      expect(response).toBeDefined();
      expect((response as any).items).toBeDefined();
      expect(Array.isArray((response as any).items)).toBe(true);
      expect((response as any).page).toBe(1);
      expect(typeof (response as any).hasMore).toBe('boolean');
      
      // Performance check - should be under 500ms
      expect(responseTime).toBeLessThan(500);
      console.log(`Home feed response time: ${responseTime}ms`);
    });

    it('should get goal timeline with good performance', async () => {
      const startTime = Date.now();
      const response = await feedController.getGoalTimeline(testGoalId, 1, 20);
      const responseTime = Date.now() - startTime;
      
      expect(response).toBeDefined();
      expect((response as any).items).toBeDefined();
      expect(Array.isArray((response as any).items)).toBe(true);
      expect((response as any).page).toBe(1);
      expect(typeof (response as any).hasMore).toBe('boolean');
      
      // Performance check - should be under 500ms
      expect(responseTime).toBeLessThan(500);
      console.log(`Goal timeline response time: ${responseTime}ms`);
    });

    it('should handle pagination correctly', async () => {
      const page1 = await feedController.getHomeFeed(1, 5);
      const page2 = await feedController.getHomeFeed(2, 5);
      
      expect(page1).toBeDefined();
      expect(page2).toBeDefined();
      expect((page1 as any).page).toBe(1);
      expect((page2 as any).page).toBe(2);
      
      // Items should be different between pages (if there are enough posts)
      const page1Items = (page1 as any).items;
      const page2Items = (page2 as any).items;
      
      if (page1Items.length > 0 && page2Items.length > 0) {
        expect(page1Items[0].id).not.toBe(page2Items[0].id);
      }
    });

    it('should refresh feed successfully', async () => {
      const startTime = Date.now();
      const response = await feedController.refreshFeed();
      const responseTime = Date.now() - startTime;
      
      expect(response).toBeDefined();
      expect((response as any).message).toBe('Feed refreshed successfully');
      
      // Performance check - should be under 500ms
      expect(responseTime).toBeLessThan(500);
      console.log(`Feed refresh response time: ${responseTime}ms`);
    });

    it('should handle non-existent goal timeline', async () => {
      const response = await feedController.getGoalTimeline('non-existent-goal-id');
      
      expect(response).toBeDefined();
      expect((response as any).items).toBeDefined();
      expect(Array.isArray((response as any).items)).toBe(true);
      expect((response as any).items.length).toBe(0); // Should be empty for non-existent goal
    });

    it('should validate feed item structure', async () => {
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

  describe('Service Configuration', () => {
    it('should allow base URL updates', () => {
      const newUrl = 'http://localhost:9999';
      feedController.setBaseUrl(newUrl);
      expect(feedController['_httpRequest']).toBeDefined();
    });

    it('should allow access token configuration', () => {
      feedController.setAccessToken('test-token');
      expect(feedController['_httpRequest']).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('should consistently respond under 500ms for home feed', async () => {
      const attempts = 5;
      const responseTimes: number[] = [];
      
      for (let i = 0; i < attempts; i++) {
        const startTime = Date.now();
        await feedController.getHomeFeed();
        const responseTime = Date.now() - startTime;
        responseTimes.push(responseTime);
        
        expect(responseTime).toBeLessThan(500);
      }
      
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      console.log(`Average response time over ${attempts} attempts: ${avgResponseTime.toFixed(2)}ms`);
      expect(avgResponseTime).toBeLessThan(500);
    });

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 5;
      const startTime = Date.now();
      
      const promises = Array.from({ length: concurrentRequests }, () => 
        feedController.getHomeFeed()
      );
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      // All requests should succeed
      results.forEach(result => {
        expect(result).toBeDefined();
        expect((result as any).items).toBeDefined();
      });
      
      // Total time for 5 concurrent requests should be reasonable
      console.log(`${concurrentRequests} concurrent requests completed in ${totalTime}ms`);
      expect(totalTime).toBeLessThan(2000); // Should handle 5 concurrent requests within 2 seconds
    });
  });
});