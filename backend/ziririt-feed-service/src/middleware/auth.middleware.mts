import { FastifyRequest, FastifyReply } from 'fastify';
import { createFirebaseAuthMiddleware, AuthenticatedRequest } from '@base/server-services';

// Get auth middleware instance
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4101';
const firebaseAuthMiddleware = createFirebaseAuthMiddleware(authServiceUrl);

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // Use the Firebase auth middleware
  await firebaseAuthMiddleware(request as AuthenticatedRequest, reply);
  
  // If authentication was successful, copy userId for backward compatibility
  if ((request as AuthenticatedRequest).user?.userId) {
    (request as any).userId = (request as AuthenticatedRequest).user.userId;
  }
}