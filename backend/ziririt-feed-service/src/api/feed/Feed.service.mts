import { MongoClient } from 'mongodb';
import appConfig from '../../configs/app.config.mjs';

class FeedService {
  private mongoClient: MongoClient;
  private logger: any;

  constructor({ logger }: { logger: any }) {
    this.logger = logger;
    this.mongoClient = new MongoClient(appConfig.MONGODB_URI);
  }

  async getHomeFeed(page: number = 1) {
    try {
      await this.mongoClient.connect();
      const limit = 20;
      const skip = (page - 1) * limit;

      const postsCollection = this.mongoClient.db('ziririt_posts').collection('posts');
      
      const posts = await postsCollection
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const feedItems = posts.map(post => ({
        id: post.id || post._id.toString(),
        type: 'post',
        content: {
          id: post.id || post._id.toString(),
          userId: post.userId,
          goalId: post.goalId,
          content: post.content,
          mediaFiles: post.mediaFiles || [],
          hashtags: post.hashtags || [],
          isMilestone: post.isMilestone || false,
          progressDate: post.progressDate,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          likesCount: post.likesCount || 0,
          commentsCount: post.commentsCount || 0,
        },
        user: { id: post.userId },
        timestamp: post.createdAt,
        socialStats: {
          likesCount: post.likesCount || 0,
          commentsCount: post.commentsCount || 0,
        },
      }));

      return {
        items: feedItems,
        page,
        hasMore: feedItems.length === limit,
      };
    } catch (error) {
      this.logger.error('Error getting home feed:', error);
      throw error;
    } finally {
      await this.mongoClient.close();
    }
  }

  async getGoalTimeline(goalId: string, page: number = 1) {
    try {
      await this.mongoClient.connect();
      const limit = 20;
      const skip = (page - 1) * limit;

      const postsCollection = this.mongoClient.db('ziririt_posts').collection('posts');
      
      const posts = await postsCollection
        .find({ goalId })
        .sort({ progressDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const feedItems = posts.map(post => ({
        id: post.id || post._id.toString(),
        type: 'post',
        content: post,
        user: { id: post.userId },
        timestamp: post.createdAt,
        socialStats: {
          likesCount: post.likesCount || 0,
          commentsCount: post.commentsCount || 0,
        },
      }));

      return {
        items: feedItems,
        page,
        hasMore: feedItems.length === limit,
      };
    } catch (error) {
      this.logger.error('Error getting goal timeline:', error);
      throw error;
    } finally {
      await this.mongoClient.close();
    }
  }

  async refreshFeed() {
    this.logger.info('Feed refresh requested');
    return { message: 'Feed refreshed successfully' };
  }
}

export default FeedService;