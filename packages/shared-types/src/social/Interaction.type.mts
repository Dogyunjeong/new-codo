import type { User, Like, Comment, CommentWithDetails, SocialStats } from '../post/PostBasic.type.mts';

// Re-export shared types
export type { Like, Comment, CommentWithDetails, SocialStats };

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface FollowWithUser extends Follow {
  follower: User;
  following: User;
}

export interface UserRelationship {
  userId: string;
  isFollowing: boolean;
  isFollowedBy: boolean;
  followersCount: number;
  followingCount: number;
}

// Extended social stats with follow counts
export interface ExtendedSocialStats extends SocialStats {
  followersCount: number;
  followingCount: number;
}