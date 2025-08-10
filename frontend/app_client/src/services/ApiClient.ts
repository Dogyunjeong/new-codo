import {
  AuthController,
  ProfileController,
  PostController,
  FeedController,
} from '@base/shared-controllers';
import { API_CONFIG } from '../config/api.config';

export class ApiClient {
  private authController: AuthController;
  private profileController: ProfileController;
  private postController: PostController;
  private feedController: FeedController;

  private authToken: string | null = null;

  constructor() {
    const baseConfig = API_CONFIG;

    this.authController = new AuthController({
      baseURL: baseConfig.authServiceUrl,
    });

    this.profileController = new ProfileController({
      baseURL: baseConfig.profileServiceUrl,
    });

    this.postController = new PostController({
      baseURL: baseConfig.postServiceUrl,
    });

    this.feedController = new FeedController({
      baseURL: baseConfig.feedServiceUrl,
    });
  }

  // Set auth token for all controllers
  setAuthToken(token: string) {
    this.authToken = token;
    this.authController.setAccessToken(token);
    this.profileController.setAccessToken(token);
    this.postController.setAccessToken(token);
    this.feedController.setAccessToken(token);
  }

  // Clear auth token
  clearAuthToken() {
    this.authToken = null;
    this.authController.setAccessToken('');
    this.profileController.setAccessToken('');
    this.postController.setAccessToken('');
    this.feedController.setAccessToken('');
  }

  // Auth methods
  async loginWithGoogle(code: string) {
    return await this.authController.loginWithGoogle(code);
  }

  async loginWithApple(code: string) {
    return await this.authController.loginWithApple(code);
  }

  async refreshToken() {
    return await this.authController.refreshToken();
  }

  async logout() {
    const result = await this.authController.logout();
    this.clearAuthToken();
    return result;
  }

  async getCurrentUser() {
    return await this.authController.getCurrentUser();
  }

  // Profile methods
  async getProfile(userId: string) {
    return await this.profileController.getProfile(userId);
  }

  async updateProfile(userId: string, profileData: any) {
    return await this.profileController.updateProfile(userId, profileData);
  }

  async getUserGoals(userId: string) {
    return await this.profileController.getUserGoals(userId);
  }

  async createGoal(goalData: any) {
    return await this.profileController.createGoal(goalData);
  }

  async updateGoal(goalId: string, goalData: any) {
    return await this.profileController.updateGoal(goalId, goalData);
  }

  async deleteGoal(goalId: string) {
    return await this.profileController.deleteGoal(goalId);
  }

  // Social methods
  async followUser(userId: string) {
    return await this.profileController.followUser(userId);
  }

  async unfollowUser(userId: string) {
    return await this.profileController.unfollowUser(userId);
  }

  async getFollowers(userId: string) {
    return await this.profileController.getFollowers(userId);
  }

  async getFollowing(userId: string) {
    return await this.profileController.getFollowing(userId);
  }

  // Post methods
  async createPost(postData: any) {
    return await this.postController.createPost(postData);
  }

  async getPost(postId: string) {
    return await this.postController.getPost(postId);
  }

  async updatePost(postId: string, postData: any) {
    return await this.postController.updatePost(postId, postData);
  }

  async deletePost(postId: string) {
    return await this.postController.deletePost(postId);
  }

  async getGoalPosts(goalId: string, page?: number, limit?: number) {
    return await this.postController.getGoalPosts(goalId, page, limit);
  }

  // Post interactions
  async likePost(postId: string, userId: string) {
    return await this.postController.likePost(postId, userId);
  }

  async unlikePost(postId: string, userId: string) {
    return await this.postController.unlikePost(postId, userId);
  }

  async addComment(postId: string, commentData: any) {
    return await this.postController.addComment(postId, commentData);
  }

  async getPostComments(postId: string, page?: number) {
    return await this.postController.getPostComments(postId, page);
  }

  // Media upload
  async uploadMedia(file: any) {
    return await this.postController.uploadMedia(file);
  }

  // Feed methods
  async getHomeFeed(page?: number, limit?: number) {
    return await this.feedController.getHomeFeed(page, limit);
  }

  async getGoalTimeline(goalId: string, page?: number, limit?: number) {
    return await this.feedController.getGoalTimeline(goalId, page, limit);
  }

  async refreshFeed() {
    return await this.feedController.refreshFeed();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
