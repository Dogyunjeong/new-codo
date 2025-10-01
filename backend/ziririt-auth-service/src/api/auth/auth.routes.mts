import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginCallback } from 'fastify';
import { AuthHandler } from './auth.handler.mts';
import { UserAuthenticationService } from './UserAuthentication.service.mts';
import { PostgresConnectionService } from '@base/server-services';
import { getAppConfig } from '../../configs/app.config.mts';

// Request schemas
const verifyTokenSchema = {
  type: 'object',
  required: ['idToken'],
  properties: {
    idToken: { type: 'string' },
    deviceId: { type: 'string' },
    userAgent: { type: 'string' },
    ipAddress: { type: 'string' },
  },
};

const exchangeTokenSchema = {
  type: 'object',
  required: ['idToken'],
  properties: {
    idToken: { type: 'string' },
    deviceId: { type: 'string' },
    userAgent: { type: 'string' },
    ipAddress: { type: 'string' },
  },
};

// Legacy schemas (kept for backward compatibility, but will use Firebase)
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

const emailLoginSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
    deviceId: { type: 'string' },
    userAgent: { type: 'string' },
    ipAddress: { type: 'string' },
  },
};

const emailSignupSchema = {
  type: 'object',
  required: ['email', 'password', 'name'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 6 },
    name: { type: 'string', minLength: 1 },
    username: { type: 'string' },
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

  // GCP Identity Platform token verification and exchange
  fastify.post('/verify', {
    schema: { body: verifyTokenSchema },
    handler: authHandler.verifyAndExchange.bind(authHandler),
  });

  // Exchange GCP Identity Platform token for backend JWT
  fastify.post('/exchange', {
    schema: { body: exchangeTokenSchema },
    handler: authHandler.exchangeToken.bind(authHandler),
  });

  // Legacy routes (will use Firebase behind the scenes)
  // Email/Password authentication (deprecated - use Firebase on client)
  fastify.post('/login', {
    schema: { body: emailLoginSchema },
    handler: authHandler.emailLogin.bind(authHandler),
  });

  // Email/Password signup (deprecated - use Firebase on client)
  fastify.post('/signup', {
    schema: { body: emailSignupSchema },
    handler: authHandler.emailSignup.bind(authHandler),
  });

  // Google OAuth authentication (uses Firebase token)
  fastify.post('/google', {
    schema: { body: googleAuthSchema },
    handler: authHandler.verifyAndExchange.bind(authHandler),
  });

  // Apple OAuth authentication (uses Firebase token)
  fastify.post('/apple', {
    schema: { body: appleAuthSchema },
    handler: authHandler.verifyAndExchange.bind(authHandler),
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

  // Get current session info
  fastify.get('/session', {
    preHandler: authenticateToken,
    handler: authHandler.getSession.bind(authHandler),
  });

  // Verify access token (GET)
  fastify.get('/verify', {
    preHandler: authenticateToken,
    handler: async (request, reply) => {
      const user = (request as any).user;
      return reply.code(200).send({
        valid: true,
        user: {
          id: user.userId,
          userId: user.userId,
          email: user.email,
          displayName: user.displayName,
          isVerified: user.isVerified,
          firebaseUid: user.firebaseUid,
        }
      });
    },
  });

  // Get current user info
  fastify.get('/me', {
    preHandler: authenticateToken,
    handler: authHandler.getCurrentUser.bind(authHandler),
  });

  done();
};