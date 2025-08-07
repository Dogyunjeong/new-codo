import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { ProfileService } from '../services/profile.service.mts';
import { UpdateProfileRequest } from '../types/profile.types.mts';

const profileService = new ProfileService();

// Request schemas
const updateProfileSchema = {
  type: 'object',
  properties: {
    bio: { type: 'string', maxLength: 500 },
    isPrivate: { type: 'boolean' },
  },
};

// Auth middleware - simplified for now, will need proper JWT verification
async function authenticateUser(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Missing or invalid authorization header' });
  }
  
  // TODO: Implement proper JWT verification by calling auth service
  // For now, we'll extract a mock user ID from the token
  const token = authHeader.substring(7);
  // Mock implementation - in real version this would verify JWT
  if (!token) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
  
  // Add mock user to request - replace with real JWT verification
  (request as any).user = { userId: 'mock-user-id' };
}

export const profileRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  // Health check
  fastify.get('/health', async (request, reply) => {
    return { status: 'healthy', service: 'ziririt-profile-service' };
  });

  // Get user profile
  fastify.get<{ Params: { userId: string } }>('/:userId', {
    handler: async (request, reply) => {
      try {
        const { userId } = request.params;
        
        // Get viewer ID from auth token if present
        const authHeader = request.headers.authorization;
        let viewerId: string | undefined;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          // TODO: Extract viewerId from JWT token
          viewerId = undefined; // For now, no viewer context
        }

        const profile = await profileService.getProfile(userId, viewerId);
        
        if (!profile) {
          return reply.code(404).send({ error: 'Profile not found' });
        }

        return reply.code(200).send({ profile });
      } catch (error) {
        request.log.error('Get profile error:', error);
        return reply.code(500).send({ 
          error: 'Failed to get profile',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Update user profile (own profile only)
  fastify.put<{ Params: { userId: string }, Body: UpdateProfileRequest }>('/:userId', {
    preHandler: authenticateUser,
    schema: { body: updateProfileSchema },
    handler: async (request, reply) => {
      try {
        const { userId } = request.params;
        const updates = request.body;
        const currentUser = (request as any).user;

        // Check if user is updating their own profile
        if (currentUser.userId !== userId) {
          return reply.code(403).send({ error: 'Cannot update another user\'s profile' });
        }

        const updatedProfile = await profileService.updateProfile(userId, updates);
        
        return reply.code(200).send({ profile: updatedProfile });
      } catch (error) {
        request.log.error('Update profile error:', error);
        return reply.code(500).send({ 
          error: 'Failed to update profile',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Get user's followers
  fastify.get<{ 
    Params: { userId: string }, 
    Querystring: { page?: string, limit?: string } 
  }>('/:userId/followers', {
    handler: async (request, reply) => {
      try {
        const { userId } = request.params;
        const page = parseInt(request.query.page || '1', 10);
        const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);

        const followers = await profileService.getFollowers(userId, page, limit);
        
        return reply.code(200).send({ 
          followers,
          pagination: {
            page,
            limit,
            hasMore: followers.length === limit
          }
        });
      } catch (error) {
        request.log.error('Get followers error:', error);
        return reply.code(500).send({ 
          error: 'Failed to get followers',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Get user's following
  fastify.get<{ 
    Params: { userId: string }, 
    Querystring: { page?: string, limit?: string } 
  }>('/:userId/following', {
    handler: async (request, reply) => {
      try {
        const { userId } = request.params;
        const page = parseInt(request.query.page || '1', 10);
        const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);

        const following = await profileService.getFollowing(userId, page, limit);
        
        return reply.code(200).send({ 
          following,
          pagination: {
            page,
            limit,
            hasMore: following.length === limit
          }
        });
      } catch (error) {
        request.log.error('Get following error:', error);
        return reply.code(500).send({ 
          error: 'Failed to get following',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  done();
};