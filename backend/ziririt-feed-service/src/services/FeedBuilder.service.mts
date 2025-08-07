import { MongoClient, Db, Collection } from 'mongodb';
import { FeedItem, FeedItemType, Post, User, SocialStats } from '@base/shared-types';

interface PostDocument {
  _id: any;
  id: string;
  userId: string;
  goalId: string;
  content: string;
  mediaFiles?: Array<{
    id: string;
    url: string;
    type: 'image' | 'video';
    thumbnailUrl?: string;
  }>;
  hashtags?: string[];
  isMilestone: boolean;
  progressDate: Date;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  commentsCount: number;
}

export class FeedBuilderService {
  private db: Db;
  private postsCollection: Collection<PostDocument>;

  constructor(mongoClient: MongoClient) {
    this.db = mongoClient.db('ziririt_posts');
    this.postsCollection = this.db.collection<PostDocument>('posts');
  }

  async buildHomeFeed(
    userId: string, 
    followingIds: string[], 
    page: number = 1, 
    limit: number = 20
  ): Promise<FeedItem[]> {
    const skip = (page - 1) * limit;

    // Include own posts and posts from following users
    const userIds = [userId, ...followingIds];

    const posts = await this.postsCollection
      .find({ 
        userId: { $in: userIds },
        // Could add additional filters here (e.g., not private goals)
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return this.transformToFeedItems(posts);
  }

  async buildGoalTimelineFeed(
    goalId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<FeedItem[]> {
    const skip = (page - 1) * limit;

    const posts = await this.postsCollection
      .find({ goalId })
      .sort({ progressDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return this.transformToFeedItems(posts);
  }

  async buildUserFeed(
    userId: string,
    viewerId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<FeedItem[]> {
    const skip = (page - 1) * limit;

    // In the future, we might filter based on privacy settings
    const posts = await this.postsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return this.transformToFeedItems(posts);
  }

  async buildHashtagFeed(
    hashtag: string,
    page: number = 1,
    limit: number = 20
  ): Promise<FeedItem[]> {
    const skip = (page - 1) * limit;

    const posts = await this.postsCollection
      .find({ hashtags: hashtag })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return this.transformToFeedItems(posts);
  }

  private transformToFeedItems(posts: PostDocument[]): FeedItem[] {
    return posts.map(post => ({
      id: post.id,
      type: FeedItemType.POST,
      content: {
        id: post.id,
        userId: post.userId,
        goalId: post.goalId,
        content: post.content,
        mediaFiles: post.mediaFiles || [],
        hashtags: post.hashtags || [],
        isMilestone: post.isMilestone,
        progressDate: post.progressDate,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
      } as Post,
      user: {} as User, // Will be populated by enriching service calls
      timestamp: post.createdAt,
      socialStats: {
        likesCount: post.likesCount,
        commentsCount: post.commentsCount,
        sharesCount: 0,
      } as SocialStats,
      isLikedByUser: false, // Will be populated based on viewer
      isFollowedByUser: false, // Will be populated based on viewer
    }));
  }

  private calculateEngagementScore(post: PostDocument): number {
    // Simple engagement score calculation
    // Can be enhanced with more sophisticated algorithms
    const likeWeight = 1;
    const commentWeight = 2;
    const recencyBoost = this.getRecencyBoost(post.createdAt);
    
    return (
      post.likesCount * likeWeight + 
      post.commentsCount * commentWeight
    ) * recencyBoost;
  }

  private getRecencyBoost(createdAt: Date): number {
    const hoursSincePost = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursSincePost < 1) return 2;      // Very recent
    if (hoursSincePost < 6) return 1.5;    // Today
    if (hoursSincePost < 24) return 1.2;   // Yesterday
    if (hoursSincePost < 168) return 1;    // This week
    return 0.8;                            // Older
  }
}