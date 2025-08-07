import { FastifyRequest, FastifyReply } from 'fastify';
import { JWTService } from '@base/shared-services';

export class AuthMiddleware {
  private jwtService: JWTService;

  constructor(jwtService: JWTService) {
    this.jwtService = jwtService;
  }

  /**
   * Middleware to require authentication
   * Validates JWT token and sets user context
   */
  requireAuth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Missing or invalid authorization header' });
    }
    
    const token = authHeader.substring(7);
    if (!token) {
      return reply.code(401).send({ error: 'Invalid token' });
    }

    try {
      const payload = this.jwtService.verifyAccessToken(token);
      (request as any).user = {
        userId: payload.userId,
        email: payload.email,
        displayName: payload.displayName
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return reply.code(401).send({ error: 'Invalid or expired token' });
    }
  };

  /**
   * Middleware for optional authentication
   * Sets user context if valid token is provided, but doesn't require it
   */
  optionalAuth = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return; // No auth header, continue without user context
    }
    
    const token = authHeader.substring(7);
    if (!token) {
      return; // No token, continue without user context
    }

    try {
      const payload = this.jwtService.verifyAccessToken(token);
      (request as any).user = {
        userId: payload.userId,
        email: payload.email,
        displayName: payload.displayName
      };
    } catch (error) {
      // Invalid token, but don't fail the request - just continue without user context
      console.warn('Optional auth failed:', error);
    }
  };
}

/**
 * Mock authentication middleware for development/testing
 * Creates a mock user context without token validation
 */
export const mockAuthMiddleware = {
  requireAuth: async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    (request as any).user = {
      userId: 'mock-user-id',
      email: 'mock@example.com',
      displayName: 'Mock User'
    };
  },

  optionalAuth: async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    (request as any).user = {
      userId: 'mock-user-id',
      email: 'mock@example.com',
      displayName: 'Mock User'
    };
  }
};