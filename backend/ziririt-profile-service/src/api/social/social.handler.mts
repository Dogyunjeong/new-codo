import { FastifyRequest, FastifyReply } from 'fastify';
import { FollowManagementService } from './FollowManagement.service.mts';

export class SocialHandler {
  private followService: FollowManagementService;

  constructor(followService: FollowManagementService) {
    this.followService = followService;
  }

  async followUser(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    try {
      const { userId: followingId } = request.params;
      const currentUser = (request as any).user;

      const result = await this.followService.followUser(currentUser.userId, followingId);
      
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
  }

  async unfollowUser(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    try {
      const { userId: followingId } = request.params;
      const currentUser = (request as any).user;

      const result = await this.followService.unfollowUser(currentUser.userId, followingId);
      
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
  }

  async getRelationship(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    try {
      const { userId: targetUserId } = request.params;
      const currentUser = (request as any).user;

      const relationship = await this.followService.getRelationship(currentUser.userId, targetUserId);
      
      return reply.code(200).send({ relationship });
    } catch (error) {
      request.log.error('Get relationship error:', error);
      return reply.code(500).send({ 
        error: 'Failed to get relationship status',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getFollowers(
    request: FastifyRequest<{ 
      Params: { userId: string }, 
      Querystring: { page?: string, limit?: string } 
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params;
      const page = parseInt(request.query.page || '1', 10);
      const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);

      const followers = await this.followService.getFollowers(userId, page, limit);
      
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
  }

  async getFollowing(
    request: FastifyRequest<{ 
      Params: { userId: string }, 
      Querystring: { page?: string, limit?: string } 
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params;
      const page = parseInt(request.query.page || '1', 10);
      const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);

      const following = await this.followService.getFollowing(userId, page, limit);
      
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
  }
}