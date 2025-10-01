import { PostController } from '@base/shared-api-controllers';
import { Post, Journey, CreatePostData } from './post/types';
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
}
