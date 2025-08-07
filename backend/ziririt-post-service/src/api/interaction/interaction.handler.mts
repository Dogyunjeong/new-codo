import { FastifyRequest, FastifyReply } from 'fastify';
import { InteractionManagementService } from './InteractionManagement.service.mts';
import { CreateCommentRequest } from '../../types/post.types.mts';

interface PostParams {
  postId: string;
}

interface CommentParams {
  commentId: string;
}

interface UserParams {
  userId: string;
}

interface QueryParams {
  page?: string;
  limit?: string;
}

interface UpdateCommentBody {
  content: string;
}

export class InteractionHandler {
  constructor(private interactionService: InteractionManagementService) {}

  async likePost(request: FastifyRequest<{ Params: PostParams }>, reply: FastifyReply) {
    try {
      const { postId } = request.params;
      const userId = (request as any).user?.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      await this.interactionService.likePost(userId, postId);
      reply.code(204).send();
    } catch (error) {
      console.error('Error liking post:', error);
      if (error instanceof Error && error.message.includes('already liked')) {
        reply.code(409).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to like post' });
      }
    }
  }

  async unlikePost(request: FastifyRequest<{ Params: PostParams }>, reply: FastifyReply) {
    try {
      const { postId } = request.params;
      const userId = (request as any).user?.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      await this.interactionService.unlikePost(userId, postId);
      reply.code(204).send();
    } catch (error) {
      console.error('Error unliking post:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        reply.code(404).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to unlike post' });
      }
    }
  }

  async addComment(request: FastifyRequest<{ Params: PostParams; Body: CreateCommentRequest }>, reply: FastifyReply) {
    try {
      const { postId } = request.params;
      const userId = (request as any).user?.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const comment = await this.interactionService.addComment(userId, postId, request.body);
      reply.code(201).send({ comment });
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error instanceof Error && error.message.includes('Invalid parent')) {
        reply.code(400).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to add comment' });
      }
    }
  }

  async deleteComment(request: FastifyRequest<{ Params: CommentParams }>, reply: FastifyReply) {
    try {
      const { commentId } = request.params;
      const userId = (request as any).user?.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      await this.interactionService.deleteComment(commentId, userId);
      reply.code(204).send();
    } catch (error) {
      console.error('Error deleting comment:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        reply.code(404).send({ error: error.message });
      } else if (error instanceof Error && error.message.includes('Access denied')) {
        reply.code(403).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to delete comment' });
      }
    }
  }

  async updateComment(request: FastifyRequest<{ Params: CommentParams; Body: UpdateCommentBody }>, reply: FastifyReply) {
    try {
      const { commentId } = request.params;
      const { content } = request.body;
      const userId = (request as any).user?.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const comment = await this.interactionService.updateComment(commentId, userId, content);
      reply.send({ comment });
    } catch (error) {
      console.error('Error updating comment:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        reply.code(404).send({ error: error.message });
      } else {
        reply.code(500).send({ error: 'Failed to update comment' });
      }
    }
  }

  async getPostLikes(request: FastifyRequest<{ Params: PostParams; Querystring: QueryParams }>, reply: FastifyReply) {
    try {
      const { postId } = request.params;
      const { page = '1', limit = '20' } = request.query;

      const result = await this.interactionService.getPostLikes(
        postId,
        parseInt(page),
        parseInt(limit)
      );

      reply.send(result);
    } catch (error) {
      console.error('Error fetching post likes:', error);
      reply.code(500).send({ error: 'Failed to fetch post likes' });
    }
  }

  async getPostComments(request: FastifyRequest<{ Params: PostParams; Querystring: QueryParams }>, reply: FastifyReply) {
    try {
      const { postId } = request.params;
      const { page = '1', limit = '20' } = request.query;

      const result = await this.interactionService.getPostComments(
        postId,
        parseInt(page),
        parseInt(limit)
      );

      reply.send(result);
    } catch (error) {
      console.error('Error fetching post comments:', error);
      reply.code(500).send({ error: 'Failed to fetch post comments' });
    }
  }

  async getCommentReplies(request: FastifyRequest<{ Params: CommentParams; Querystring: QueryParams }>, reply: FastifyReply) {
    try {
      const { commentId } = request.params;
      const { page = '1', limit = '10' } = request.query;

      const result = await this.interactionService.getCommentReplies(
        commentId,
        parseInt(page),
        parseInt(limit)
      );

      reply.send(result);
    } catch (error) {
      console.error('Error fetching comment replies:', error);
      reply.code(500).send({ error: 'Failed to fetch comment replies' });
    }
  }

  async getUserLikes(request: FastifyRequest<{ Params: UserParams; Querystring: QueryParams }>, reply: FastifyReply) {
    try {
      const { userId } = request.params;
      const { page = '1', limit = '20' } = request.query;

      const result = await this.interactionService.getUserLikedPosts(
        userId,
        parseInt(page),
        parseInt(limit)
      );

      reply.send(result);
    } catch (error) {
      console.error('Error fetching user likes:', error);
      reply.code(500).send({ error: 'Failed to fetch user likes' });
    }
  }

  async checkPostLiked(request: FastifyRequest<{ Params: PostParams }>, reply: FastifyReply) {
    try {
      const { postId } = request.params;
      const userId = (request as any).user?.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const isLiked = await this.interactionService.isPostLikedByUser(postId, userId);
      reply.send({ isLiked });
    } catch (error) {
      console.error('Error checking post like status:', error);
      reply.code(500).send({ error: 'Failed to check post like status' });
    }
  }
}