import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '../database/db.mts';
import { Post, CreatePostRequest, UpdatePostRequest, PostWithUser, PaginatedResponse } from '../types/post.types.mts';

export class PostService {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  async createPost(userId: string, postData: CreatePostRequest): Promise<Post> {
    const { journeyId, content, mediaFiles, hashtags, isMilestone = false, progressDate } = postData;
    
    const post: Post = {
      id: uuidv4(),
      userId,
      journeyId,
      content,
      mediaFiles: mediaFiles ? [] : undefined, // TODO: Link to actual media files
      hashtags: hashtags?.map(tag => tag.startsWith('#') ? tag : `#${tag}`),
      isMilestone,
      progressDate: progressDate ? new Date(progressDate) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      likesCount: 0,
      commentsCount: 0,
    };

    const collection = this.db.getCollection<Post>('posts');
    await collection.insertOne(post);

    return post;
  }

  async getPostById(postId: string, viewerId?: string): Promise<Post | null> {
    const collection = this.db.getCollection<Post>('posts');
    const post = await collection.findOne({ id: postId });

    if (!post) {
      return null;
    }

    // TODO: Add privacy checks based on journey privacy and user relationships
    return post;
  }

  async getPostsByUser(userId: string, page: number = 1, limit: number = 20, viewerId?: string): Promise<PaginatedResponse<Post>> {
    const collection = this.db.getCollection<Post>('posts');
    const skip = (page - 1) * limit;

    // TODO: Add privacy checks based on user relationships and journey privacy
    const posts = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const hasMore = posts.length === limit;

    return {
      items: posts,
      pagination: {
        page,
        limit,
        hasMore,
      },
    };
  }

  async getPostsByJourney(journeyId: string, page: number = 1, limit: number = 20, viewerId?: string): Promise<PaginatedResponse<Post>> {
    const collection = this.db.getCollection<Post>('posts');
    const skip = (page - 1) * limit;

    // TODO: Add privacy checks based on journey privacy and user relationships
    const posts = await collection
      .find({ journeyId })
      .sort({ progressDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const hasMore = posts.length === limit;

    return {
      items: posts,
      pagination: {
        page,
        limit,
        hasMore,
      },
    };
  }

  async updatePost(postId: string, userId: string, updates: UpdatePostRequest): Promise<Post> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.content !== undefined) {
      updateData.content = updates.content;
    }
    if (updates.hashtags !== undefined) {
      updateData.hashtags = updates.hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`);
    }
    if (updates.isMilestone !== undefined) {
      updateData.isMilestone = updates.isMilestone;
    }
    if (updates.progressDate !== undefined) {
      updateData.progressDate = new Date(updates.progressDate);
    }

    const collection = this.db.getCollection<Post>('posts');
    const result = await collection.findOneAndUpdate(
      { id: postId, userId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Post not found or access denied');
    }

    return result;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const collection = this.db.getCollection<Post>('posts');
    const result = await collection.deleteOne({ id: postId, userId });

    if (result.deletedCount === 0) {
      throw new Error('Post not found or access denied');
    }

    // TODO: Also delete associated likes and comments
    await this.deleteLikesForPost(postId);
    await this.deleteCommentsForPost(postId);
  }

  async getRecentPosts(page: number = 1, limit: number = 20, viewerId?: string): Promise<PaginatedResponse<Post>> {
    const collection = this.db.getCollection<Post>('posts');
    const skip = (page - 1) * limit;

    // TODO: Filter based on following relationships and privacy settings
    const posts = await collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const hasMore = posts.length === limit;

    return {
      items: posts,
      pagination: {
        page,
        limit,
        hasMore,
      },
    };
  }

  async searchPostsByHashtag(hashtag: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Post>> {
    const collection = this.db.getCollection<Post>('posts');
    const skip = (page - 1) * limit;
    
    const searchTag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;

    const posts = await collection
      .find({ hashtags: searchTag })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const hasMore = posts.length === limit;

    return {
      items: posts,
      pagination: {
        page,
        limit,
        hasMore,
      },
    };
  }

  async updateSocialStats(postId: string): Promise<void> {
    const likesCollection = this.db.getCollection('likes');
    const commentsCollection = this.db.getCollection('comments');
    const postsCollection = this.db.getCollection<Post>('posts');

    // Count likes and comments
    const [likesCount, commentsCount] = await Promise.all([
      likesCollection.countDocuments({ postId }),
      commentsCollection.countDocuments({ postId }),
    ]);

    // Update post stats
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

  private async deleteLikesForPost(postId: string): Promise<void> {
    const collection = this.db.getCollection('likes');
    await collection.deleteMany({ postId });
  }

  private async deleteCommentsForPost(postId: string): Promise<void> {
    const collection = this.db.getCollection('comments');
    await collection.deleteMany({ postId });
  }
}
