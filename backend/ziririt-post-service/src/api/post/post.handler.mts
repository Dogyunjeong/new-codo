import { FastifyRequest, FastifyReply } from 'fastify';
import { PostManagementService } from './PostManagement.service.mts';
import { CreatePostRequest, UpdatePostRequest } from '../../types/post.types.mts';

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PostParams {
  postId: string;
}

interface UserParams {
  userId: string;
}

interface JourneyParams { journeyId: string }

interface HashtagParams {
  hashtag: string;
}

interface QueryParams {
  page?: string;
  limit?: string;
}

export class PostHandler {
  constructor(private postService: PostManagementService) {}

  async createPost(request: FastifyRequest<{ Body: CreatePostRequest }>, reply: FastifyReply) {
    try {
      const userId = (request as any).user?.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const post = await this.postService.createPost(userId, request.body);
      reply.code(201).send({ post });
    } catch (error) {
      console.error('Error creating post:', error);
      reply.code(500).send({ error: 'Failed to create post' });
    }
  }

  async getPost(request: FastifyRequest<{ Params: PostParams }>, reply: FastifyReply) {
    try {
      const { postId } = request.params;
      const viewerId = (request as any).user?.userId;

      const post = await this.postService.getPostById(postId, viewerId);
      if (!post) {
        return reply.code(404).send({ error: 'Post not found' });
      }

      reply.send({ post });
    } catch (error) {
      console.error('Error fetching post:', error);
      reply.code(500).send({ error: 'Failed to fetch post' });
    }
  }

  async updatePost(request: FastifyRequest<{ Params: PostParams; Body: UpdatePostRequest }>, reply: FastifyReply) {
    try {
      const { postId } = request.params;
      const userId = (request as any).user?.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const post = await this.postService.updatePost(postId, userId, request.body);
      reply.send({ post });
    } catch (error) {
      console.error('Error updating post:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        reply.code(404).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to update post' });
      }
    }
  }

  async deletePost(request: FastifyRequest<{ Params: PostParams }>, reply: FastifyReply) {
    try {
      const { postId } = request.params;
      const userId = (request as any).user?.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      await this.postService.deletePost(postId, userId);
      reply.code(204).send();
    } catch (error) {
      console.error('Error deleting post:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        reply.code(404).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to delete post' });
      }
    }
  }

  async getUserPosts(request: FastifyRequest<{ Params: UserParams; Querystring: QueryParams }>, reply: FastifyReply) {
    try {
      const { userId } = request.params;

      const { page = '1', limit = '20' } = request.query;
      const viewerId = (request as any).user?.userId;

      const result = await this.postService.getPostsByUser(
        userId,
        parseInt(page),
        parseInt(limit),
        viewerId
      );

      reply.send(result);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      reply.code(500).send({ error: 'Failed to fetch user posts' });
    }
  }

  async getJourneyPosts(request: FastifyRequest<{ Params: JourneyParams; Querystring: QueryParams }>, reply: FastifyReply) {
    try {
      const { journeyId } = request.params as any;

      const { page = '1', limit = '20' } = request.query;
      const viewerId = (request as any).user?.userId;

      const result = await this.postService.getPostsByJourney(
        journeyId,
        parseInt(page),
        parseInt(limit),
        viewerId
      );

      reply.send(result);
    } catch (error) {
      console.error('Error fetching journey posts:', error);
      reply.code(500).send({ error: 'Failed to fetch journey posts' });
    }
  }

  async getRecentPosts(request: FastifyRequest<{ Querystring: QueryParams }>, reply: FastifyReply) {
    try {
      const { page = '1', limit = '20' } = request.query;
      const viewerId = (request as any).user?.userId;

      const result = await this.postService.getRecentPosts(
        parseInt(page),
        parseInt(limit),
        viewerId
      );

      reply.send(result);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      reply.code(500).send({ error: 'Failed to fetch recent posts' });
    }
  }

  async searchByHashtag(request: FastifyRequest<{ Params: HashtagParams; Querystring: QueryParams }>, reply: FastifyReply) {
    try {
      const { hashtag } = request.params;
      const { page = '1', limit = '20' } = request.query;

      const result = await this.postService.searchPostsByHashtag(
        hashtag,
        parseInt(page),
        parseInt(limit)
      );

      reply.send(result);
    } catch (error) {
      console.error('Error searching posts by hashtag:', error);
      reply.code(500).send({ error: 'Failed to search posts by hashtag' });
    }
  }
}
