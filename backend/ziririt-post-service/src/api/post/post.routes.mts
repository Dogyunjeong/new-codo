import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { PostHandler } from './post.handler.mts';
import { PostManagementService } from './PostManagement.service.mts';
import { MongoConnectionService } from '@base/shared-services';
import { getAppConfig } from '../../configs/app.config.mts';

const createPostSchema = {
  type: 'object',
  required: ['goalId', 'content'],
  properties: {
    goalId: { type: 'string' },
    content: { type: 'string', minLength: 1, maxLength: 2000 },
    mediaFiles: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 10
    },
    hashtags: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 30
    },
    isMilestone: { type: 'boolean' },
    progressDate: { type: 'string', format: 'date-time' }
  }
};

const updatePostSchema = {
  type: 'object',
  properties: {
    content: { type: 'string', minLength: 1, maxLength: 2000 },
    hashtags: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 30
    },
    isMilestone: { type: 'boolean' },
    progressDate: { type: 'string', format: 'date-time' }
  }
};

async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.substring(7);
  if (!token) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
  
  (request as any).user = { userId: 'mock-user-id' };
}

export const postRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  const config = getAppConfig();
  const mongoConnection = MongoConnectionService.getInstance({ uri: config.databaseUrl });
  const postService = new PostManagementService(mongoConnection);
  const postHandler = new PostHandler(postService);

  fastify.post('/', {
    preHandler: authenticateUser,
    schema: { body: createPostSchema },
    handler: postHandler.createPost.bind(postHandler),
  });

  fastify.get('/:postId', {
    handler: postHandler.getPost.bind(postHandler),
  });

  fastify.put('/:postId', {
    preHandler: authenticateUser,
    schema: { body: updatePostSchema },
    handler: postHandler.updatePost.bind(postHandler),
  });

  fastify.delete('/:postId', {
    preHandler: authenticateUser,
    handler: postHandler.deletePost.bind(postHandler),
  });

  fastify.get('/user/:userId', {
    handler: postHandler.getUserPosts.bind(postHandler),
  });

  fastify.get('/goal/:goalId', {
    handler: postHandler.getGoalPosts.bind(postHandler),
  });

  fastify.get('/recent', {
    handler: postHandler.getRecentPosts.bind(postHandler),
  });

  fastify.get('/hashtag/:hashtag', {
    handler: postHandler.searchByHashtag.bind(postHandler),
  });

  done();
};