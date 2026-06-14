/**
 * PostService - Service for post-related operations
 *
 * Uses ApiClientManager's shared PostController to ensure
 * auth handlers are properly configured.
 */

import { ApiClientManager } from './api/ApiClientManager';
import { Post, Journey, CreatePostData } from './post/types';
import { AuthService } from './AuthService';
import { ProfileService } from './ProfileService';

export class PostService {
  private static instance: PostService;
  private apiClientManager: ApiClientManager;
  private authService: AuthService;
  private profileService: ProfileService;

  private constructor() {
    this.apiClientManager = ApiClientManager.getInstance();
    this.authService = AuthService.getInstance();
    this.profileService = ProfileService.getInstance();
  }

  static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  private get postController() {
    return this.apiClientManager.postController;
  }

  async createPost(postData: CreatePostData): Promise<Post> {
    const currentUser = await this.authService.getCurrentUser();

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const normalizeHashtags = (tags?: string[]) =>
      (tags || [])
        .map((t) => (t.startsWith('#') ? t : `#${t}`))
        .filter((t, i, arr) => t && arr.indexOf(t) === i);

    const payload = {
      journeyId: postData.journeyId,
      content: postData.content || postData.title || '',
      hashtags: normalizeHashtags(postData.tags),
      mediaFiles: [],
      isMilestone: false,
      progressDate: new Date().toISOString(),
    };

    const response = await this.postController.createPost(payload as any);
    return ((response as any).post || response) as Post;
  }

  async getPosts(userId?: string): Promise<Post[]> {
    try {
      let targetUserId = userId;

      if (!targetUserId) {
        const currentUser = await this.authService.getCurrentUser();
        targetUserId = currentUser?.userId;
      }

      if (!targetUserId) {
        console.warn('[PostService] No user ID available for fetching posts');
        return [];
      }

      const response = (await this.postController.getUserPosts(targetUserId)) as any;
      const posts = Array.isArray(response) ? response : response?.posts || [];
      return posts as Post[];
    } catch (error) {
      console.error('[PostService] Failed to fetch posts:', error);
      return [];
    }
  }

  async getPostById(postId: string): Promise<Post | undefined> {
    try {
      const response = (await this.postController.getPost(postId)) as any;
      return (response?.post || response) as Post;
    } catch (error) {
      console.error('[PostService] Failed to fetch post:', error);
      return undefined;
    }
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<Post> {
    const response = (await this.postController.updatePost(postId, updates as any)) as any;
    return (response?.post || response) as Post;
  }

  async deletePost(postId: string): Promise<boolean> {
    try {
      await this.postController.deletePost(postId);
      return true;
    } catch (error) {
      console.error('[PostService] Failed to delete post:', error);
      return false;
    }
  }

  async likePost(postId: string): Promise<Post> {
    const currentUser = await this.authService.getCurrentUser();

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const response = (await this.postController.likePost(postId, currentUser.userId)) as any;
    return (response?.post || response) as Post;
  }

  async getJourneys(userId?: string): Promise<Journey[]> {
    return this.profileService.getUserJourneys(userId);
  }

  async getUserJourneys(): Promise<Journey[]> {
    const currentUser = await this.authService.getCurrentUser();

    if (!currentUser) {
      return [];
    }

    return this.profileService.getUserJourneys(currentUser.userId);
  }

  async createJourney(goalData: Partial<Journey>): Promise<Journey> {
    return this.profileService.createJourney({
      title: goalData.title || 'New Journey',
      description: goalData.description,
      isPrivate: goalData.isPrivate || false,
    });
  }

  async updateJourney(goalId: string, updates: Partial<Journey>): Promise<Journey> {
    return this.profileService.updateJourney(goalId, {
      title: updates.title,
      description: updates.description,
      isPrivate: updates.isPrivate,
    });
  }

  async deleteJourney(goalId: string): Promise<boolean> {
    return this.profileService.deleteJourney(goalId);
  }

  setAccessToken(token: string): void {
    this.postController.setAccessToken(token);
  }

  // Backward compatibility aliases
  async getUserGoals(userId?: string): Promise<Journey[]> {
    return this.getJourneys(userId);
  }

  async createGoal(goalData: Partial<Journey>): Promise<Journey> {
    return this.createJourney(goalData);
  }
}
