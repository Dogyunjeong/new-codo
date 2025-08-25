import { FastifyRequest, FastifyReply } from 'fastify';
import FeedService from './feed.service.mts';
import { FeedCacheService } from './feedCache.service.mts';

export class FeedHandler {
  private feedService: FeedService;
  private feedCacheService: FeedCacheService;

  constructor(deps: { feedService: FeedService; feedCacheService: FeedCacheService }) {
    this.feedService = deps.feedService;
    this.feedCacheService = deps.feedCacheService;
  }

  async getHomeFeed(req: FastifyRequest, rep: FastifyReply) {
    const startTime = Date.now();
    try {
      const userId = (req.headers as any)['x-user-id'] || 'anonymous';
      const { page = '1', limit = '20' } = req.query as any;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      // Check cache first
      const cacheKey = this.feedCacheService.generateCacheKey('home', userId, pageNum);
      const cachedData = await this.feedCacheService.getCachedFeed(cacheKey);
      
      if (cachedData) {
        const responseTime = Date.now() - startTime;
        return rep.send({
          ...cachedData,
          cached: true,
          responseTime: `${responseTime}ms`,
        });
      }

      // Get fresh data
      const feedData = await this.feedService.getHomeFeed(userId, pageNum, limitNum);
      
      // Cache the result
      await this.feedCacheService.setCachedFeed(cacheKey, feedData);
      
      const responseTime = Date.now() - startTime;
      return rep.send({
        ...feedData,
        cached: false,
        responseTime: `${responseTime}ms`,
      });
    } catch (error) {
      console.error('Error getting home feed:', error);
      return rep.code(500).send({ error: 'Failed to get feed' });
    }
  }

  async getGoalTimeline(req: FastifyRequest, rep: FastifyReply) {
    const startTime = Date.now();
    try {
      const { goalId } = req.params as { goalId: string };
      const { page = '1', limit = '20' } = req.query as any;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      // Check cache first
      const cacheKey = this.feedCacheService.generateCacheKey('goal', goalId, pageNum);
      const cachedData = await this.feedCacheService.getCachedFeed(cacheKey);
      
      if (cachedData) {
        const responseTime = Date.now() - startTime;
        return rep.send({
          ...cachedData,
          cached: true,
          responseTime: `${responseTime}ms`,
        });
      }

      // Get fresh data
      const feedData = await this.feedService.getGoalTimeline(goalId, pageNum, limitNum);
      
      // Cache the result
      await this.feedCacheService.setCachedFeed(cacheKey, feedData);
      
      const responseTime = Date.now() - startTime;
      return rep.send({
        ...feedData,
        cached: false,
        responseTime: `${responseTime}ms`,
      });
    } catch (error) {
      console.error('Error getting goal timeline:', error);
      return rep.code(500).send({ error: 'Failed to get timeline' });
    }
  }

  async getUserFeed(req: FastifyRequest, rep: FastifyReply) {
    const startTime = Date.now();
    try {
      const { userId } = req.params as { userId: string };
      const { page = '1', limit = '20' } = req.query as any;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      // Check cache first
      const cacheKey = this.feedCacheService.generateCacheKey('user', userId, pageNum);
      const cachedData = await this.feedCacheService.getCachedFeed(cacheKey);
      
      if (cachedData) {
        const responseTime = Date.now() - startTime;
        return rep.send({
          ...cachedData,
          cached: true,
          responseTime: `${responseTime}ms`,
        });
      }

      // Get fresh data
      const feedData = await this.feedService.getUserFeed(userId, pageNum, limitNum);
      
      // Cache the result
      await this.feedCacheService.setCachedFeed(cacheKey, feedData);
      
      const responseTime = Date.now() - startTime;
      return rep.send({
        ...feedData,
        cached: false,
        responseTime: `${responseTime}ms`,
      });
    } catch (error) {
      console.error('Error getting user feed:', error);
      return rep.code(500).send({ error: 'Failed to get user feed' });
    }
  }

  async getHashtagFeed(req: FastifyRequest, rep: FastifyReply) {
    const startTime = Date.now();
    try {
      const { hashtag } = req.params as { hashtag: string };
      const { page = '1', limit = '20' } = req.query as any;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      // Check cache first
      const cacheKey = this.feedCacheService.generateCacheKey('hashtag', hashtag, pageNum);
      const cachedData = await this.feedCacheService.getCachedFeed(cacheKey);
      
      if (cachedData) {
        const responseTime = Date.now() - startTime;
        return rep.send({
          ...cachedData,
          cached: true,
          responseTime: `${responseTime}ms`,
        });
      }

      // Get fresh data
      const feedData = await this.feedService.getHashtagFeed(hashtag, pageNum, limitNum);
      
      // Cache the result
      await this.feedCacheService.setCachedFeed(cacheKey, feedData);
      
      const responseTime = Date.now() - startTime;
      return rep.send({
        ...feedData,
        cached: false,
        responseTime: `${responseTime}ms`,
      });
    } catch (error) {
      console.error('Error getting hashtag feed:', error);
      return rep.code(500).send({ error: 'Failed to get hashtag feed' });
    }
  }

  async refreshFeed(req: FastifyRequest, rep: FastifyReply) {
    const startTime = Date.now();
    try {
      const userId = (req.headers as any)['x-user-id'] || 'anonymous';
      
      // Invalidate user's cached feeds
      const clearedEntries = await this.feedCacheService.invalidateUserFeed(userId);
      
      const responseTime = Date.now() - startTime;
      return rep.send({
        message: 'Feed refreshed successfully',
        clearedEntries,
        responseTime: `${responseTime}ms`,
      });
    } catch (error) {
      console.error('Error refreshing feed:', error);
      return rep.code(500).send({ error: 'Failed to refresh feed' });
    }
  }
}