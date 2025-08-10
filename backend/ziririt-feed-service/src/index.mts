import Fastify from 'fastify';
import { MongoClient } from 'mongodb';
import { createClient } from 'redis';
import cors from '@fastify/cors';

const server = Fastify({
  logger: true,
});

await server.register(cors, {
  origin: true,
  credentials: true,
});

const mongoUri = process.env.MONGODB_URI || 'mongodb://ziririt_user:ziririt_password@localhost:27017/ziririt_posts?authSource=admin';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const mongoClient = new MongoClient(mongoUri);
const redisClient = createClient({
  url: redisUrl,
});

let isMongoConnected = false;
let isRedisConnected = false;

async function ensureConnections() {
  if (!isMongoConnected) {
    await mongoClient.connect();
    isMongoConnected = true;
    console.log('MongoDB connected');
  }
  
  if (!isRedisConnected) {
    await redisClient.connect();
    isRedisConnected = true;
    console.log('Redis connected');
    
    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
      isRedisConnected = false;
    });
  }
}

server.get('/health', async (request, reply) => {
  try {
    await ensureConnections();
    await mongoClient.db('ziririt_posts').admin().ping();
    await redisClient.ping();
    
    return reply.send({
      status: 'healthy',
      service: 'ziririt-feed-service',
      timestamp: new Date().toISOString(),
      connections: {
        mongodb: isMongoConnected,
        redis: isRedisConnected,
      },
    });
  } catch (error) {
    return reply.code(500).send({
      status: 'unhealthy',
      service: 'ziririt-feed-service',
      error: 'Database connection failed',
    });
  }
});

server.get('/feed/home', async (request, reply) => {
  const startTime = Date.now();
  
  try {
    await ensureConnections();
    const userId = (request.headers as any)['x-user-id'] || 'anonymous';
    const page = parseInt((request.query as any)?.page || '1', 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    const cacheKey = `feed:home:${userId}:page:${page}`;
    
    try {
      const cachedFeed = await redisClient.get(cacheKey);
      if (cachedFeed) {
        const responseTime = Date.now() - startTime;
        console.log(`Feed from cache, response time: ${responseTime}ms`);
        const data = JSON.parse(cachedFeed);
        return reply.send({
          ...data,
          cached: true,
          responseTime: `${responseTime}ms`,
        });
      }
    } catch (cacheError) {
      console.error('Cache error:', cacheError);
    }

    const postsCollection = mongoClient.db('ziririt_posts').collection('posts');
    
    const posts = await postsCollection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const feedItems = posts.map(post => ({
      id: post.id || post._id.toString(),
      type: 'post',
      content: post,
      user: { id: post.userId },
      timestamp: post.createdAt,
      socialStats: {
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
      },
    }));

    const responseData = {
      items: feedItems,
      page,
      hasMore: feedItems.length === limit,
    };

    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(responseData));
    } catch (cacheError) {
      console.error('Failed to cache feed:', cacheError);
    }

    const responseTime = Date.now() - startTime;
    console.log(`Feed response time: ${responseTime}ms`);

    return reply.send({
      ...responseData,
      cached: false,
      responseTime: `${responseTime}ms`,
    });
  } catch (error) {
    console.error('Error getting home feed:', error);
    return reply.code(500).send({ error: 'Failed to get feed' });
  }
});

server.get('/feed/goal/:goalId', async (request, reply) => {
  const startTime = Date.now();
  
  try {
    await ensureConnections();
    const { goalId } = request.params as { goalId: string };
    const page = parseInt((request.query as any)?.page || '1', 10);
    const limit = 20;
    const skip = (page - 1) * limit;

    const cacheKey = `feed:goal:${goalId}:page:${page}`;
    
    try {
      const cachedTimeline = await redisClient.get(cacheKey);
      if (cachedTimeline) {
        const responseTime = Date.now() - startTime;
        console.log(`Goal timeline from cache, response time: ${responseTime}ms`);
        const data = JSON.parse(cachedTimeline);
        return reply.send({
          ...data,
          cached: true,
          responseTime: `${responseTime}ms`,
        });
      }
    } catch (cacheError) {
      console.error('Cache error:', cacheError);
    }

    const postsCollection = mongoClient.db('ziririt_posts').collection('posts');
    
    const posts = await postsCollection
      .find({ goalId })
      .sort({ progressDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const feedItems = posts.map(post => ({
      id: post.id || post._id.toString(),
      type: 'post',
      content: post,
      user: { id: post.userId },
      timestamp: post.createdAt,
      socialStats: {
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
      },
    }));

    const responseData = {
      items: feedItems,
      page,
      hasMore: feedItems.length === limit,
    };

    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(responseData));
    } catch (cacheError) {
      console.error('Failed to cache timeline:', cacheError);
    }

    const responseTime = Date.now() - startTime;
    console.log(`Goal timeline response time: ${responseTime}ms`);

    return reply.send({
      ...responseData,
      cached: false,
      responseTime: `${responseTime}ms`,
    });
  } catch (error) {
    console.error('Error getting goal timeline:', error);
    return reply.code(500).send({ error: 'Failed to get timeline' });
  }
});

server.post('/feed/refresh', async (request, reply) => {
  const startTime = Date.now();
  
  try {
    await ensureConnections();
    const userId = (request.headers as any)['x-user-id'] || 'anonymous';
    
    const pattern = `feed:home:${userId}:*`;
    const keys = await redisClient.keys(pattern);
    
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`Cleared ${keys.length} cache entries for user ${userId}`);
    }
    
    const responseTime = Date.now() - startTime;
    console.log(`Feed refresh response time: ${responseTime}ms`);
    
    return reply.send({
      message: 'Feed refreshed successfully',
      clearedEntries: keys.length,
      responseTime: `${responseTime}ms`,
    });
  } catch (error) {
    console.error('Error refreshing feed:', error);
    return reply.code(500).send({ error: 'Failed to refresh feed' });
  }
});

async function start() {
  try {
    console.log('Starting feed service...');
    console.log('MongoDB URI:', mongoUri);
    console.log('Redis URL:', redisUrl);
    
    await server.listen({ port: 4104, host: '0.0.0.0' });
    console.log('Feed service running on port 4104');
  } catch (error) {
    console.error('Error starting feed service:', error);
    process.exit(1);
  }
}

start();