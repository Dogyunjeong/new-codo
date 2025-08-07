import Fastify from 'fastify';
import { MongoClient } from 'mongodb';

const server = Fastify({
  logger: true,
});

const mongoClient = new MongoClient('mongodb://ziririt_user:ziririt_password@mongodb:27017/ziririt_posts?authSource=admin');
let isConnected = false;

async function ensureConnection() {
  if (!isConnected) {
    await mongoClient.connect();
    isConnected = true;
    console.log('MongoDB connected');
  }
}

server.get('/health', async (request, reply) => {
  try {
    await ensureConnection();
    await mongoClient.db('ziririt_posts').admin().ping();
    
    return reply.send({
      status: 'healthy',
      service: 'ziririt-feed-service',
      timestamp: new Date().toISOString(),
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
    await ensureConnection();
    const page = parseInt((request.query as any)?.page || '1', 10);
    const limit = 20;
    const skip = (page - 1) * limit;

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

    const responseTime = Date.now() - startTime;
    console.log(`Feed response time: ${responseTime}ms`);

    return reply.send({
      items: feedItems,
      page,
      hasMore: feedItems.length === limit,
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
    await ensureConnection();
    const { goalId } = request.params as { goalId: string };
    const page = parseInt((request.query as any)?.page || '1', 10);
    const limit = 20;
    const skip = (page - 1) * limit;

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

    const responseTime = Date.now() - startTime;
    console.log(`Goal timeline response time: ${responseTime}ms`);

    return reply.send({
      items: feedItems,
      page,
      hasMore: feedItems.length === limit,
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
    const responseTime = Date.now() - startTime;
    console.log(`Feed refresh response time: ${responseTime}ms`);
    
    return reply.send({
      message: 'Feed refreshed successfully',
      responseTime: `${responseTime}ms`,
    });
  } catch (error) {
    console.error('Error refreshing feed:', error);
    return reply.code(500).send({ error: 'Failed to refresh feed' });
  }
});

async function start() {
  try {
    await server.listen({ port: 4104, host: '0.0.0.0' });
    console.log('Feed service running on port 4104');
  } catch (error) {
    console.error('Error starting feed service:', error);
    process.exit(1);
  }
}

start();