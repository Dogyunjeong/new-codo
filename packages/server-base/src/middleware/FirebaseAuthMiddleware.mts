import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthController } from '@base/shared-api-controllers';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    userId: string;
    email?: string;
    emailVerified?: boolean;
    name?: string;
    provider?: string;
    firebaseUid: string;
  };
}

interface TokenVerificationResult {
  valid: boolean;
  user: {
    id?: string;
    userId?: string;
    email?: string;
    displayName?: string;
    name?: string;
    emailVerified?: boolean;
    isVerified?: boolean;
    provider?: string;
    firebaseUid?: string;
    firebase_uid?: string;
  };
}

/**
 * Create Firebase authentication middleware
 * @param authServiceUrl URL of the auth service
 * @returns Fastify preHandler hook
 */
export function createFirebaseAuthMiddleware(authServiceUrl: string) {
  const authController = new AuthController({ baseURL: authServiceUrl });

  return async function authenticateFirebaseToken(
    request: AuthenticatedRequest,
    reply: FastifyReply
  ) {
    try {
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Missing or invalid authorization header'
        });
      }

      const token = authHeader.substring(7);

      if (!token) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'No token provided'
        });
      }

      // Set the token for the auth controller
      authController.setAccessToken(token);

      // Verify token with auth service
      const verificationResult = await authController.verifyToken() as TokenVerificationResult;

      if (!verificationResult || !verificationResult.user) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Invalid token'
        });
      }

      const userData = verificationResult.user;
      const userId = userData.id || userData.userId;

      if (!userId) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Invalid user data in token'
        });
      }
      const firebaseUid = userData.firebaseUid || userData.firebase_uid || userId;

      // Attach user to request
      const authenticatedUser = {
        userId,
        email: userData.email,
        emailVerified: userData.emailVerified ?? userData.isVerified,
        name: userData.displayName || userData.name,
        provider: userData.provider,
        firebaseUid,
      };
      request.user = authenticatedUser;

      // Log successful authentication
      request.log.info({
        userId: authenticatedUser.userId,
        email: authenticatedUser.email
      }, 'User authenticated successfully');

    } catch (error: any) {
      // Log full error details for debugging
      request.log.error({
        error: error.message || String(error),
        errorDetails: error.response?.data || error,
        errorStack: error.stack
      }, 'Authentication failed');

      // Check for specific error messages
      const errorMessage = error.message || error.response?.data?.message || String(error);

      if (errorMessage?.includes('expired')) {
        return reply.code(401).send({
          error: 'TokenExpired',
          message: 'Token has expired. Please sign in again.'
        });
      }

      if (errorMessage?.includes('revoked')) {
        return reply.code(401).send({
          error: 'TokenRevoked',
          message: 'Token has been revoked. Please sign in again.'
        });
      }

      return reply.code(401).send({
        error: 'Unauthorized',
        message: errorMessage || 'Authentication failed'
      });
    }
  };
}

/**
 * Extract user ID from authenticated request
 * @param request Authenticated request
 * @returns User ID or throws error
 */
export function getUserIdFromRequest(request: AuthenticatedRequest): string {
  if (!request.user?.userId) {
    throw new Error('User not authenticated');
  }
  return request.user.userId;
}

/**
 * Extract Firebase UID from authenticated request
 * @param request Authenticated request
 * @returns Firebase UID or throws error
 */
export function getFirebaseUidFromRequest(request: AuthenticatedRequest): string {
  if (!request.user?.firebaseUid) {
    throw new Error('Firebase UID not available');
  }
  return request.user.firebaseUid;
}
