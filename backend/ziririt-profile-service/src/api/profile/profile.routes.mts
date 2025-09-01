import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { ProfileHandler } from './profile.handler.mts';
import { ProfileManagementService } from './ProfileManagement.service.mts';
import { PostgresConnectionService, createFirebaseAuthMiddleware } from '@base/server-services';
import { getAppConfig } from '../../configs/app.config.mts';

// Request schemas
const updateProfileSchema = {
  type: 'object',
  properties: {
    bio: { type: 'string', maxLength: 500 },
    isPrivate: { type: 'boolean' },
  },
};

// Get auth middleware instance
const config = getAppConfig();
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4101';
const authenticateUser = createFirebaseAuthMiddleware(authServiceUrl);

export const profileRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  // Initialize services
  const dbConnection = PostgresConnectionService.getInstance({ connectionString: config.databaseUrl });
  const profileService = new ProfileManagementService(dbConnection.getPool());
  const profileHandler = new ProfileHandler(profileService);

  // Health check
  fastify.get('/health', profileHandler.healthCheck.bind(profileHandler));

  // Get user profile
  fastify.get('/:userId', {
    handler: profileHandler.getProfile.bind(profileHandler),
  });

  // Update user profile (own profile only)
  fastify.put('/:userId', {
    preHandler: authenticateUser,
    schema: { body: updateProfileSchema },
    handler: profileHandler.updateProfile.bind(profileHandler),
  });

  // Get user's followers
  fastify.get('/:userId/followers', {
    handler: profileHandler.getFollowers.bind(profileHandler),
  });

  // Get user's following
  fastify.get('/:userId/following', {
    handler: profileHandler.getFollowing.bind(profileHandler),
  });

  done();
};