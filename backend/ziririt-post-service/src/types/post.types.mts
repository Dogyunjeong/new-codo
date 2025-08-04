export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnailUrl?: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface Post {
  id: string;
  userId: string;
  goalId: string;
  content: string;
  mediaFiles?: MediaFile[];
  hashtags?: string[];
  isMilestone: boolean;
  progressDate: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Cached social stats for performance
  likesCount: number;
  commentsCount: number;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  postType: 'progress_post';
  createdAt: Date;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  postType: 'progress_post';
  content: string;
  parentCommentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response types
export interface CreatePostRequest {
  goalId: string;
  content: string;
  mediaFiles?: string[]; // Array of media file IDs
  hashtags?: string[];
  isMilestone?: boolean;
  progressDate?: string; // ISO date string
}

export interface UpdatePostRequest {
  content?: string;
  hashtags?: string[];
  isMilestone?: boolean;
  progressDate?: string;
}

export interface MediaUploadRequest {
  file: Buffer;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface MediaUploadResponse {
  mediaFile: MediaFile;
}

export interface CreateCommentRequest {
  content: string;
  parentCommentId?: string;
}

export interface PostWithUser extends Post {
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface CommentWithUser extends Comment {
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface LikeWithUser extends Like {
  user: {
    id: string;
    displayName: string;
    avatarUrl?: string;
  };
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total?: number;
    hasMore: boolean;
  };
}