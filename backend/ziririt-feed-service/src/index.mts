import { MongoClient } from 'mongodb';
import { createClient, RedisClientType } from 'redis';
import { getBaseEnvironment } from '@base/server-base';
import FeedService from './api/feed/feed.service.mts';
import { FeedCacheService } from './api/feed/feedCache.service.mts';
import { FeedHandler } from './api/feed/feed.handler.mts';

const env = getBaseEnvironment();
const PORT = parseInt(process.env.PORT || '4104');
const SERVICE_NAME = process.env.SERVICE_NAME || 'ziririt-feed-service';

// Initialize connections
const mongoUri = env.MONGODB_URL || 'mongodb://ziririt_user:ziririt_password@localhost:27017/ziririt_posts?authSource=admin';
const redisUrl = env.REDIS_URL || 'redis://localhost:6379';

const mongoClient = new MongoClient(mongoUri);
const redisClient: RedisClientType = createClient({
  url: redisUrl,
}) as RedisClientType;

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

// Simple Fastify setup instead of using FastifyServer class
import Fastify from 'fastify';
import cors from '@fastify/cors';

const server = Fastify({
  logger: true,
});

await server.register(cors, {
  origin: true,
  credentials: true,
});

// Health check endpoint
server.get('/health', async (request, reply) => {
  try {
    await ensureConnections();
    await mongoClient.db('ziririt_posts').admin().ping();
    await redisClient.ping();
    
    return reply.send({
      status: 'healthy',
      service: SERVICE_NAME,
      timestamp: new Date().toISOString(),
      connections: {
        mongodb: isMongoConnected,
        redis: isRedisConnected,
      },
    });
  } catch (error) {
    return reply.code(500).send({
      status: 'unhealthy',
      service: SERVICE_NAME,
      error: 'Database connection failed',
    });
  }
});

// Initialize services and handlers after connections are established
await ensureConnections();

const feedService = new FeedService({
  mongoClient,
  database: 'ziririt_posts',
  logger: console,
});

const feedCacheService = new FeedCacheService(redisClient);

const feedHandler = new FeedHandler({
  feedService,
  feedCacheService,
});

// Register API routes
server.get('/api/feed/home', feedHandler.getHomeFeed.bind(feedHandler));
server.get('/api/feed/goal/:goalId', feedHandler.getGoalTimeline.bind(feedHandler));
server.get('/api/feed/user/:userId', feedHandler.getUserFeed.bind(feedHandler));
server.get('/api/feed/hashtag/:hashtag', feedHandler.getHashtagFeed.bind(feedHandler));
server.post('/api/feed/refresh', feedHandler.refreshFeed.bind(feedHandler));


// Start server
async function start() {
  try {
    console.log(`Starting ${SERVICE_NAME}...`);
    console.log('MongoDB URI:', mongoUri);
    console.log('Redis URL:', redisUrl);
    
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`${SERVICE_NAME} running on port ${PORT}`);
  } catch (error) {
    console.error(`Error starting ${SERVICE_NAME}:`, error);
    process.exit(1);
  }
}

start();