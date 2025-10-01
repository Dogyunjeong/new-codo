export interface Profile {
  userId: string;
  bio?: string;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  stepsCount: number;
  journeysCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JourneyProfileItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPrivate: boolean;
  stepsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

// Request/Response types
export interface CreateJourneyRequest {
  title: string;
  description?: string;
  isPrivate?: boolean;
}

export interface UpdateJourneyRequest {
  title?: string;
  description?: string;
  isPrivate?: boolean;
}

export interface UpdateProfileRequest {
  bio?: string;
  isPrivate?: boolean;
}

export interface FollowResponse {
  success: boolean;
  isFollowing: boolean;
}

export interface RelationshipResponse {
  isFollowing: boolean;
  isFollowedBy: boolean;
}
