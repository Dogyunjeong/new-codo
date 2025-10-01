import type { Post } from '../post/PostBasic.type.mts';

export interface JourneyBase {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Journey extends JourneyBase {
  isPrivate: boolean;
}

export interface JourneyCreate extends Omit<Journey, 'id' | 'createdAt' | 'updatedAt'> {}

export interface JourneyWithProgress extends Journey {
  totalPosts: number;
  recentPosts: Post[];
}

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
