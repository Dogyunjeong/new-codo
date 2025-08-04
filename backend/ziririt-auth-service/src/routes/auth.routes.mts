import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { AuthService } from '../services/auth.service.mjs';
import { JWTUtils } from '../utils/jwt.utils.mjs';
import { GoogleOAuthRequest, AppleOAuthRequest } from '../types/auth.types.mjs';

const authService = new AuthService();

// Request schemas
const googleAuthSchema = {
  type: 'object',
  required: ['idToken'],
  properties: {
    idToken: { type: 'string' },
    deviceId: { type: 'string' },
    userAgent: { type: 'string' },
    ipAddress: { type: 'string' },
  },
};

const appleAuthSchema = {
  type: 'object',
  required: ['idToken'],
  properties: {
    idToken: { type: 'string' },
    deviceId: { type: 'string' },
    userAgent: { type: 'string' },
    ipAddress: { type: 'string' },
  },
};

const refreshTokenSchema = {
  type: 'object',
  required: ['refreshToken'],
  properties: {
    refreshToken: { type: 'string' },
  },
};

// Auth middleware
async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const verification = JWTUtils.verifyAccessToken(token);

    if (!verification.valid || !verification.payload) {
      return reply.code(401).send({ error: 'Invalid or expired token' });
    }

    // Add user info to request
    (request as any).user = verification.payload;
  } catch (error) {
    return reply.code(401).send({ error: 'Token verification failed' });
  }
}

export const authRoutes: FastifyPluginCallback = (fastify: FastifyInstance, options, done) => {
  // Health check
  fastify.get('/health', async (request, reply) => {
    return { status: 'healthy', service: 'ziririt-auth-service' };
  });

  // Google OAuth authentication
  fastify.post<{ Body: GoogleOAuthRequest }>('/google', {
    schema: { body: googleAuthSchema },
    handler: async (request, reply) => {
      try {
        const { idToken, deviceId, userAgent, ipAddress } = request.body;
        const clientIp = ipAddress || request.ip;
        const clientAgent = userAgent || request.headers['user-agent'] || '';

        const authResponse = await authService.authenticateWithGoogle({
          idToken,
          deviceId,
          userAgent: clientAgent,
          ipAddress: clientIp,
        });

        return reply.code(200).send(authResponse);
      } catch (error) {
        request.log.error('Google authentication error:', error);
        return reply.code(400).send({ 
          error: 'Authentication failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Apple OAuth authentication
  fastify.post<{ Body: AppleOAuthRequest }>('/apple', {
    schema: { body: appleAuthSchema },
    handler: async (request, reply) => {
      try {
        const { idToken, deviceId, userAgent, ipAddress } = request.body;
        const clientIp = ipAddress || request.ip;
        const clientAgent = userAgent || request.headers['user-agent'] || '';

        const authResponse = await authService.authenticateWithApple({
          idToken,
          deviceId,
          userAgent: clientAgent,
          ipAddress: clientIp,
        });

        return reply.code(200).send(authResponse);
      } catch (error) {
        request.log.error('Apple authentication error:', error);
        return reply.code(400).send({ 
          error: 'Authentication failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
  });

  // Refresh access token
  fastify.post<{ Body: { refreshToken: string } }>('/refresh', {
    schema: { body: refreshTokenSchema },
    handler: async (request, reply) => {
      try {
        const { refreshToken } = request.body;
        const tokenResponse = await authService.refreshAccessToken(refreshToken);
        
        return reply.code(200).send(tokenResponse);
      } catch (error) {
        request.log.error('Token refresh error:', error);
        return reply.code(401).send({ 
          error: 'Token refresh failed',
          message: error instanceof Error ? error.message : 'Invalid refresh token'
        });
      }
    },
  });

  // Logout
  fastify.post<{ Body: { refreshToken: string } }>('/logout', {
    schema: { body: refreshTokenSchema },
    handler: async (request, reply) => {
      try {
        const { refreshToken } = request.body;
        await authService.logout(refreshToken);
        
        return reply.code(200).send({ message: 'Logged out successfully' });
      } catch (error) {
        request.log.error('Logout error:', error);
        // Return success even on error to prevent information leakage
        return reply.code(200).send({ message: 'Logged out successfully' });
      }
    },
  });

  // Verify access token
  fastify.get('/verify', {
    preHandler: authenticateToken,
    handler: async (request, reply) => {
      const user = (request as any).user;
      return reply.code(200).send({ 
        valid: true, 
        user: {
          userId: user.userId,
          email: user.email,
          displayName: user.displayName,
          isVerified: user.isVerified,
        }
      });
    },
  });

  // Get current user info
  fastify.get('/me', {
    preHandler: authenticateToken,
    handler: async (request, reply) => {
      try {
        const tokenUser = (request as any).user;
        const user = await authService.getUserById(tokenUser.userId);
        
        if (!user) {
          return reply.code(404).send({ error: 'User not found' });
        }

        return reply.code(200).send({
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
          }
        });
      } catch (error) {
        request.log.error('Get user error:', error);
        return reply.code(500).send({ error: 'Failed to get user information' });
      }
    },
  });

  done();
};