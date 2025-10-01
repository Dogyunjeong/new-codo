export interface FeedItem {
  id: string;
  type: 'post' | 'milestone' | 'achievement';
  content: any;
  user: {
    id: string;
    username?: string;
    profileImage?: string;
  };
  timestamp: Date;
  socialStats: {
    likesCount: number;
    commentsCount: number;
    sharesCount?: number;
  };
  metadata?: {
    journeyId?: string;
    journeyTitle?: string;
    progressPercentage?: number;
    milestone?: {
      title: string;
      description: string;
    };
  };
}

export class FeedBuilder {
  static buildPostItem(post: any): FeedItem {
    return {
      id: post.id || post._id?.toString(),
      type: post.isMilestone ? 'milestone' : 'post',
      content: {
        id: post.id || post._id?.toString(),
        userId: post.userId,
        journeyId: post.journeyId,
        content: post.content,
        mediaFiles: post.mediaFiles || [],
        hashtags: post.hashtags || [],
        isMilestone: post.isMilestone || false,
        progressDate: post.progressDate,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
      user: {
        id: post.userId,
        username: post.username,
        profileImage: post.userProfileImage,
      },
      timestamp: post.createdAt,
      socialStats: {
        likesCount: post.likesCount || 0,
        commentsCount: post.commentsCount || 0,
        sharesCount: post.sharesCount || 0,
      },
      metadata: post.journeyId ? {
        journeyId: post.journeyId,
        journeyTitle: (post as any).journeyTitle || (post as any).goalTitle,
        progressPercentage: post.progressPercentage,
        milestone: post.isMilestone ? {
          title: post.milestoneTitle,
          description: post.milestoneDescription,
        } : undefined,
      } : undefined,
    };
  }

  static buildFeedResponse(items: FeedItem[], page: number, limit: number) {
    return {
      items,
      page,
      hasMore: items.length === limit,
      totalItems: items.length,
    };
  }

  static sortByRelevance(items: FeedItem[], userId?: string): FeedItem[] {
    return items.sort((a, b) => {
      // Priority 1: User's own posts
      if (userId) {
        if (a.user.id === userId && b.user.id !== userId) return -1;
        if (a.user.id !== userId && b.user.id === userId) return 1;
      }

      // Priority 2: Milestones
      if (a.type === 'milestone' && b.type !== 'milestone') return -1;
      if (a.type !== 'milestone' && b.type === 'milestone') return 1;

      // Priority 3: Engagement score
      const aScore = (a.socialStats.likesCount * 2) + a.socialStats.commentsCount;
      const bScore = (b.socialStats.likesCount * 2) + b.socialStats.commentsCount;
      if (aScore !== bScore) return bScore - aScore;

      // Priority 4: Recency
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }

  static filterByTimeRange(items: FeedItem[], startDate: Date, endDate: Date): FeedItem[] {
    return items.filter(item => {
      const timestamp = item.timestamp.getTime();
      return timestamp >= startDate.getTime() && timestamp <= endDate.getTime();
    });
  }
}
