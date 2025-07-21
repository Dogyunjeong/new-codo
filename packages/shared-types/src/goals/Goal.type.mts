import type { Post } from '../post/PostBasic.type.mjs';

export interface GoalBase {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal extends GoalBase {
  isPrivate: boolean;
}

export interface GoalCreate extends Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> {}

export interface GoalWithProgress extends Goal {
  totalPosts: number;
  recentPosts: Post[];
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  isPrivate?: boolean;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  isPrivate?: boolean;
}
