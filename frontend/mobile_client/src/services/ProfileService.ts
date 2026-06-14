/**
 * ProfileService - Service for profile and journey-related operations
 *
 * Uses ApiClientManager's shared ProfileController to ensure
 * auth handlers are properly configured.
 */

import { ApiClientManager } from './api/ApiClientManager';
import {
  Journey,
  CreateJourneyRequest as CreateGoalRequest,
  UpdateJourneyRequest as UpdateGoalRequest,
} from '@base/shared-types';
import { AuthService } from './AuthService';

export class ProfileService {
  private static instance: ProfileService;
  private apiClientManager: ApiClientManager;
  private authService: AuthService;

  private constructor() {
    this.apiClientManager = ApiClientManager.getInstance();
    this.authService = AuthService.getInstance();
  }

  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  private get profileController() {
    return this.apiClientManager.profileController;
  }

  async getUserJourneys(userId?: string): Promise<Journey[]> {
    try {
      let targetUserId = userId;

      if (!targetUserId) {
        const currentUser = await this.authService.getCurrentUser();
        targetUserId = currentUser?.userId;
      }

      if (!targetUserId) {
        console.warn('[ProfileService] No user ID available for fetching journeys');
        return [];
      }

      const response = (await this.profileController.getUserJourneys(targetUserId)) as any;
      const goals = Array.isArray(response) ? response : response?.journeys || response?.goals;
      return (goals as Journey[]) || [];
    } catch (error) {
      console.error('[ProfileService] Failed to fetch user journeys:', error);
      return [];
    }
  }

  async createJourney(goalData: CreateGoalRequest): Promise<Journey> {
    const currentUser = await this.authService.getCurrentUser();

    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    try {
      const response = (await this.profileController.createJourney({
        ...goalData,
        userId: currentUser.userId,
      })) as any;
      return (response?.journey as Journey) || (response?.goal as Journey);
    } catch (error) {
      console.error('[ProfileService] Failed to create journey:', error);
      throw error;
    }
  }

  async updateJourney(goalId: string, updates: UpdateGoalRequest): Promise<Journey> {
    try {
      const response = (await this.profileController.updateJourney(goalId, updates)) as any;
      return (response?.journey as Journey) || (response?.goal as Journey);
    } catch (error) {
      console.error('[ProfileService] Failed to update journey:', error);
      throw error;
    }
  }

  async deleteJourney(goalId: string): Promise<boolean> {
    try {
      await this.profileController.deleteJourney(goalId);
      return true;
    } catch (error) {
      console.error('[ProfileService] Failed to delete journey:', error);
      return false;
    }
  }

  async getJourney(goalId: string): Promise<Journey | null> {
    try {
      const response = (await this.profileController.getJourney(goalId)) as any;
      return (response?.journey as Journey) || (response?.goal as Journey) || null;
    } catch (error) {
      console.error('[ProfileService] Failed to fetch journey:', error);
      return null;
    }
  }

  setAccessToken(token: string): void {
    this.profileController.setAccessToken(token);
  }

  // Backward compatibility aliases
  async getUserGoals(userId?: string): Promise<Journey[]> {
    return this.getUserJourneys(userId);
  }

  async getGoal(goalId: string): Promise<Journey | null> {
    return this.getJourney(goalId);
  }

  async deleteGoal(goalId: string): Promise<boolean> {
    return this.deleteJourney(goalId);
  }
}
