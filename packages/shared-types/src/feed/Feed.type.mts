import type { User } from '../auth/User.type.mjs';
import type { Goal } from '../goals/Goal.type.mjs';
import type { Post } from '../post/ProgressPost.type.mjs';
import type { Inspiration, TrendingChain } from '../inspirations/Inspiration.type.mjs';
import type { SocialStats } from '../post/PostBasic.type.mjs';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  content: Post | Inspiration | Goal;
  user: User;
  timestamp: Date;
  socialStats: SocialStats;
  isLikedByUser?: boolean;
  isFollowedByUser?: boolean;
}

export interface Feed {
  items: FeedItem[];
  hasMore: boolean;
  nextCursor?: string;
  totalCount: number;
}

export interface FeedRequest {
  userId: string;
  cursor?: string;
  limit?: number;
  type?: FeedItemType;
}

export interface DiscoverContent {
  trendingGoals: Goal[];
  trendingPosts: Post[];
  trendingChains: TrendingChain[];
  suggestedUsers: User[];
  featuredContent: FeedItem[];
}

export interface SearchRequest {
  query: string;
  type?: SearchType;
  userId?: string;
  cursor?: string;
  limit?: number;
}

export interface SearchResults {
  users: User[];
  goals: Goal[];
  posts: Post[];
  inspirations: Inspiration[];
  hasMore: boolean;
  nextCursor?: string;
}

export enum FeedItemType {
  POST = 'post',
  INSPIRATION = 'inspiration',
  GOAL = 'goal',
  MILESTONE = 'milestone',
}

export enum SearchType {
  ALL = 'all',
  USERS = 'users',
  GOALS = 'goals',
  POSTS = 'posts',
  INSPIRATIONS = 'inspirations',
}
