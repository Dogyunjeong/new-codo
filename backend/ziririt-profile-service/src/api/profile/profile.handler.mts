import { FastifyRequest, FastifyReply } from 'fastify';
import { ProfileManagementService, UpdateProfileData } from './ProfileManagement.service.mts';
import { BaseHandler } from '@base/server-base';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class ProfileHandler extends BaseHandler {
  private profileService: ProfileManagementService;

  constructor(profileService: ProfileManagementService) {
    super();
    this.profileService = profileService;
  }

  async healthCheck(request: FastifyRequest, reply: FastifyReply) {
    return reply.code(200).send({ status: 'healthy', service: 'ziririt-profile-service' });
  }

  async getProfile(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    try {
      const { userId } = request.params;
      
      // Validate UUID format
      if (!UUID_REGEX.test(userId)) {
        return reply.code(404).send({ error: 'Profile not found' });
      }

      const viewerId = this.getOptionalAuth(request);

      const profile = await this.profileService.getProfile(userId, viewerId);
      
      if (!profile) {
        return reply.code(404).send({ error: 'Profile not found' });
      }

      this.sendSuccess(reply, { profile });
    } catch (error) {
      this.handleError(reply, error, 'get profile');
    }
  }

  async updateProfile(
    request: FastifyRequest<{ Params: { userId: string }, Body: UpdateProfileData }>, 
    reply: FastifyReply
  ) {
    try {
      const { userId } = request.params;
      const updates = request.body;
      const currentUserId = this.requireAuth(request);

      // Check if user is updating their own profile
      if (currentUserId !== userId) {
        return reply.code(403).send({ error: 'Cannot update another user\'s profile' });
      }

      const updatedProfile = await this.profileService.updateProfile(userId, updates);
      this.sendSuccess(reply, { profile: updatedProfile });
    } catch (error) {
      this.handleError(reply, error, 'update profile');
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
      
      // Validate UUID format
      if (!UUID_REGEX.test(userId)) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const page = this.parseQueryInt(request.query.page, 1);
      const limit = Math.min(this.parseQueryInt(request.query.limit, 20), 100);

      const followers = await this.profileService.getFollowers(userId, page, limit);
      
      this.sendSuccess(reply, { 
        followers,
        pagination: {
          page,
          limit,
          hasMore: followers.length === limit
        }
      });
    } catch (error) {
      this.handleError(reply, error, 'get followers');
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
      
      // Validate UUID format
      if (!UUID_REGEX.test(userId)) {
        return reply.code(404).send({ error: 'User not found' });
      }

      const page = this.parseQueryInt(request.query.page, 1);
      const limit = Math.min(this.parseQueryInt(request.query.limit, 20), 100);

      const following = await this.profileService.getFollowing(userId, page, limit);
      
      this.sendSuccess(reply, { 
        following,
        pagination: {
          page,
          limit,
          hasMore: following.length === limit
        }
      });
    } catch (error) {
      this.handleError(reply, error, 'get following');
    }
  }
}