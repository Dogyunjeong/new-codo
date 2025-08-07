import type { GoalBase } from '../goals/Goal.type.mts';
import type { Inspiration } from '../inspirations/Inspiration.type.mts';
import type { Post, User, UploadedMediaFile } from './PostBasic.type.mts';

export interface ProgressPost extends Post {
  goalId: string;
  isMilestone: boolean;
  // Inspiration chain tracking
  rootInspirationId?: string;  // ID of the root inspiration if this is inspired
  inspirationChainDepth?: number;  // Depth in inspiration chain (0 for original)
}

export interface ProgressPostWithDetails extends ProgressPost {
  user: User;
  goal: GoalBase;
  // Inspiration chain details
  rootInspiration?: Inspiration;
  inspiredFromPost?: ProgressPost;
  inspirations?: Inspiration[];
}

export interface CreateProgressPostRequest {
  goalId: string;
  content: string;
  mediaFiles?: UploadedMediaFile[];
  hashtags?: string[];
  isMilestone?: boolean;
  // For inspired posts
  inspiredFromPostId?: string;
  rootInspirationId?: string;
}

export interface UpdateProgressPostRequest {
  content?: string;
  mediaFiles?: UploadedMediaFile[];
  hashtags?: string[];
  isMilestone?: boolean;
}

export interface MediaFile {
  id: string;
  url: string;
  type: MediaType;
  size: number;
  filename: string;
  createdAt: Date;
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video'
}

// Re-export for backward compatibility
export interface PostWithDetails extends ProgressPostWithDetails {}
export interface CreatePostRequest extends CreateProgressPostRequest {}
export interface UpdatePostRequest extends UpdateProgressPostRequest {}