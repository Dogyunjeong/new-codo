import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { MongoClient } from 'mongodb';
import { createClient, RedisClientType } from 'redis';
import { getBaseEnvironment } from '@base/server-base';
import FeedService from './Feed.service.mts';
import { FeedCacheService } from './feedCache.service.mts';
import { FeedHandler } from './feed.handler.mts';
import { authMiddleware } from '../../middleware/auth.middleware.mts';

function parseDatabaseFromUri(uri: string, fallback: string): string {
  try {
    const url = new URL(uri);
    const dbName = url.pathname.replace(/^\//, '');

    if (dbName) {
      return dbName;
    }
  } catch {
    // fall through
  }

  return fallback;
}

export const feedRoutes: FastifyPluginCallback = (fastify: FastifyInstance, _options, done) => {
  const env = getBaseEnvironment();
  const mongoUri = env.MONGODB_URL || 'mongodb://ziririt_user:ziririt_password@localhost:27017/ziririt_posts?authSource=admin';
  const redisUrl = env.REDIS_URL || 'redis://localhost:6379';
  const database = env.MONGODB_DB || parseDatabaseFromUri(mongoUri, 'ziririt_posts');

  const mongoClient = new MongoClient(mongoUri);
  const redisClient: RedisClientType = createClient({ url: redisUrl }) as RedisClientType;

  // Register error handler immediately (not inside conditional)
  redisClient.on('error', (err) => {
    console.error('Feed routes: Redis Client Error', err);
  });

  let feedHandler: FeedHandler | null = null;

  fastify.addHook('onReady', async () => {
    await mongoClient.connect();
    console.log('Feed routes: MongoDB connected');

    await redisClient.connect();
    console.log('Feed routes: Redis connected');

    // Construct services after connections are established
    const feedService = new FeedService({
      mongoClient,
      database,
      logger: console,
    });

    const feedCacheService = new FeedCacheService(redisClient);

    feedHandler = new FeedHandler({
      feedService,
      feedCacheService,
    });
  });

  function ensureHandler(reply: any): FeedHandler | null {
    if (!feedHandler) {
      reply.code(503).send({ error: 'Feed service is not ready' });
      return null;
    }

    return feedHandler;
  }

  // Routes (prefix /api/feed is applied when registering this plugin)
  fastify.get('/home', { preHandler: authMiddleware }, (req, rep) => {
    const handler = ensureHandler(rep);

    if (!handler) {
      return;
    }

    return handler.getHomeFeed(req, rep);
  });

  fastify.get('/journey/:journeyId', (req, rep) => {
    const handler = ensureHandler(rep);

    if (!handler) {
      return;
    }

    return handler.getJourneyTimeline(req, rep);
  });

  fastify.get('/user/:userId', (req, rep) => {
    const handler = ensureHandler(rep);

    if (!handler) {
      return;
    }

    return handler.getUserFeed(req, rep);
  });

  fastify.get('/hashtag/:hashtag', (req, rep) => {
    const handler = ensureHandler(rep);

    if (!handler) {
      return;
    }

    return handler.getHashtagFeed(req, rep);
  });

  fastify.post('/refresh', { preHandler: authMiddleware }, (req, rep) => {
    const handler = ensureHandler(rep);

    if (!handler) {
      return;
    }

    return handler.refreshFeed(req, rep);
  });

  fastify.addHook('onClose', async () => {
    await mongoClient.close();
    await redisClient.quit();
  });

  done();
};
