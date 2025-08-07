import { createClient, RedisClientType } from 'redis';
import type { FeedItem } from '@base/shared-types';

export class FeedCacheService {
  private redis: RedisClientType;
  private ttl: number;

  constructor(redisUrl: string, ttlSeconds: number = 300) {
    this.redis = createClient({ url: redisUrl });
    this.ttl = ttlSeconds;
  }

  async connect(): Promise<void> {
    await this.redis.connect();
  }

  async disconnect(): Promise<void> {
    await this.redis.disconnect();
  }

  // Cache structure: "feed:user:{userId}:page:{page}" -> FeedItem[]
  private getFeedKey(userId: string, page: number): string {
    return `feed:user:${userId}:page:${page}`;
  }

  async cacheFeed(userId: string, page: number, items: FeedItem[]): Promise<void> {
    const key = this.getFeedKey(userId, page);
    await this.redis.setEx(key, this.ttl, JSON.stringify(items));
  }

  async getCachedFeed(userId: string, page: number): Promise<FeedItem[] | null> {
    const key = this.getFeedKey(userId, page);
    const cached = await this.redis.get(key);
    
    if (!cached) {
      return null;
    }

    try {
      return JSON.parse(cached) as FeedItem[];
    } catch (error) {
      console.error('Error parsing cached feed:', error);
      return null;
    }
  }

  async invalidateUserFeed(userId: string): Promise<void> {
    // Remove all pages for a user
    const pattern = `feed:user:${userId}:page:*`;
    const keys = await this.redis.keys(pattern);
    
    if (keys.length > 0) {
      await this.redis.del(keys);
    }
  }

  async addToCache(userId: string, newItem: FeedItem): Promise<void> {
    // Add new item to the first page only
    const firstPageKey = this.getFeedKey(userId, 1);
    const cached = await this.redis.get(firstPageKey);
    
    if (cached) {
      try {
        const items = JSON.parse(cached) as FeedItem[];
        // Add to beginning and maintain page size
        items.unshift(newItem);
        if (items.length > 20) {
          items.pop();
        }
        await this.redis.setEx(firstPageKey, this.ttl, JSON.stringify(items));
      } catch (error) {
        console.error('Error updating cached feed:', error);
      }
    }
  }

  async warmCache(userId: string, followingIds: string[]): Promise<void> {
    // Pre-populate cache for users who follow many people
    console.log(`Warming cache for user ${userId} with ${followingIds.length} following`);
    // Implementation would fetch latest posts and cache first page
  }
}