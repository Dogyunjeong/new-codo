import type { User } from '../auth/User.type.mts';
import type { Post } from '../post/ProgressPost.type.mts';

export interface Inspiration {
  id: string;
  userId: string;
  originalPostId: string;
  parentInspirationId?: string;
  inspirationText?: string;
  chainDepth: number;
  createdAt: Date;
}

export interface InspirationWithDetails extends Inspiration {
  user: User;
  originalPost: Post;
  parentInspiration?: Inspiration;
  childInspirationsCount: number;
}

export interface InspirationChain {
  rootInspiration: Inspiration;
  chainNodes: InspirationNode[];
  totalDepth: number;
  totalParticipants: number;
}

export interface InspirationNode {
  inspiration: Inspiration;
  user: User;
  depth: number;
  children: InspirationNode[];
  isLeaf: boolean;
}

export interface CreateInspirationRequest {
  originalPostId: string;
  parentInspirationId?: string;
  inspirationText?: string;
}

export interface TrendingChain {
  rootInspiration: Inspiration;
  totalNodes: number;
  maxDepth: number;
  recentActivity: Date;
  participantCount: number;
  engagementScore: number;
}