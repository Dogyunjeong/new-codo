import { MongoClient, Db, Collection } from 'mongodb';
import { FeedBuilder } from './feedBuilder.util.mts';

export interface FeedServiceDependencies {
  mongoClient: MongoClient;
  database: string;
  logger: any;
}

class FeedService {
  private mongoClient: MongoClient;
  private db: Db;
  private postsCollection: Collection;
  private logger: any;

  constructor(deps: FeedServiceDependencies) {
    this.logger = deps.logger;
    this.mongoClient = deps.mongoClient;
    this.db = this.mongoClient.db(deps.database);
    this.postsCollection = this.db.collection('posts');
  }

  async getHomeFeed(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const posts = await this.postsCollection
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const feedItems = posts.map((post) => FeedBuilder.buildPostItem(post));

      // Sort by relevance for better user experience
      const sortedItems = FeedBuilder.sortByRelevance(feedItems, userId);

      return FeedBuilder.buildFeedResponse(sortedItems, page, limit);
    } catch (error) {
      this.logger.error('Error getting home feed:', error);
      throw error;
    }
  }

  async getJourneyTimeline(journeyId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const posts = await this.postsCollection
        .find({ journeyId })
        .sort({ progressDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const feedItems = posts.map((post) => FeedBuilder.buildPostItem(post));

      return FeedBuilder.buildFeedResponse(feedItems, page, limit);
    } catch (error) {
      this.logger.error('Error getting journey timeline:', error);
      throw error;
    }
  }

  async getUserFeed(userId: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const posts = await this.postsCollection
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const feedItems = posts.map((post) => FeedBuilder.buildPostItem(post));

      return FeedBuilder.buildFeedResponse(feedItems, page, limit);
    } catch (error) {
      this.logger.error('Error getting user feed:', error);
      throw error;
    }
  }

  async getHashtagFeed(hashtag: string, page: number = 1, limit: number = 20) {
    try {
      const skip = (page - 1) * limit;

      const posts = await this.postsCollection
        .find({ hashtags: hashtag })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const feedItems = posts.map((post) => FeedBuilder.buildPostItem(post));

      return FeedBuilder.buildFeedResponse(feedItems, page, limit);
    } catch (error) {
      this.logger.error('Error getting hashtag feed:', error);
      throw error;
    }
  }

  async getFollowingFeed(
    userId: string,
    followingIds: string[],
    page: number = 1,
    limit: number = 20,
  ) {
    try {
      const skip = (page - 1) * limit;

      const posts = await this.postsCollection
        .find({ userId: { $in: followingIds } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      const feedItems = posts.map((post) => FeedBuilder.buildPostItem(post));

      return FeedBuilder.buildFeedResponse(feedItems, page, limit);
    } catch (error) {
      this.logger.error('Error getting following feed:', error);
      throw error;
    }
  }
}

export default FeedService;
