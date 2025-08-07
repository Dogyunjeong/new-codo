import { v4 as uuidv4 } from 'uuid';
import { Like, Comment, CreateCommentRequest, PaginatedResponse } from '../../types/post.types.mts';
import { MongoConnectionService } from '@base/shared-services';

export class InteractionManagementService {
  private mongoConnection: MongoConnectionService;

  constructor(mongoConnection: MongoConnectionService) {
    this.mongoConnection = mongoConnection;
  }

  async likePost(userId: string, postId: string): Promise<void> {
    const likesCollection = this.mongoConnection.getCollection<Like>('likes');
    
    const existingLike = await likesCollection.findOne({ userId, postId });
    if (existingLike) {
      throw new Error('Post already liked by user');
    }

    const like: Like = {
      id: uuidv4(),
      userId,
      postId,
      postType: 'progress_post',
      createdAt: new Date(),
    };

    await likesCollection.insertOne(like);
    await this.updatePostSocialStats(postId);
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const likesCollection = this.mongoConnection.getCollection<Like>('likes');
    
    const result = await likesCollection.deleteOne({ userId, postId });
    if (result.deletedCount === 0) {
      throw new Error('Like not found');
    }

    await this.updatePostSocialStats(postId);
  }

  async addComment(userId: string, postId: string, commentData: CreateCommentRequest): Promise<Comment> {
    const { content, parentCommentId } = commentData;

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

    const commentsCollection = this.mongoConnection.getCollection<Comment>('comments');
    await commentsCollection.insertOne(comment);
    await this.updatePostSocialStats(postId);

    return comment;
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const commentsCollection = this.mongoConnection.getCollection<Comment>('comments');
    
    const comment = await commentsCollection.findOne({ id: commentId });
    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.userId !== userId) {
      throw new Error('Access denied');
    }

    await this.deleteCommentAndReplies(commentId);
    await this.updatePostSocialStats(comment.postId);
  }

  async updateComment(commentId: string, userId: string, content: string): Promise<Comment> {
    const commentsCollection = this.mongoConnection.getCollection<Comment>('comments');
    
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

  async getPostLikes(postId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Like>> {
    const likesCollection = this.mongoConnection.getCollection<Like>('likes');
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
    const commentsCollection = this.mongoConnection.getCollection<Comment>('comments');
    const skip = (page - 1) * limit;

    const comments = await commentsCollection
      .find({ postId, parentCommentId: { $exists: false } })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    for (const comment of comments) {
      const replies = await commentsCollection
        .find({ parentCommentId: comment.id })
        .sort({ createdAt: 1 })
        .limit(5)
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

  async getCommentReplies(commentId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Comment>> {
    const commentsCollection = this.mongoConnection.getCollection<Comment>('comments');
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

  async getUserLikedPosts(userId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Like>> {
    const likesCollection = this.mongoConnection.getCollection<Like>('likes');
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
    const likesCollection = this.mongoConnection.getCollection<Like>('likes');
    const like = await likesCollection.findOne({ postId, userId });
    return !!like;
  }

  async getCommentById(commentId: string): Promise<Comment | null> {
    const commentsCollection = this.mongoConnection.getCollection<Comment>('comments');
    return await commentsCollection.findOne({ id: commentId });
  }

  private async deleteCommentAndReplies(commentId: string): Promise<void> {
    const commentsCollection = this.mongoConnection.getCollection<Comment>('comments');
    
    const replies = await commentsCollection.find({ parentCommentId: commentId }).toArray();
    
    for (const reply of replies) {
      await this.deleteCommentAndReplies(reply.id);
    }
    
    await commentsCollection.deleteOne({ id: commentId });
  }

  private async updatePostSocialStats(postId: string): Promise<void> {
    const likesCollection = this.mongoConnection.getCollection('likes');
    const commentsCollection = this.mongoConnection.getCollection('comments');
    const postsCollection = this.mongoConnection.getCollection('posts');

    const [likesCount, commentsCount] = await Promise.all([
      likesCollection.countDocuments({ postId }),
      commentsCollection.countDocuments({ postId }),
    ]);

    await postsCollection.updateOne(
      { id: postId },
      {
        $set: {
          likesCount,
          commentsCount,
          updatedAt: new Date(),
        },
      }
    );
  }
}