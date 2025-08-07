import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { SocialHandler } from './social.handler.mts';
import { FollowManagementService } from './FollowManagement.service.mts';
import { PostgresConnectionService } from '@base/shared-services';
import { getAppConfig } from '../../configs/app.config.mts';

// Auth middleware - simplified for now
async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.substring(7);
  if (!token) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
  
  // Mock implementation - replace with real JWT verification
  (request as any).user = { userId: 'mock-user-id' };
}

export const socialRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  // Initialize services
  const config = getAppConfig();
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