import { PostController } from '@base/shared-api-controllers';
import { Post, Goal, CreatePostData } from './post/types';
import { getBackendConfig } from '../config/firebase.config';
import { AuthService } from './AuthService';
import { ProfileService } from './ProfileService';
import { createPost as createPostOp } from './post/createPost.service';
import { getPosts as getPostsOp, getPostById as getPostByIdOp } from './post/readPost.service';
import { updatePost as updatePostOp, likePost as likePostOp } from './post/updatePost.service';
import { deletePost as deletePostOp } from './post/deletePost.service';

export class PostService {
  private static instance: PostService;
  private postController: PostController;
  private authService: AuthService;
  private profileService: ProfileService;

  private constructor() {
    const backend = getBackendConfig();
    this.postController = new PostController({ baseURL: backend.postServiceUrl });
    this.authService = AuthService.getInstance();
    this.profileService = ProfileService.getInstance();
  }

  static getInstance(): PostService {
    if (!PostService.instance) {
      PostService.instance = new PostService();
    }
    return PostService.instance;
  }

  async createPost(postData: CreatePostData): Promise<Post> {
    return createPostOp(postData, { controller: this.postController, auth: this.authService });
  }

  async getPosts(userId?: string): Promise<Post[]> {
    return getPostsOp(userId, { controller: this.postController, auth: this.authService });
  }

  async getPostById(postId: string): Promise<Post | undefined> {
    return getPostByIdOp(postId, { controller: this.postController });
  }

  async updatePost(postId: string, updates: Partial<Post>): Promise<Post> {
    return updatePostOp(postId, updates, { controller: this.postController, auth: this.authService });
  }

  async deletePost(postId: string): Promise<boolean> {
    return deletePostOp(postId, { controller: this.postController, auth: this.authService });
  }

  async likePost(postId: string): Promise<Post> {
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    return likePostOp(postId, { controller: this.postController, auth: this.authService });
  }

  async getGoals(userId?: string): Promise<Goal[]> {
    return this.profileService.getUserGoals(userId);
  }

  async getUserGoals(): Promise<Goal[]> {
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser) {
      return [];
    }
    return this.profileService.getUserGoals(currentUser.userId);
  }

  async createGoal(goalData: Partial<Goal>): Promise<Goal> {
    return this.profileService.createGoal({
      title: goalData.title || 'New Journey',
      description: goalData.description,
      isPrivate: goalData.isPrivate || false,
    });
  }

  async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal> {
    return this.profileService.updateGoal(goalId, {
      title: updates.title,
      description: updates.description,
      isPrivate: updates.isPrivate,
    });
  }

  async deleteGoal(goalId: string): Promise<boolean> {
    return this.profileService.deleteGoal(goalId);
  }

  setAccessToken(token: string): void {
    this.postController.setAccessToken(token);
  }
}
