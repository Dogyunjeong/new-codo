import FeedController from '@base/shared-api-controllers/src/Feed.controller.mts';
import { getBackendConfig } from '../config/firebase.config';
import { AuthService } from './AuthService';
import { Post } from './post/types';

export class FeedService {
  private static instance: FeedService;
  private feedController: FeedController;
  private authService: AuthService;

  private constructor() {
    const backend = getBackendConfig();
    // Use Feed Service URL
    const baseURL = backend.feedServiceUrl || 'http://localhost:4104';
    this.feedController = new FeedController({ 
      baseURL: baseURL
    });
    this.authService = AuthService.getInstance();
  }

  static getInstance(): FeedService {
    if (!FeedService.instance) {
      FeedService.instance = new FeedService();
    }
    return FeedService.instance;
  }

  async getHomeFeed(page: number = 1, limit: number = 20): Promise<Post[]> {
    try {
      const token = await this.authService.getAccessToken();
      if (token) {
        this.feedController.setAccessToken(token);
      }

      const response = await this.feedController.getHomeFeed(page, limit) as any;
      
      // Handle response structure from backend
      if (response && (response.posts || response.items)) {
        return (response.posts || response.items) as Post[];
      } else if (Array.isArray(response)) {
        return response as Post[];
      }
      
      console.warn('No posts in feed response');
      return [];
    } catch (error) {
      console.error('Failed to fetch home feed:', error);
      // For now, return empty array on error
      // In production, you might want to throw the error or handle differently
      return [];
    }
  }

  async getJourneyTimeline(goalId: string, page: number = 1, limit: number = 20): Promise<Post[]> {
    try {
      const token = await this.authService.getAccessToken();
      if (token) {
        this.feedController.setAccessToken(token);
      }

      const response = await this.feedController.getJourneyTimeline(goalId, page, limit) as any;
      
      if (response && (response.posts || response.items)) {
        return (response.posts || response.items) as Post[];
      } else if (Array.isArray(response)) {
        return response as Post[];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch journey timeline:', error);
      return [];
    }
  }

  async getUserFeed(userId: string, page: number = 1, limit: number = 20): Promise<Post[]> {
    try {
      const token = await this.authService.getAccessToken();
      if (token) {
        this.feedController.setAccessToken(token);
      }

      const response = await this.feedController.getUserFeed(userId, page, limit) as any;
      
      if (response && (response.posts || response.items)) {
        return (response.posts || response.items) as Post[];
      } else if (Array.isArray(response)) {
        return response as Post[];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch user feed:', error);
      return [];
    }
  }

  async getHashtagFeed(hashtag: string, page: number = 1, limit: number = 20): Promise<Post[]> {
    try {
      const token = await this.authService.getAccessToken();
      if (token) {
        this.feedController.setAccessToken(token);
      }

      const response = await this.feedController.getHashtagFeed(hashtag, page, limit) as any;
      
      if (response && (response.posts || response.items)) {
        return (response.posts || response.items) as Post[];
      } else if (Array.isArray(response)) {
        return response as Post[];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch hashtag feed:', error);
      return [];
    }
  }

  async refreshFeed(): Promise<void> {
    try {
      const token = await this.authService.getAccessToken();
      if (token) {
        this.feedController.setAccessToken(token);
      }

      await this.feedController.refreshFeed();
    } catch (error) {
      console.error('Failed to refresh feed:', error);
    }
  }

  setAccessToken(token: string): void {
    this.feedController.setAccessToken(token);
  }
}
