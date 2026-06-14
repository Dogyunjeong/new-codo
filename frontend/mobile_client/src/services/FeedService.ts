/**
 * FeedService - Service for feed-related operations
 *
 * Uses ApiClientManager's shared FeedController to ensure
 * auth handlers are properly configured.
 */

import { ApiClientManager } from './api/ApiClientManager';
import { Post } from './post/types';

export class FeedService {
  private static instance: FeedService;
  private apiClientManager: ApiClientManager;

  private constructor() {
    this.apiClientManager = ApiClientManager.getInstance();
  }

  static getInstance(): FeedService {
    if (!FeedService.instance) {
      FeedService.instance = new FeedService();
    }
    return FeedService.instance;
  }

  private get feedController() {
    return this.apiClientManager.feedController;
  }

  async getHomeFeed(page: number = 1, limit: number = 20): Promise<Post[]> {
    try {
      const response = (await this.feedController.getHomeFeed(page, limit)) as any;

      // Handle response structure from backend
      if (response && (response.posts || response.items)) {
        return (response.posts || response.items) as Post[];
      }

      if (Array.isArray(response)) {
        return response as Post[];
      }

      return [];
    } catch (error: any) {
      console.error('[FeedService] Failed to fetch home feed:', error);
      throw error;
    }
  }

  async getJourneyTimeline(goalId: string, page: number = 1, limit: number = 20): Promise<Post[]> {
    try {
      const response = (await this.feedController.getJourneyTimeline(goalId, page, limit)) as any;

      if (response && (response.posts || response.items)) {
        return (response.posts || response.items) as Post[];
      }

      if (Array.isArray(response)) {
        return response as Post[];
      }

      return [];
    } catch (error) {
      console.error('[FeedService] Failed to fetch journey timeline:', error);
      return [];
    }
  }

  async getUserFeed(userId: string, page: number = 1, limit: number = 20): Promise<Post[]> {
    try {
      const response = (await this.feedController.getUserFeed(userId, page, limit)) as any;

      if (response && (response.posts || response.items)) {
        return (response.posts || response.items) as Post[];
      }

      if (Array.isArray(response)) {
        return response as Post[];
      }

      return [];
    } catch (error) {
      console.error('[FeedService] Failed to fetch user feed:', error);
      return [];
    }
  }

  async getHashtagFeed(hashtag: string, page: number = 1, limit: number = 20): Promise<Post[]> {
    try {
      const response = (await this.feedController.getHashtagFeed(hashtag, page, limit)) as any;

      if (response && (response.posts || response.items)) {
        return (response.posts || response.items) as Post[];
      }

      if (Array.isArray(response)) {
        return response as Post[];
      }

      return [];
    } catch (error) {
      console.error('[FeedService] Failed to fetch hashtag feed:', error);
      return [];
    }
  }

  async refreshFeed(): Promise<void> {
    try {
      await this.feedController.refreshFeed();
    } catch (error) {
      console.error('[FeedService] Failed to refresh feed:', error);
    }
  }

  setAccessToken(token: string): void {
    this.feedController.setAccessToken(token);
  }
}
