import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { PostService } from '../services/post.service.mjs';
import { CreatePostRequest, UpdatePostRequest } from '../types/post.types.mjs';

const postService = new PostService();

// Request schemas
const createPostSchema = {
  type: 'object',
  required: ['goalId', 'content'],
  properties: {
    goalId: { type: 'string' },
    content: { type: 'string', minLength: 1, maxLength: 500 },
    mediaFiles: { 
      type: 'array',
      items: { type: 'string' },
      maxItems: 5
    },
    hashtags: {
      type: 'array',
      items: { type: 'string', maxLength: 50 },
      maxItems: 20
    },
    isMilestone: { type: 'boolean' },
    progressDate: { type: 'string', format: 'date-time' },
  },
};

const updatePostSchema = {
  type: 'object',
  properties: {
    content: { type: 'string', minLength: 1, maxLength: 500 },
    hashtags: {
      type: 'array',
      items: { type: 'string', maxLength: 50 },
      maxItems: 20
    },
    isMilestone: { type: 'boolean' },
    progressDate: { type: 'string', format: 'date-time' },
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

export const postRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  // Health check
  fastify.get('/health', async (request, reply) => {
    return { status: 'healthy', service: 'ziririt-post-service' };
  });

  // Create a new post
  fastify.post<{ Body: CreatePostRequest }>('/', {
    preHandler: authenticateUser,
    schema: { body: createPostSchema },
    handler: async (request, reply) => {
      try {
        const postData = request.body;
        const currentUser = (request as any).user;

        const post = await postService.createPost(currentUser.userId, postData);
        
        return reply.code(201).send({ post });
      } catch (error) {
        request.log.error('Create post error:', error);
        return reply.code(500).send({ 
          error: 'Failed to create post',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Get a specific post
  fastify.get<{ Params: { postId: string } }>('/:postId', {
    handler: async (request, reply) => {
      try {
        const { postId } = request.params;
        
        // Get viewer ID from auth token if present
        const authHeader = request.headers.authorization;
        let viewerId: string | undefined;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          // TODO: Extract viewerId from JWT token
          viewerId = undefined;
        }

        const post = await postService.getPostById(postId, viewerId);
        
        if (!post) {
          return reply.code(404).send({ error: 'Post not found or access denied' });
        }

        return reply.code(200).send({ post });
      } catch (error) {
        request.log.error('Get post error:', error);
        return reply.code(500).send({ 
          error: 'Failed to get post',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Update a post
  fastify.put<{ Params: { postId: string }, Body: UpdatePostRequest }>('/:postId', {
    preHandler: authenticateUser,
    schema: { body: updatePostSchema },
    handler: async (request, reply) => {
      try {
        const { postId } = request.params;
        const updates = request.body;
        const currentUser = (request as any).user;

        const updatedPost = await postService.updatePost(postId, currentUser.userId, updates);
        
        return reply.code(200).send({ post: updatedPost });
      } catch (error) {
        request.log.error('Update post error:', error);
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({ error: error.message });
        }
        return reply.code(500).send({ 
          error: 'Failed to update post',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Delete a post
  fastify.delete<{ Params: { postId: string } }>('/:postId', {
    preHandler: authenticateUser,
    handler: async (request, reply) => {
      try {
        const { postId } = request.params;
        const currentUser = (request as any).user;

        await postService.deletePost(postId, currentUser.userId);
        
        return reply.code(200).send({ message: 'Post deleted successfully' });
      } catch (error) {
        request.log.error('Delete post error:', error);
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({ error: error.message });
        }
        return reply.code(500).send({ 
          error: 'Failed to delete post',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Get posts by user
  fastify.get<{ 
    Params: { userId: string }, 
    Querystring: { page?: string, limit?: string } 
  }>('/user/:userId', {
    handler: async (request, reply) => {
      try {
        const { userId } = request.params;
        const page = parseInt(request.query.page || '1', 10);
        const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);
        
        // Get viewer ID from auth token if present
        const authHeader = request.headers.authorization;
        let viewerId: string | undefined;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          // TODO: Extract viewerId from JWT token
          viewerId = undefined;
        }

        const result = await postService.getPostsByUser(userId, page, limit, viewerId);
        
        return reply.code(200).send(result);
      } catch (error) {
        request.log.error('Get user posts error:', error);
        return reply.code(500).send({ 
          error: 'Failed to get user posts',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Get posts by goal
  fastify.get<{ 
    Params: { goalId: string }, 
    Querystring: { page?: string, limit?: string } 
  }>('/goal/:goalId', {
    handler: async (request, reply) => {
      try {
        const { goalId } = request.params;
        const page = parseInt(request.query.page || '1', 10);
        const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);
        
        // Get viewer ID from auth token if present
        const authHeader = request.headers.authorization;
        let viewerId: string | undefined;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          // TODO: Extract viewerId from JWT token
          viewerId = undefined;
        }

        const result = await postService.getPostsByGoal(goalId, page, limit, viewerId);
        
        return reply.code(200).send(result);
      } catch (error) {
        request.log.error('Get goal posts error:', error);
        return reply.code(500).send({ 
          error: 'Failed to get goal posts',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Get recent posts (feed)
  fastify.get<{ 
    Querystring: { page?: string, limit?: string } 
  }>('/recent', {
    handler: async (request, reply) => {
      try {
        const page = parseInt(request.query.page || '1', 10);
        const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);
        
        // Get viewer ID from auth token if present
        const authHeader = request.headers.authorization;
        let viewerId: string | undefined;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          // TODO: Extract viewerId from JWT token
          viewerId = undefined;
        }

        const result = await postService.getRecentPosts(page, limit, viewerId);
        
        return reply.code(200).send(result);
      } catch (error) {
        request.log.error('Get recent posts error:', error);
        return reply.code(500).send({ 
          error: 'Failed to get recent posts',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Search posts by hashtag
  fastify.get<{ 
    Params: { hashtag: string },
    Querystring: { page?: string, limit?: string } 
  }>('/hashtag/:hashtag', {
    handler: async (request, reply) => {
      try {
        const { hashtag } = request.params;
        const page = parseInt(request.query.page || '1', 10);
        const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);

        const result = await postService.searchPostsByHashtag(hashtag, page, limit);
        
        return reply.code(200).send(result);
      } catch (error) {
        request.log.error('Search posts by hashtag error:', error);
        return reply.code(500).send({ 
          error: 'Failed to search posts',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  done();
};