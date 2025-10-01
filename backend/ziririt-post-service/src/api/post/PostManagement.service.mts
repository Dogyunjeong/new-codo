import { v4 as uuidv4 } from 'uuid';
import { Post, CreatePostRequest, UpdatePostRequest, PaginatedResponse } from '../../types/post.types.mts';
import { MongoConnectionService, PerformanceMonitorService, LoggerService } from '@base/server-services';
import { getJourney as fetchJourney } from '../../services/profile.controller.mts';

export class PostManagementService {
  private mongoConnection: MongoConnectionService;
  private performanceMonitor: PerformanceMonitorService;
  private logger: LoggerService;

  constructor(mongoConnection: MongoConnectionService) {
    this.mongoConnection = mongoConnection;
    this.performanceMonitor = new PerformanceMonitorService('ziririt-post-service');
    this.logger = new LoggerService('ziririt-post-service');
  }

  async createPost(userId: string, postData: CreatePostRequest): Promise<Post> {
    return this.performanceMonitor.monitorBusinessOperation(
      'create_post',
      'post',
      async () => {
        const { journeyId, content, mediaFiles, hashtags, isMilestone = false, progressDate } = postData;
        
        this.logger.info('Creating new post', { 
          userId, 
          journeyId, 
          isMilestone,
          hashtagCount: hashtags?.length || 0
        });

        const post: Post = {
          id: uuidv4(),
          userId,
          journeyId,
          content,
          mediaFiles: mediaFiles ? [] : undefined,
          hashtags: hashtags?.map(tag => tag.startsWith('#') ? tag : `#${tag}`),
          isMilestone,
          progressDate: progressDate ? new Date(progressDate) : new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          likesCount: 0,
          commentsCount: 0,
        };

        const collection = this.mongoConnection.getCollection<Post>('posts');
        await this.performanceMonitor.monitorDatabaseOperation(
          'insert',
          'posts',
          () => collection.insertOne(post)
        );

        this.logger.info('Post created successfully', { 
          postId: post.id, 
          userId 
        });

        return post;
      }
    );
  }

  async getPostById(postId: string, viewerId?: string): Promise<Post | null> {
    return this.performanceMonitor.monitorBusinessOperation(
      'get_post',
      'post',
      async () => {
        this.logger.debug('Fetching post by ID', { postId, viewerId });

        const collection = this.mongoConnection.getCollection<Post>('posts');
        const post = await this.performanceMonitor.monitorDatabaseOperation(
          'findOne',
          'posts',
          () => collection.findOne({ id: postId })
        );

        if (!post) {
          this.logger.debug('Post not found', { postId });
          return null;
        }

        // Enforce journey privacy
        if (await this.isPostVisibleToViewer(post, viewerId)) {
          this.logger.debug('Post retrieved successfully', { postId, userId: post.userId });
          return post;
        }

        this.logger.debug('Post not visible to viewer due to privacy', { postId, viewerId });
        return null;
      }
    );
  }

  async getPostsByUser(userId: string, page: number = 1, limit: number = 20, viewerId?: string): Promise<PaginatedResponse<Post>> {
    const collection = this.mongoConnection.getCollection<Post>('posts');
    const skip = (page - 1) * limit;

    const posts = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const filtered = await this.filterVisiblePosts(posts, viewerId);
    const hasMore = filtered.length === limit; // approximate without total count

    return {
      items: filtered,
      pagination: {
        page,
        limit,
        hasMore,
      },
    };
  }

  async getPostsByJourney(journeyId: string, page: number = 1, limit: number = 20, viewerId?: string): Promise<PaginatedResponse<Post>> {
    const collection = this.mongoConnection.getCollection<Post>('posts');
    const skip = (page - 1) * limit;

    const posts = await collection
      .find({ journeyId })
      .sort({ progressDate: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const filtered = await this.filterVisiblePosts(posts, viewerId);
    const hasMore = filtered.length === limit; // approximate

    return {
      items: filtered,
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

    const collection = this.mongoConnection.getCollection<Post>('posts');
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
    const collection = this.mongoConnection.getCollection<Post>('posts');
    const result = await collection.deleteOne({ id: postId, userId });

    if (result.deletedCount === 0) {
      throw new Error('Post not found or access denied');
    }

    await this.deleteLikesForPost(postId);
    await this.deleteCommentsForPost(postId);
  }

  async getRecentPosts(page: number = 1, limit: number = 20, viewerId?: string): Promise<PaginatedResponse<Post>> {
    const collection = this.mongoConnection.getCollection<Post>('posts');
    const skip = (page - 1) * limit;

    const posts = await collection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const filtered = await this.filterVisiblePosts(posts, viewerId);
    const hasMore = filtered.length === limit; // approximate

    return {
      items: filtered,
      pagination: {
        page,
        limit,
        hasMore,
      },
    };
  }

  async searchPostsByHashtag(hashtag: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Post>> {
    const collection = this.mongoConnection.getCollection<Post>('posts');
    const skip = (page - 1) * limit;
    
    const searchTag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;

    const posts = await collection
      .find({ hashtags: searchTag })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    const filtered = await this.filterVisiblePosts(posts);
    const hasMore = filtered.length === limit; // approximate

    return {
      items: filtered,
      pagination: {
        page,
        limit,
        hasMore,
      },
    };
  }

  async updateSocialStats(postId: string): Promise<void> {
    const likesCollection = this.mongoConnection.getCollection('likes');
    const commentsCollection = this.mongoConnection.getCollection('comments');
    const postsCollection = this.mongoConnection.getCollection<Post>('posts');

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

  private async deleteLikesForPost(postId: string): Promise<void> {
    const collection = this.mongoConnection.getCollection('likes');
    await collection.deleteMany({ postId });
  }

  private async deleteCommentsForPost(postId: string): Promise<void> {
    const collection = this.mongoConnection.getCollection('comments');
    await collection.deleteMany({ postId });
  }

  // Privacy helpers
  private async isPostVisibleToViewer(post: Post, viewerId?: string): Promise<boolean> {
    try {
      // Owner can always view
      if (viewerId && viewerId === post.userId) return true;
      // No journeyId means public (should not happen, but be safe)
      if (!(post as any).journeyId) return true;

      const journeyResp: any = await fetchJourney((post as any).journeyId);
      const journey = journeyResp?.journey || journeyResp;
      if (!journey) return false;
      // Public journey
      if (!journey.isPrivate) return true;
      // Private journey: only owner can view
      return viewerId === journey.userId;
    } catch (e) {
      // On failure to resolve journey, deny access by default
      return false;
    }
  }

  private async filterVisiblePosts(posts: Post[], viewerId?: string): Promise<Post[]> {
    const results = await Promise.all(
      posts.map(async (p) => (await this.isPostVisibleToViewer(p, viewerId)) ? p : null)
    );
    return results.filter((p): p is Post => !!p);
  }
}
