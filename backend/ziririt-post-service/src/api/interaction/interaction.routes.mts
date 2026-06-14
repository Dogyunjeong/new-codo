import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { InteractionHandler } from './interaction.handler.mts';
import { InteractionManagementService } from './InteractionManagement.service.mts';
import { MongoConnectionService } from '@base/server-services';
import { createFirebaseAuthMiddleware } from '@base/server-base';
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

const config = getAppConfig();
const authenticateUser = createFirebaseAuthMiddleware(config.authServiceUrl) as any;

export const interactionRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  // Deprecation notice for legacy interaction routes
  fastify.addHook('onRequest', (request, reply, next) => {
    reply.header('Warning', '299 - Deprecated: use /api/posts/:postId/* routes');
    fastify.log.warn({ path: request.url }, 'Using deprecated /api/interactions route');
    next();
  });
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
