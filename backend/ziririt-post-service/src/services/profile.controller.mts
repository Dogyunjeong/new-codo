import { ProfileController } from '@base/shared-api-controllers';

// Create profile service controller for cross-service communication
export const profileServiceController = new ProfileController({
  baseURL: process.env.PROFILE_SERVICE_URL || 'http://localhost:4102'
});

// Export methods for use in post service
export const {
  getUserProfile,
  getUserGoals,
  getGoal,
  getFollowers,
  getFollowing,
  getRelationship
} = profileServiceController;