import { FastifyRequest, FastifyReply } from 'fastify';
import { createFirebaseAuthMiddleware, AuthenticatedRequest, getBaseEnvironment } from '@base/server-base';

// Get auth middleware instance
const env = getBaseEnvironment();
const authServiceUrl = env.AUTH_SERVICE_URL || 'http://ziririt-auth-service:4101';
const firebaseAuthMiddleware = createFirebaseAuthMiddleware(authServiceUrl) as any;

console.log('Auth middleware initialized with URL:', authServiceUrl);

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // Use the Firebase auth middleware
  await firebaseAuthMiddleware(request as AuthenticatedRequest, reply);

  // If authentication was successful, copy userId for backward compatibility
  const authenticatedUser = (request as AuthenticatedRequest).user;
  if (authenticatedUser?.userId) {
    (request as any).userId = authenticatedUser.userId;
  }
}
