import type { UploadedMediaFile } from '../shared/File.type.mts';

// Base Post type for all post-like content
export interface PostBase {
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  mediaFiles?: UploadedMediaFile[];
  hashtags?: string[];
}

// Post with ID
export interface Post extends PostBase {
  id: string;
}

// Basic Post type with goalId for progress posts (avoid circular imports)
export interface PostBasic extends PostBase {
  goalId: string;
  isMilestone: boolean;
}

// Like interface for any post-like content
export interface Like {
  id: string;
  userId: string;
  postId: string;  // Can be progress post or comment
  postType: PostType;  // To distinguish between post types
  createdAt: Date;
}

// Comment interface for any post-like content
export interface Comment extends Post {
  postId: string;  // ID of the post this comment belongs to
  postType: PostType;  // Type of post being commented on
  parentCommentId?: string;  // For nested comments/replies
}

export interface CommentWithDetails extends Comment {
  user: User;
  likesCount: number;
  repliesCount: number;
  isLikedByUser?: boolean;
  replies?: Comment[];
}

// Social stats for any post-like content
export interface SocialStats {
  likesCount: number;
  commentsCount: number;
  inspirationsCount?: number;  // Only for progress posts
}

// Basic request interfaces
export interface CreatePostRequest {
  content: string;
  mediaFiles?: UploadedMediaFile[];
  hashtags?: string[];
}

export interface UpdatePostRequest {
  id: string;
  content?: string;
  mediaFiles?: UploadedMediaFile[];
  hashtags?: string[];
}

// Comment request interfaces
export interface CreateCommentRequest {
  postId: string;
  postType: PostType;
  content: string;
  mediaFiles?: UploadedMediaFile[];
  hashtags?: string[];
  parentCommentId?: string;  // For replies
}

export interface UpdateCommentRequest {
  content?: string;
  hashtags?: string[];
}

// Enums
export enum PostType {
  PROGRESS_POST = 'progress_post',
  COMMENT = 'comment'
}

// Basic User type to avoid circular imports
export interface User {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}