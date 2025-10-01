import type { User } from '../auth/User.type.mts';
import type { Journey } from '../journeys/Journey.type.mts';
import type { Post } from '../post/ProgressPost.type.mts';
import type { Inspiration, TrendingChain } from '../inspirations/Inspiration.type.mts';
import type { SocialStats } from '../post/PostBasic.type.mts';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  content: Post | Inspiration | Journey;
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
  trendingJourneys: Journey[];
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
  journeys: Journey[];
  posts: Post[];
  inspirations: Inspiration[];
  hasMore: boolean;
  nextCursor?: string;
}

export enum FeedItemType {
  POST = 'post',
  INSPIRATION = 'inspiration',
  JOURNEY = 'journey',
  MILESTONE = 'milestone',
}

export enum SearchType {
  ALL = 'all',
  USERS = 'users',
  JOURNEYS = 'journeys',
  POSTS = 'posts',
  INSPIRATIONS = 'inspirations',
}
