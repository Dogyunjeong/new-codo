import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { AuthHandler } from './auth.handler.mts';
import { UserAuthenticationService } from './UserAuthentication.service.mts';
import { PostgresConnectionService } from '@base/server-services';
import { getAppConfig } from '../../configs/app.config.mts';

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
    const config = getAppConfig();
    const dbConnection = PostgresConnectionService.getInstance({ connectionString: config.databaseUrl });
    const authService = new UserAuthenticationService(dbConnection.getPool(), config);
    
    const verification = authService.verifyAccessToken(token);

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
  // Initialize services
  const config = getAppConfig();
  const dbConnection = PostgresConnectionService.getInstance({ connectionString: config.databaseUrl });
  const authService = new UserAuthenticationService(dbConnection.getPool(), config);
  const authHandler = new AuthHandler(authService);

  // Health check
  fastify.get('/health', authHandler.healthCheck.bind(authHandler));

  // Google OAuth authentication
  fastify.post('/google', {
    schema: { body: googleAuthSchema },
    handler: authHandler.googleAuth.bind(authHandler),
  });

  // Apple OAuth authentication
  fastify.post('/apple', {
    schema: { body: appleAuthSchema },
    handler: authHandler.appleAuth.bind(authHandler),
  });

  // Refresh access token
  fastify.post('/refresh', {
    schema: { body: refreshTokenSchema },
    handler: authHandler.refreshToken.bind(authHandler),
  });

  // Logout
  fastify.post('/logout', {
    schema: { body: refreshTokenSchema },
    handler: authHandler.logout.bind(authHandler),
  });

  // Verify access token
  fastify.get('/verify', {
    preHandler: authenticateToken,
    handler: authHandler.verifyToken.bind(authHandler),
  });

  // Get current user info
  fastify.get('/me', {
    preHandler: authenticateToken,
    handler: authHandler.getCurrentUser.bind(authHandler),
  });

  done();
};