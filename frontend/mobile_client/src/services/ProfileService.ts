import ProfileController from '@base/shared-api-controllers/src/Profile.controller.mts';
import { Goal, CreateGoalRequest, UpdateGoalRequest } from '@base/shared-types';
import { getBackendConfig } from '../config/firebase.config';
import { AuthService } from './AuthService';

export class ProfileService {
  private static instance: ProfileService;
  private profileController: ProfileController;
  private authService: AuthService;

  private constructor() {
    const backend = getBackendConfig();
    // Use API Gateway URL which routes to profile service
    const baseURL = backend.profileServiceUrl || backend.authServiceUrl || 'http://localhost:8080';
    this.profileController = new ProfileController({ 
      baseURL: baseURL
    });
    this.authService = AuthService.getInstance();
  }

  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  async getUserGoals(userId?: string): Promise<Goal[]> {
    try {
      const targetUserId = userId || (await this.authService.getCurrentUser())?.userId;
      if (!targetUserId) {
        console.warn('No user ID available for fetching goals');
        return [];
      }

      const token = await this.authService.getAccessToken();
      if (token) {
        this.profileController.setAccessToken(token);
      }

      const goals = await this.profileController.getUserGoals(targetUserId) as Goal[];
      return goals || [];
    } catch (error) {
      console.error('Failed to fetch user goals:', error);
      return [];
    }
  }

  async createGoal(goalData: CreateGoalRequest): Promise<Goal> {
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const token = await this.authService.getAccessToken();
    if (token) {
      this.profileController.setAccessToken(token);
    }

    try {
      const goal = await this.profileController.createGoal({
        ...goalData,
        userId: currentUser.userId,
      }) as Goal;
      return goal;
    } catch (error) {
      console.error('Failed to create goal:', error);
      throw error;
    }
  }

  async updateGoal(goalId: string, updates: UpdateGoalRequest): Promise<Goal> {
    const token = await this.authService.getAccessToken();
    if (token) {
      this.profileController.setAccessToken(token);
    }

    try {
      const goal = await this.profileController.updateGoal(goalId, updates) as Goal;
      return goal;
    } catch (error) {
      console.error('Failed to update goal:', error);
      throw error;
    }
  }

  async deleteGoal(goalId: string): Promise<boolean> {
    const token = await this.authService.getAccessToken();
    if (token) {
      this.profileController.setAccessToken(token);
    }

    try {
      await this.profileController.deleteGoal(goalId);
      return true;
    } catch (error) {
      console.error('Failed to delete goal:', error);
      return false;
    }
  }

  async getGoal(goalId: string): Promise<Goal | null> {
    const token = await this.authService.getAccessToken();
    if (token) {
      this.profileController.setAccessToken(token);
    }

    try {
      const goal = await this.profileController.getGoal(goalId) as Goal;
      return goal;
    } catch (error) {
      console.error('Failed to fetch goal:', error);
      return null;
    }
  }

  setAccessToken(token: string): void {
    this.profileController.setAccessToken(token);
  }
}