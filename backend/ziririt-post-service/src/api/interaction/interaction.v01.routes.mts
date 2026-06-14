import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { InteractionHandler } from './interaction.handler.mts';
import { InteractionManagementService } from './InteractionManagement.service.mts';
import { MongoConnectionService } from '@base/server-services';
import { createFirebaseAuthMiddleware } from '@base/server-base';
import { getAppConfig } from '../../configs/app.config.mts';

// Get auth middleware instance
const config = getAppConfig();
const authenticateUser = createFirebaseAuthMiddleware(config.authServiceUrl) as any;

// v0.1 routes under /api/posts/:postId/*
export const interactionV01Routes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  const mongoConnection = MongoConnectionService.getInstance({ uri: config.databaseUrl });
  const interactionService = new InteractionManagementService(mongoConnection);
  const interactionHandler = new InteractionHandler(interactionService);

  // Likes
  fastify.post('/:postId/like', {
    preHandler: authenticateUser,
    handler: interactionHandler.likePost.bind(interactionHandler),
  });

  fastify.delete('/:postId/like', {
    preHandler: authenticateUser,
    handler: interactionHandler.unlikePost.bind(interactionHandler),
  });

  fastify.get('/:postId/likes', {
    handler: interactionHandler.getPostLikes.bind(interactionHandler),
  });

  // Comments
  fastify.post('/:postId/comments', {
    preHandler: authenticateUser,
    handler: interactionHandler.addComment.bind(interactionHandler),
  });

  fastify.get('/:postId/comments', {
    handler: interactionHandler.getPostComments.bind(interactionHandler),
  });

  done();
};
