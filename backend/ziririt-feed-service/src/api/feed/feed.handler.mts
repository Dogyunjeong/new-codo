import { FastifyRequest, FastifyReply } from 'fastify';
import FeedService from './Feed.service.mts';
import { FeedCacheService } from './feedCache.service.mts';

type AuthenticatedRequest = FastifyRequest & {
  user?: {
    userId: string;
  };
};

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
      const userId = (req as AuthenticatedRequest).user?.userId || (req as any).userId;
      if (!userId) {
        return rep.code(401).send({ error: 'Authentication required' });
      }
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

  async getJourneyTimeline(req: FastifyRequest, rep: FastifyReply) {
    const startTime = Date.now();
    try {
      const { journeyId } = req.params as { journeyId: string };
      const { page = '1', limit = '20' } = req.query as any;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      // Check cache first
      const cacheKey = this.feedCacheService.generateCacheKey('journey', journeyId, pageNum);
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
      const feedData = await (this.feedService as any).getJourneyTimeline(journeyId, pageNum, limitNum);
      
      // Cache the result
      await this.feedCacheService.setCachedFeed(cacheKey, feedData);
      
      const responseTime = Date.now() - startTime;
      return rep.send({
        ...feedData,
        cached: false,
        responseTime: `${responseTime}ms`,
      });
    } catch (error) {
      console.error('Error getting journey timeline:', error);
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
      const userId = (req as AuthenticatedRequest).user?.userId || (req as any).userId;
      if (!userId) {
        return rep.code(401).send({ error: 'Authentication required' });
      }
      
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
