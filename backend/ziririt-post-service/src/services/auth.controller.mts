import { AuthController } from '@base/shared-api-controllers';

// Create auth service controller for cross-service communication
export const authServiceController = new AuthController({
  baseURL: process.env.AUTH_SERVICE_URL || 'http://localhost:4101'
});

// Export methods for use in post service
export const {
  verifyToken,
  getCurrentUser,
  healthCheck: authHealthCheck
} = authServiceController;