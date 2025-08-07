import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { ProfileHandler } from './profile.handler.mts';
import { ProfileManagementService } from './ProfileManagement.service.mts';
import { PostgresConnectionService } from '@base/shared-services';
import { getAppConfig } from '../../configs/app.config.mts';

// Request schemas
const updateProfileSchema = {
  type: 'object',
  properties: {
    bio: { type: 'string', maxLength: 500 },
    isPrivate: { type: 'boolean' },
  },
};

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

export const profileRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  // Initialize services
  const config = getAppConfig();
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