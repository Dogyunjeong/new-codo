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
      const verificationResult = await authController.verifyToken();
      
      if (!verificationResult || !verificationResult.user) {
        return reply.code(401).send({ 
          error: 'Unauthorized',
          message: 'Invalid token' 
        });
      }

      // Attach user to request
      request.user = {
        userId: verificationResult.user.id || verificationResult.user.userId,
        email: verificationResult.user.email,
        emailVerified: verificationResult.user.emailVerified,
        name: verificationResult.user.displayName || verificationResult.user.name,
        provider: verificationResult.user.provider,
        firebaseUid: verificationResult.user.firebaseUid || verificationResult.user.firebase_uid,
      };

      // Log successful authentication
      request.log.info({ 
        userId: request.user.userId,
        email: request.user.email 
      }, 'User authenticated successfully');

    } catch (error: any) {
      request.log.error({ error: error.message }, 'Authentication failed');
      
      if (error.message?.includes('expired')) {
        return reply.code(401).send({ 
          error: 'TokenExpired',
          message: 'Token has expired. Please sign in again.' 
        });
      }
      
      if (error.message?.includes('revoked')) {
        return reply.code(401).send({ 
          error: 'TokenRevoked',
          message: 'Token has been revoked. Please sign in again.' 
        });
      }
      
      return reply.code(401).send({ 
        error: 'Unauthorized',
        message: 'Authentication failed' 
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