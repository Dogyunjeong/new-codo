import ProfileController from '@base/shared-api-controllers/src/Profile.controller.mts';
import { Journey, CreateJourneyRequest as CreateGoalRequest, UpdateJourneyRequest as UpdateGoalRequest } from '@base/shared-types';
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

  async getUserJourneys(userId?: string): Promise<Journey[]> {
    try {
      const targetUserId = userId || (await this.authService.getCurrentUser())?.userId;
      if (!targetUserId) {
        console.warn('No user ID available for fetching journeys');
        return [];
      }

      const token = await this.authService.getAccessToken();
      if (token) {
        this.profileController.setAccessToken(token);
      }

      const response = (await this.profileController.getUserJourneys(targetUserId)) as any;
      const goals = Array.isArray(response) ? response : (response?.journeys || response?.goals);
      return (goals as Journey[]) || [];
    } catch (error) {
      console.error('Failed to fetch user journeys:', error);
      return [];
    }
  }

  async createJourney(goalData: CreateGoalRequest): Promise<Journey> {
    const currentUser = await this.authService.getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const token = await this.authService.getAccessToken();
    if (token) {
      this.profileController.setAccessToken(token);
    }

    try {
      const response = (await this.profileController.createJourney({
        ...goalData,
        userId: currentUser.userId,
      })) as any;
      return (response?.journey as Journey) || (response?.goal as Journey);
    } catch (error) {
      console.error('Failed to create journey:', error);
      throw error;
    }
  }

  async updateJourney(goalId: string, updates: UpdateGoalRequest): Promise<Journey> {
    const token = await this.authService.getAccessToken();
    if (token) {
      this.profileController.setAccessToken(token);
    }

    try {
      const response = (await this.profileController.updateJourney(goalId, updates)) as any;
      return (response?.journey as Journey) || (response?.goal as Journey);
    } catch (error) {
      console.error('Failed to update journey:', error);
      throw error;
    }
  }

  async deleteJourney(goalId: string): Promise<boolean> {
    const token = await this.authService.getAccessToken();
    if (token) {
      this.profileController.setAccessToken(token);
    }

    try {
      await this.profileController.deleteJourney(goalId);
      return true;
    } catch (error) {
      console.error('Failed to delete journey:', error);
      return false;
    }
  }

  async getJourney(goalId: string): Promise<Journey | null> {
    const token = await this.authService.getAccessToken();
    if (token) {
      this.profileController.setAccessToken(token);
    }

    try {
      const response = (await this.profileController.getJourney(goalId)) as any;
      return ((response?.journey as Journey) || (response?.goal as Journey)) || null;
    } catch (error) {
      console.error('Failed to fetch journey:', error);
      return null;
    }
  }

  setAccessToken(token: string): void {
    this.profileController.setAccessToken(token);
  }
}
