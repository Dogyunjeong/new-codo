import { describe, it, expect, beforeAll } from 'vitest';
import { TEST_CONFIG } from '../../setup.mts';

const FEED_SERVICE_URL = TEST_CONFIG.FEED_SERVICE_URL;

describe('Feed Service Direct API Tests', () => {
  beforeAll(async () => {
    const healthResponse = await fetch(`${FEED_SERVICE_URL}/health`);
    const healthData = await healthResponse.json();
    
    if (healthData.status !== 'healthy') {
      throw new Error('Feed service is not healthy before starting tests');
    }
  });

  describe('GET /health', () => {
    it('should return healthy status with database connections', async () => {
      const response = await fetch(`${FEED_SERVICE_URL}/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.service).toBe('ziririt-feed-service');
      expect(data.connections.mongodb).toBe(true);
      expect(data.connections.redis).toBe(true);
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('Redis Caching Tests', () => {
    it('should return cached response on subsequent calls', async () => {
      const userId = `test-user-cache-direct-${Date.now()}`;
      const headers = { 'x-user-id': userId };

      // First call
      const response1 = await fetch(`${FEED_SERVICE_URL}/api/feed/home?page=1`, { headers });
      const data1 = await response1.json();

      // Second call should be cached
      const response2 = await fetch(`${FEED_SERVICE_URL}/api/feed/home?page=1`, { headers });
      const data2 = await response2.json();

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // Verify caching is working
      if (!data1.cached) {
        // If first call wasn't cached, second should be
        expect(data2.cached).toBe(true);
      }
      
      // Response times should both be under performance target
      const response1Time = parseInt(data1.responseTime.replace('ms', ''));
      const response2Time = parseInt(data2.responseTime.replace('ms', ''));
      expect(response1Time).toBeLessThan(100); // Both should be fast
      expect(response2Time).toBeLessThan(100);
    });

    it('should cache goal timeline responses', async () => {
      const goalId = 'goal_strength_id';
      
      // First call
      const response1 = await fetch(`${FEED_SERVICE_URL}/api/feed/journey/${goalId}?page=1`);
      const data1 = await response1.json();

      // Second call should be cached
      const response2 = await fetch(`${FEED_SERVICE_URL}/api/feed/journey/${goalId}?page=1`);
      const data2 = await response2.json();

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(data2.cached).toBe(true);
    });

    it('should clear user feed cache on refresh', async () => {
      const userId = 'test-user-refresh-direct';
      const headers = { 'x-user-id': userId };

      // First, make sure there's something in cache
      await fetch(`${FEED_SERVICE_URL}/api/feed/home?page=1`, { headers });

      // Refresh cache
      const refreshResponse = await fetch(`${FEED_SERVICE_URL}/api/feed/refresh`, {
        method: 'POST',
        headers
      });
      const refreshData = await refreshResponse.json();

      expect(refreshResponse.status).toBe(200);
      expect(refreshData.message).toBe('Feed refreshed successfully');
      expect(refreshData.clearedEntries).toBeGreaterThanOrEqual(0);
      expect(refreshData.responseTime).toBeDefined();

      // Next call to home feed should not be cached
      const feedResponse = await fetch(`${FEED_SERVICE_URL}/api/feed/home?page=1`, { headers });
      const feedData = await feedResponse.json();

      expect(feedResponse.status).toBe(200);
      expect(feedData.cached).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('should respond within performance target (<500ms)', async () => {
      const startTime = Date.now();
      const response = await fetch(`${FEED_SERVICE_URL}/api/feed/home?page=1`, {
        headers: {
          'x-user-id': 'test-user-performance-direct'
        }
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(500); // Performance target
    });

    it('should handle goal timeline within performance target (<500ms)', async () => {
      const startTime = Date.now();
      const response = await fetch(`${FEED_SERVICE_URL}/api/feed/journey/journey_spanish_id?page=1`);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(500); // Performance target
    });

    it('should handle refresh within performance target (<200ms)', async () => {
      const startTime = Date.now();
      const response = await fetch(`${FEED_SERVICE_URL}/api/feed/refresh`, {
        method: 'POST',
        headers: {
          'x-user-id': 'test-user-refresh-perf-direct'
        }
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(200); // Performance target for refresh
    });
  });

  describe('Load Testing', () => {
    it('should handle concurrent requests without degradation', async () => {
      const promises = [];
      const numRequests = 10;
      
      for (let i = 0; i < numRequests; i++) {
        promises.push(
          fetch(`${FEED_SERVICE_URL}/api/feed/home?page=1`, {
            headers: { 'x-user-id': `test-user-load-${i}` }
          })
        );
      }

      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Check that all responses completed within reasonable time
      const responseData = await Promise.all(
        responses.map(response => response.json())
      );
      
      responseData.forEach((data) => {
        const responseTime = parseInt(data.responseTime.replace('ms', ''));
        expect(responseTime).toBeLessThan(1000); // 1 second max under load
      });
    });
  });

  describe('New Feed Endpoints', () => {
    it('should get user feed successfully', async () => {
      const userId = 'alice_goals_user_id';
      const response = await fetch(`${FEED_SERVICE_URL}/api/feed/user/${userId}?page=1`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.page).toBe(1);
      expect(data.hasMore).toBeDefined();
      expect(data.responseTime).toBeDefined();

      // All items should be from the specified user (if any items exist)
      data.items.forEach((item: any) => {
        expect(item.content.userId).toBe(userId);
      });
    });

    it('should get hashtag feed successfully', async () => {
      const hashtag = 'meditation';
      const response = await fetch(`${FEED_SERVICE_URL}/api/feed/hashtag/${hashtag}?page=1`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.page).toBe(1);
      expect(data.hasMore).toBeDefined();
      expect(data.responseTime).toBeDefined();

      // All items should contain the specified hashtag (if any items exist)
      data.items.forEach((item: any) => {
        expect(item.content.hashtags).toContain(hashtag);
      });
    });

    it('should cache user feed properly', async () => {
      const userId = `bob_progress_user_${Date.now()}`; // Use unique ID to avoid cache collision
      
      // First call
      const response1 = await fetch(`${FEED_SERVICE_URL}/api/feed/user/${userId}?page=1`);
      const data1 = await response1.json();

      // Second call should be cached
      const response2 = await fetch(`${FEED_SERVICE_URL}/api/feed/user/${userId}?page=1`);
      const data2 = await response2.json();

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // If first call was already cached (from previous test runs), skip cache check
      if (!data1.cached) {
        expect(data2.cached).toBe(true);
        
        // Cached response should be faster
        const response1Time = parseInt(data1.responseTime.replace('ms', ''));
        const response2Time = parseInt(data2.responseTime.replace('ms', ''));
        expect(response2Time).toBeLessThanOrEqual(response1Time);
      }
    });

    it('should cache hashtag feed properly', async () => {
      const hashtag = `test_hashtag_${Date.now()}`; // Use unique hashtag to avoid cache collision
      
      // First call
      const response1 = await fetch(`${FEED_SERVICE_URL}/api/feed/hashtag/${hashtag}?page=1`);
      const data1 = await response1.json();

      // Second call should be cached
      const response2 = await fetch(`${FEED_SERVICE_URL}/api/feed/hashtag/${hashtag}?page=1`);
      const data2 = await response2.json();

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      // If first call was already cached, skip cache check
      if (!data1.cached) {
        expect(data2.cached).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      const response = await fetch(`${FEED_SERVICE_URL}/api/feed/home?page=invalid`);
      
      // Should still work with invalid page parameter (defaults to 1)
      expect(response.status).toBe(200);
    });

    it('should handle missing user ID gracefully', async () => {
      const response = await fetch(`${FEED_SERVICE_URL}/api/feed/home?page=1`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.items).toBeDefined();
    });

    it('should return timeline for specific goal', async () => {
      const goalId = 'goal_meditation_id';
      const response = await fetch(`${FEED_SERVICE_URL}/api/feed/journey/${goalId}?page=1`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toBeDefined();
      expect(Array.isArray(data.items)).toBe(true);
      expect(data.page).toBe(1);
      expect(data.hasMore).toBeDefined();
      expect(data.cached).toBeDefined();
      expect(data.responseTime).toBeDefined();

      // All items should be from the specified goal (if any items exist)
      data.items.forEach((item: any) => {
        expect(item.content.goalId).toBe(goalId);
      });
    });
  });
});
