import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { SocialService } from '../services/social.service.mjs';

const socialService = new SocialService();

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
  // Follow a user
  fastify.post<{ Params: { userId: string } }>('/follow/:userId', {
    preHandler: authenticateUser,
    handler: async (request, reply) => {
      try {
        const { userId: followingId } = request.params;
        const currentUser = (request as any).user;

        const result = await socialService.followUser(currentUser.userId, followingId);
        
        return reply.code(200).send(result);
      } catch (error) {
        request.log.error('Follow user error:', error);
        if (error instanceof Error && error.message.includes('Cannot follow yourself')) {
          return reply.code(400).send({ error: error.message });
        }
        return reply.code(500).send({ 
          error: 'Failed to follow user',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Unfollow a user
  fastify.delete<{ Params: { userId: string } }>('/follow/:userId', {
    preHandler: authenticateUser,
    handler: async (request, reply) => {
      try {
        const { userId: followingId } = request.params;
        const currentUser = (request as any).user;

        const result = await socialService.unfollowUser(currentUser.userId, followingId);
        
        return reply.code(200).send(result);
      } catch (error) {
        request.log.error('Unfollow user error:', error);
        if (error instanceof Error && error.message.includes('Cannot unfollow yourself')) {
          return reply.code(400).send({ error: error.message });
        }
        return reply.code(500).send({ 
          error: 'Failed to unfollow user',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Get relationship status with another user
  fastify.get<{ Params: { userId: string } }>('/relationship/:userId', {
    preHandler: authenticateUser,
    handler: async (request, reply) => {
      try {
        const { userId: targetUserId } = request.params;
        const currentUser = (request as any).user;

        const relationship = await socialService.getRelationship(currentUser.userId, targetUserId);
        
        return reply.code(200).send({ relationship });
      } catch (error) {
        request.log.error('Get relationship error:', error);
        return reply.code(500).send({ 
          error: 'Failed to get relationship status',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Get followers for a user
  fastify.get<{ 
    Params: { userId: string }, 
    Querystring: { page?: string, limit?: string } 
  }>('/followers/:userId', {
    handler: async (request, reply) => {
      try {
        const { userId } = request.params;
        const page = parseInt(request.query.page || '1', 10);
        const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);

        const followers = await socialService.getFollowers(userId, page, limit);
        
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

  // Get following for a user
  fastify.get<{ 
    Params: { userId: string }, 
    Querystring: { page?: string, limit?: string } 
  }>('/following/:userId', {
    handler: async (request, reply) => {
      try {
        const { userId } = request.params;
        const page = parseInt(request.query.page || '1', 10);
        const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);

        const following = await socialService.getFollowing(userId, page, limit);
        
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