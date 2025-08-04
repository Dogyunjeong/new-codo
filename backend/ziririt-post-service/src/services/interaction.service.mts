import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '../database/db.mjs';
import { Like, Comment, CreateCommentRequest, CommentWithUser, LikeWithUser, PaginatedResponse } from '../types/post.types.mjs';
import { PostService } from './post.service.mjs';

export class InteractionService {
  private db: DatabaseConnection;
  private postService: PostService;

  constructor() {
    this.db = DatabaseConnection.getInstance();
    this.postService = new PostService();
  }

  async likePost(userId: string, postId: string): Promise<void> {
    const likesCollection = this.db.getCollection<Like>('likes');
    
    // Check if already liked
    const existingLike = await likesCollection.findOne({ userId, postId });
    if (existingLike) {
      throw new Error('Post already liked by user');
    }

    // Create like
    const like: Like = {
      id: uuidv4(),
      userId,
      postId,
      postType: 'progress_post',
      createdAt: new Date(),
    };

    await likesCollection.insertOne(like);

    // Update post stats
    await this.postService.updateSocialStats(postId);
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const likesCollection = this.db.getCollection<Like>('likes');
    
    const result = await likesCollection.deleteOne({ userId, postId });
    if (result.deletedCount === 0) {
      throw new Error('Like not found');
    }

    // Update post stats
    await this.postService.updateSocialStats(postId);
  }

  async addComment(userId: string, postId: string, commentData: CreateCommentRequest): Promise<Comment> {
    const { content, parentCommentId } = commentData;

    // Validate parent comment if provided
    if (parentCommentId) {
      const parentComment = await this.getCommentById(parentCommentId);
      if (!parentComment || parentComment.postId !== postId) {
        throw new Error('Invalid parent comment');
      }
    }

    const comment: Comment = {
      id: uuidv4(),
      userId,
      postId,
      postType: 'progress_post',
      content,
      parentCommentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const commentsCollection = this.db.getCollection<Comment>('comments');
    await commentsCollection.insertOne(comment);

    // Update post stats
    await this.postService.updateSocialStats(postId);

    return comment;
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const commentsCollection = this.db.getCollection<Comment>('comments');
    
    const comment = await commentsCollection.findOne({ id: commentId });
    if (!comment) {
      throw new Error('Comment not found');
    }

    // Check if user owns the comment (in production, also check if user owns the post)
    if (comment.userId !== userId) {
      throw new Error('Access denied');
    }

    // Delete the comment and all its replies
    await this.deleteCommentAndReplies(commentId);

    // Update post stats
    await this.postService.updateSocialStats(comment.postId);
  }

  async getPostLikes(postId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Like>> {
    const likesCollection = this.db.getCollection<Like>('likes');
    const skip = (page - 1) * limit;

    const likes = await likesCollection
      .find({ postId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const hasMore = likes.length === limit;

    return {
      items: likes,
      pagination: {
        page,
        limit,
        hasMore,
      },
    };
  }

  async getPostComments(postId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Comment>> {
    const commentsCollection = this.db.getCollection<Comment>('comments');
    const skip = (page - 1) * limit;

    // Get top-level comments first (no parent)
    const comments = await commentsCollection
      .find({ postId, parentCommentId: { $exists: false } })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // For each comment, get its replies (limited to avoid deep nesting)
    for (const comment of comments) {
      const replies = await commentsCollection
        .find({ parentCommentId: comment.id })
        .sort({ createdAt: 1 })
        .limit(5) // Limit replies per comment
        .toArray();
      
      (comment as any).replies = replies;
    }

    const hasMore = comments.length === limit;

    return {
      items: comments,
      pagination: {
        page,
        limit,
        hasMore,
      },
    };
  }

  async getUserLikedPosts(userId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Like>> {
    const likesCollection = this.db.getCollection<Like>('likes');
    const skip = (page - 1) * limit;

    const likes = await likesCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const hasMore = likes.length === limit;

    return {
      items: likes,
      pagination: {
        page,
        limit,
        hasMore,
      },
    };
  }

  async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    const likesCollection = this.db.getCollection<Like>('likes');
    const like = await likesCollection.findOne({ postId, userId });
    return !!like;
  }

  async getCommentById(commentId: string): Promise<Comment | null> {
    const commentsCollection = this.db.getCollection<Comment>('comments');
    return await commentsCollection.findOne({ id: commentId });
  }

  async updateComment(commentId: string, userId: string, content: string): Promise<Comment> {
    const commentsCollection = this.db.getCollection<Comment>('comments');
    
    const result = await commentsCollection.findOneAndUpdate(
      { id: commentId, userId },
      { 
        $set: { 
          content,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Comment not found or access denied');
    }

    return result;
  }

  private async deleteCommentAndReplies(commentId: string): Promise<void> {
    const commentsCollection = this.db.getCollection<Comment>('comments');
    
    // Get all replies to this comment
    const replies = await commentsCollection.find({ parentCommentId: commentId }).toArray();
    
    // Recursively delete replies
    for (const reply of replies) {
      await this.deleteCommentAndReplies(reply.id);
    }
    
    // Delete the comment itself
    await commentsCollection.deleteOne({ id: commentId });
  }

  async getCommentReplies(commentId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Comment>> {
    const commentsCollection = this.db.getCollection<Comment>('comments');
    const skip = (page - 1) * limit;

    const replies = await commentsCollection
      .find({ parentCommentId: commentId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const hasMore = replies.length === limit;

    return {
      items: replies,
      pagination: {
        page,
        limit,
        hasMore,
      },
    };
  }
}