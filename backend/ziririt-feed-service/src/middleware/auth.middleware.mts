import { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    
    // TODO: Verify token with Auth Service
    // For now, we'll extract userId from a mock token or use a test user
    
    // In development, we'll use a mock user ID
    if (process.env.NODE_ENV === 'development') {
      (request as any).userId = 'alice_goals_user_id';
      return;
    }

    // In production, verify with auth service
    // const authController = new AuthController({ baseURL: process.env.AUTH_SERVICE_URL });
    // const user = await authController.verifyToken(token);
    // (request as any).userId = user.id;
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return reply.code(401).send({ error: 'Invalid token' });
  }
}