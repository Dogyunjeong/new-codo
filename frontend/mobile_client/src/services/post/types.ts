export interface PostUser {
  id: string;
  name: string;
  avatar: string;
  meta?: string;
}

export interface PostCategory {
  label: string;
  color: string;
}

export interface PostTag {
  label: string;
  type: 'category' | 'hashtag';
}

export interface PostMedia {
  image?: string;
  video?: string;
  caption?: string;
}

export interface PostEngagement {
  likes: number;
  comments: number;
  relates: number;
  isLiked: boolean;
}

export interface InspiredBy {
  user: string;
  avatar: string;
}

export interface Journey {
  id: string;
  userId: string;
  title: string;
  description?: string;
  isPrivate?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  // UI-specific fields (not from backend)
  emoji?: string;
  color?: string;
  progress?: number;
}
// Backward-compat alias (to be removed):

export interface Post {
  id: string;
  user: PostUser;
  journeyId?: string;
  categories?: PostCategory[];
  title: string;
  content: string;
  steps?: string;
  media?: PostMedia;
  tags?: PostTag[];
  engagement: PostEngagement;
  inspiredBy?: InspiredBy;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostData {
  journeyId: string;
  title: string;
  content: string;
  media?: PostMedia;
  tags?: string[];
}
