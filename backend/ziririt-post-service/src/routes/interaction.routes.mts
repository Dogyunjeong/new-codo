import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { InteractionService } from '../services/interaction.service.mjs';
import { CreateCommentRequest } from '../types/post.types.mjs';

const interactionService = new InteractionService();

// Request schemas
const createCommentSchema = {
  type: 'object',
  required: ['content'],
  properties: {
    content: { type: 'string', minLength: 1, maxLength: 500 },
    parentCommentId: { type: 'string' },
  },
};

const updateCommentSchema = {
  type: 'object',
  required: ['content'],
  properties: {
    content: { type: 'string', minLength: 1, maxLength: 500 },
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

export const interactionRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  // Like a post
  fastify.post<{ Params: { postId: string } }>('/posts/:postId/like', {
    preHandler: authenticateUser,
    handler: async (request, reply) => {
      try {
        const { postId } = request.params;
        const currentUser = (request as any).user;

        await interactionService.likePost(currentUser.userId, postId);
        
        return reply.code(200).send({ message: 'Post liked successfully' });
      } catch (error) {
        request.log.error('Like post error:', error);
        if (error instanceof Error && error.message.includes('already liked')) {
          return reply.code(409).send({ error: error.message });
        }
        return reply.code(500).send({ 
          error: 'Failed to like post',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Unlike a post
  fastify.delete<{ Params: { postId: string } }>('/posts/:postId/like', {
    preHandler: authenticateUser,
    handler: async (request, reply) => {
      try {
        const { postId } = request.params;
        const currentUser = (request as any).user;

        await interactionService.unlikePost(currentUser.userId, postId);
        
        return reply.code(200).send({ message: 'Post unliked successfully' });
      } catch (error) {
        request.log.error('Unlike post error:', error);
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({ error: error.message });
        }
        return reply.code(500).send({ 
          error: 'Failed to unlike post',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Add comment to a post
  fastify.post<{ Params: { postId: string }, Body: CreateCommentRequest }>('/posts/:postId/comments', {
    preHandler: authenticateUser,
    schema: { body: createCommentSchema },
    handler: async (request, reply) => {
      try {
        const { postId } = request.params;
        const commentData = request.body;
        const currentUser = (request as any).user;

        const comment = await interactionService.addComment(currentUser.userId, postId, commentData);
        
        return reply.code(201).send({ comment });
      } catch (error) {
        request.log.error('Add comment error:', error);
        if (error instanceof Error && error.message.includes('Invalid parent comment')) {
          return reply.code(400).send({ error: error.message });
        }
        return reply.code(500).send({ 
          error: 'Failed to add comment',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Update a comment
  fastify.put<{ Params: { commentId: string }, Body: { content: string } }>('/comments/:commentId', {
    preHandler: authenticateUser,
    schema: { body: updateCommentSchema },
    handler: async (request, reply) => {
      try {
        const { commentId } = request.params;
        const { content } = request.body;
        const currentUser = (request as any).user;

        const updatedComment = await interactionService.updateComment(commentId, currentUser.userId, content);
        
        return reply.code(200).send({ comment: updatedComment });
      } catch (error) {
        request.log.error('Update comment error:', error);
        if (error instanceof Error && error.message.includes('not found')) {
          return reply.code(404).send({ error: error.message });
        }
        return reply.code(500).send({ 
          error: 'Failed to update comment',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Delete a comment
  fastify.delete<{ Params: { commentId: string } }>('/comments/:commentId', {
    preHandler: authenticateUser,
    handler: async (request, reply) => {
      try {
        const { commentId } = request.params;
        const currentUser = (request as any).user;

        await interactionService.deleteComment(commentId, currentUser.userId);
        
        return reply.code(200).send({ message: 'Comment deleted successfully' });
      } catch (error) {
        request.log.error('Delete comment error:', error);
        if (error instanceof Error && (error.message.includes('not found') || error.message.includes('Access denied'))) {
          return reply.code(404).send({ error: error.message });
        }
        return reply.code(500).send({ 
          error: 'Failed to delete comment',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Get post likes
  fastify.get<{ 
    Params: { postId: string }, 
    Querystring: { page?: string, limit?: string } 
  }>('/posts/:postId/likes', {
    handler: async (request, reply) => {
      try {
        const { postId } = request.params;
        const page = parseInt(request.query.page || '1', 10);
        const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);

        const result = await interactionService.getPostLikes(postId, page, limit);
        
        return reply.code(200).send(result);
      } catch (error) {
        request.log.error('Get post likes error:', error);
        return reply.code(500).send({ 
          error: 'Failed to get post likes',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Get post comments
  fastify.get<{ 
    Params: { postId: string }, 
    Querystring: { page?: string, limit?: string } 
  }>('/posts/:postId/comments', {
    handler: async (request, reply) => {
      try {
        const { postId } = request.params;
        const page = parseInt(request.query.page || '1', 10);
        const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);

        const result = await interactionService.getPostComments(postId, page, limit);
        
        return reply.code(200).send(result);
      } catch (error) {
        request.log.error('Get post comments error:', error);
        return reply.code(500).send({ 
          error: 'Failed to get post comments',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Get comment replies
  fastify.get<{ 
    Params: { commentId: string }, 
    Querystring: { page?: string, limit?: string } 
  }>('/comments/:commentId/replies', {
    handler: async (request, reply) => {
      try {
        const { commentId } = request.params;
        const page = parseInt(request.query.page || '1', 10);
        const limit = Math.min(parseInt(request.query.limit || '10', 10), 50);

        const result = await interactionService.getCommentReplies(commentId, page, limit);
        
        return reply.code(200).send(result);
      } catch (error) {
        request.log.error('Get comment replies error:', error);
        return reply.code(500).send({ 
          error: 'Failed to get comment replies',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Check if post is liked by user
  fastify.get<{ Params: { postId: string } }>('/posts/:postId/liked', {
    preHandler: authenticateUser,
    handler: async (request, reply) => {
      try {
        const { postId } = request.params;
        const currentUser = (request as any).user;

        const isLiked = await interactionService.isPostLikedByUser(postId, currentUser.userId);
        
        return reply.code(200).send({ isLiked });
      } catch (error) {
        request.log.error('Check post liked error:', error);
        return reply.code(500).send({ 
          error: 'Failed to check like status',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Get user's liked posts
  fastify.get<{ 
    Querystring: { page?: string, limit?: string } 
  }>('/user/likes', {
    preHandler: authenticateUser,
    handler: async (request, reply) => {
      try {
        const page = parseInt(request.query.page || '1', 10);
        const limit = Math.min(parseInt(request.query.limit || '20', 10), 100);
        const currentUser = (request as any).user;

        const result = await interactionService.getUserLikedPosts(currentUser.userId, page, limit);
        
        return reply.code(200).send(result);
      } catch (error) {
        request.log.error('Get user liked posts error:', error);
        return reply.code(500).send({ 
          error: 'Failed to get liked posts',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  done();
};