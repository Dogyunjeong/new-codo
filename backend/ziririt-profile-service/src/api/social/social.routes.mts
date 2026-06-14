import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { SocialHandler } from './social.handler.mts';
import { FollowManagementService } from './FollowManagement.service.mts';
import { PostgresConnectionService } from '@base/server-services';
import { createFirebaseAuthMiddleware } from '@base/server-base';
import { getAppConfig } from '../../configs/app.config.mts';

// Get auth middleware instance
const config = getAppConfig();
const authenticateUser = createFirebaseAuthMiddleware(config.authServiceUrl) as any;

export const socialRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  // Initialize services
  const dbConnection = PostgresConnectionService.getInstance({ connectionString: config.databaseUrl });
  const followService = new FollowManagementService(dbConnection.getPool());
  const socialHandler = new SocialHandler(followService);

  // Follow a user
  fastify.post('/follow/:userId', {
    preHandler: authenticateUser,
    handler: socialHandler.followUser.bind(socialHandler),
  });

  // Unfollow a user
  fastify.delete('/follow/:userId', {
    preHandler: authenticateUser,
    handler: socialHandler.unfollowUser.bind(socialHandler),
  });

  // Get relationship status with another user
  fastify.get('/relationship/:userId', {
    preHandler: authenticateUser,
    handler: socialHandler.getRelationship.bind(socialHandler),
  });

  // Get followers for a user
  fastify.get('/followers/:userId', {
    handler: socialHandler.getFollowers.bind(socialHandler),
  });

  // Get following for a user
  fastify.get('/following/:userId', {
    handler: socialHandler.getFollowing.bind(socialHandler),
  });

  done();
};
