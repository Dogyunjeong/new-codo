import { RedisClientType } from 'redis';

export class FeedCacheService {
  private redisClient: RedisClientType;
  private defaultTTL: number = 300; // 5 minutes

  constructor(redisClient: RedisClientType) {
    this.redisClient = redisClient;
  }

  async getCachedFeed(cacheKey: string): Promise<any | null> {
    try {
      const cachedData = await this.redisClient.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async setCachedFeed(cacheKey: string, data: any, ttl?: number): Promise<void> {
    try {
      await this.redisClient.setEx(
        cacheKey,
        ttl || this.defaultTTL,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async invalidateUserFeed(userId: string): Promise<number> {
    try {
      const pattern = `feed:*:${userId}:*`;
      const keys = await this.redisClient.keys(pattern);
      
      if (keys.length > 0) {
        const deleted = await this.redisClient.del(keys);
        return deleted;
      }
      return 0;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  async invalidateGoalFeed(goalId: string): Promise<number> {
    try {
      const pattern = `feed:goal:${goalId}:*`;
      const keys = await this.redisClient.keys(pattern);
      
      if (keys.length > 0) {
        const deleted = await this.redisClient.del(keys);
        return deleted;
      }
      return 0;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  async invalidateAllFeeds(): Promise<number> {
    try {
      const pattern = `feed:*`;
      const keys = await this.redisClient.keys(pattern);
      
      if (keys.length > 0) {
        const deleted = await this.redisClient.del(keys);
        return deleted;
      }
      return 0;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  generateCacheKey(type: string, identifier: string, page: number): string {
    return `feed:${type}:${identifier}:page:${page}`;
  }
}