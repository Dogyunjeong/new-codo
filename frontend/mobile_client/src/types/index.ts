export interface User {
  id: string
  username: string
  email: string
  displayName: string
  bio?: string
  avatarUrl?: string
  followersCount: number
  followingCount: number
  postsCount: number
  journeysCount: number
  isFollowing?: boolean
  createdAt: string
  updatedAt: string
}

export interface Post {
  id: string
  userId: string
  user: User
  content: string
  mediaUrls?: string[]
  likesCount: number
  commentsCount: number
  sharesCount: number
  isLiked?: boolean
  isBookmarked?: boolean
  journeyId?: string
  journey?: Journey
  stepNumber?: number
  createdAt: string
  updatedAt: string
}

export interface Journey {
  id: string
  userId: string
  user: User
  title: string
  description: string
  targetDate?: string
  progress: number
  totalSteps: number
  completedSteps: number
  category: string
  visibility: 'public' | 'private' | 'followers'
  isCompleted: boolean
  coverImageUrl?: string
  participants?: User[]
  milestones?: Milestone[]
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  journeyId: string
  title: string
  description?: string
  targetDate?: string
  isCompleted: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface Step {
  id: string
  journeyId: string
  userId: string
  title: string
  description: string
  mediaUrls?: string[]
  stepNumber: number
  isCompleted: boolean
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  postId: string
  userId: string
  user: User
  content: string
  likesCount: number
  isLiked?: boolean
  parentId?: string
  replies?: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: 'like' | 'comment' | 'follow' | 'journey_invite' | 'milestone_achieved' | 'mention'
  title: string
  message: string
  isRead: boolean
  relatedUserId?: string
  relatedUser?: User
  relatedPostId?: string
  relatedPost?: Post
  relatedJourneyId?: string
  relatedJourney?: Journey
  createdAt: string
}
