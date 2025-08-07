import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { InteractionHandler } from './interaction.handler.mts';
import { InteractionManagementService } from './InteractionManagement.service.mts';
import { MongoConnectionService } from '@base/shared-services';
import { getAppConfig } from '../../configs/app.config.mts';

const createCommentSchema = {
  type: 'object',
  required: ['content'],
  properties: {
    content: { type: 'string', minLength: 1, maxLength: 1000 },
    parentCommentId: { type: 'string' }
  }
};

const updateCommentSchema = {
  type: 'object',
  required: ['content'],
  properties: {
    content: { type: 'string', minLength: 1, maxLength: 1000 }
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

export const interactionRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  const config = getAppConfig();
  const mongoConnection = MongoConnectionService.getInstance({ uri: config.databaseUrl });
  const interactionService = new InteractionManagementService(mongoConnection);
  const interactionHandler = new InteractionHandler(interactionService);

  // Like/Unlike posts
  fastify.post('/posts/:postId/like', {
    preHandler: authenticateUser,
    handler: interactionHandler.likePost.bind(interactionHandler),
  });

  fastify.delete('/posts/:postId/like', {
    preHandler: authenticateUser,
    handler: interactionHandler.unlikePost.bind(interactionHandler),
  });

  fastify.get('/posts/:postId/like/check', {
    preHandler: authenticateUser,
    handler: interactionHandler.checkPostLiked.bind(interactionHandler),
  });

  fastify.get('/posts/:postId/likes', {
    handler: interactionHandler.getPostLikes.bind(interactionHandler),
  });

  // Comments
  fastify.post('/posts/:postId/comments', {
    preHandler: authenticateUser,
    schema: { body: createCommentSchema },
    handler: interactionHandler.addComment.bind(interactionHandler),
  });

  fastify.get('/posts/:postId/comments', {
    handler: interactionHandler.getPostComments.bind(interactionHandler),
  });

  fastify.put('/comments/:commentId', {
    preHandler: authenticateUser,
    schema: { body: updateCommentSchema },
    handler: interactionHandler.updateComment.bind(interactionHandler),
  });

  fastify.delete('/comments/:commentId', {
    preHandler: authenticateUser,
    handler: interactionHandler.deleteComment.bind(interactionHandler),
  });

  fastify.get('/comments/:commentId/replies', {
    handler: interactionHandler.getCommentReplies.bind(interactionHandler),
  });

  // User interactions
  fastify.get('/users/:userId/likes', {
    handler: interactionHandler.getUserLikes.bind(interactionHandler),
  });

  done();
};