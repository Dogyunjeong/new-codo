/**
 * Examples of using shared-api-controllers in backend services
 * This file demonstrates how to integrate the controllers in your services
 */

import { AuthController, ProfileController, PostController } from '@base/shared-api-controllers';

// Example 1: Initialize controllers with service URLs
const authController = new AuthController({
  baseURL: 'http://localhost:4101'
});

const profileController = new ProfileController({
  baseURL: 'http://localhost:4102'
});

const postController = new PostController({
  baseURL: 'http://localhost:4103'
});

// Example 2: Cross-service authentication verification
export async function authenticateUser(token: string): Promise<any> {
  try {
    authController.setAccessToken(token);
    const verification = await authController.verifyToken();
    return verification;
  } catch (error) {
    throw new Error('Authentication failed');
  }
}

// Example 3: Getting user profile with relationships
export async function getUserWithRelationships(userId: string): Promise<any> {
  try {
    const [profile, goals, followers, following] = await Promise.all([
      profileController.getUserProfile(userId),
      profileController.getUserGoals(userId),
      profileController.getFollowers(userId),
      profileController.getFollowing(userId)
    ]);

    return {
      profile,
      goals,
      social: {
        followers,
        following
      }
    };
  } catch (error) {
    throw new Error(`Failed to get user data: ${error.message}`);
  }
}

// Example 4: Creating a post with validation
export async function createPostWithValidation(
  userId: string,
  goalId: string,
  postData: any,
  authToken: string
): Promise<any> {
  try {
    // 1. Verify authentication
    authController.setAccessToken(authToken);
    await authController.verifyToken();

    // 2. Validate goal exists and belongs to user
    const goal = await profileController.getGoal(goalId);
    if (!goal || goal.userId !== userId) {
      throw new Error('Invalid goal or access denied');
    }

    // 3. Create the post
    const post = await postController.createPost({
      ...postData,
      userId,
      goalId
    });

    return post;
  } catch (error) {
    throw new Error(`Failed to create post: ${error.message}`);
  }
}

// Example 5: Health check for all services
export async function checkAllServicesHealth(): Promise<{
  auth: boolean;
  profile: boolean;
  post: boolean;
}> {
  const healthChecks = await Promise.allSettled([
    authController.healthCheck(),
    profileController.healthCheck(),  
    postController.healthCheck()
  ]);

  return {
    auth: healthChecks[0].status === 'fulfilled',
    profile: healthChecks[1].status === 'fulfilled',
    post: healthChecks[2].status === 'fulfilled'
  };
}

// Example 6: OAuth authentication flow
export async function authenticateWithGoogle(idToken: string): Promise<any> {
  try {
    const authResult = await authController.googleAuth({
      idToken,
      deviceId: 'web-client',
      userAgent: 'Ziririt Web App'
    });

    // Set the access token for future requests
    if (authResult.accessToken) {
      authController.setAccessToken(authResult.accessToken);
      profileController.setAccessToken(authResult.accessToken);
      postController.setAccessToken(authResult.accessToken);
    }

    return authResult;
  } catch (error) {
    throw new Error(`Google authentication failed: ${error.message}`);
  }
}

// Example 7: Service configuration with environment variables
export function configureServices(): void {
  const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4101';
  const profileUrl = process.env.PROFILE_SERVICE_URL || 'http://localhost:4102';
  const postUrl = process.env.POST_SERVICE_URL || 'http://localhost:4103';

  authController.setBaseUrl(authUrl);
  profileController.setBaseUrl(profileUrl);
  postController.setBaseUrl(postUrl);
}

// Example 8: Error handling with retry logic
export async function getPostWithRetry(postId: string, maxRetries: number = 3): Promise<any> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await postController.getPost(postId);
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Failed to get post after ${maxRetries} attempts: ${lastError.message}`);
}