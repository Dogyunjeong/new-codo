import { FastifyRequest, FastifyReply } from 'fastify';
import { UserAuthenticationService } from './UserAuthentication.service.mts';
import { GoogleAuthData } from '../oauth/GoogleOAuth.service.mts';
import { AppleAuthData } from '../oauth/AppleOAuth.service.mts';

export class AuthHandler {
  private authService: UserAuthenticationService;

  constructor(authService: UserAuthenticationService) {
    this.authService = authService;
  }

  async googleAuth(request: FastifyRequest<{ Body: GoogleAuthData }>, reply: FastifyReply) {
    try {
      const { idToken, deviceId, userAgent, ipAddress } = request.body;
      const clientIp = ipAddress || request.ip;
      const clientAgent = userAgent || request.headers['user-agent'] || '';

      const authResponse = await this.authService.authenticateWithGoogle({
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
  }

  async appleAuth(request: FastifyRequest<{ Body: AppleAuthData }>, reply: FastifyReply) {
    try {
      const { idToken, deviceId, userAgent, ipAddress } = request.body;
      const clientIp = ipAddress || request.ip;
      const clientAgent = userAgent || request.headers['user-agent'] || '';

      const authResponse = await this.authService.authenticateWithApple({
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
  }

  async refreshToken(request: FastifyRequest<{ Body: { refreshToken: string } }>, reply: FastifyReply) {
    try {
      const { refreshToken } = request.body;
      const tokenResponse = await this.authService.refreshAccessToken(refreshToken);
      
      return reply.code(200).send(tokenResponse);
    } catch (error) {
      request.log.error('Token refresh error:', error);
      return reply.code(401).send({ 
        error: 'Token refresh failed',
        message: error instanceof Error ? error.message : 'Invalid refresh token'
      });
    }
  }

  async logout(request: FastifyRequest<{ Body: { refreshToken: string } }>, reply: FastifyReply) {
    try {
      const { refreshToken } = request.body;
      await this.authService.logout(refreshToken);
      
      return reply.code(200).send({ message: 'Logged out successfully' });
    } catch (error) {
      request.log.error('Logout error:', error);
      // Return success even on error to prevent information leakage
      return reply.code(200).send({ message: 'Logged out successfully' });
    }
  }

  async verifyToken(request: FastifyRequest, reply: FastifyReply) {
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
  }

  async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tokenUser = (request as any).user;
      const user = await this.authService.getUserById(tokenUser.userId);
      
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
  }

  async healthCheck(request: FastifyRequest, reply: FastifyReply) {
    return reply.code(200).send({ status: 'healthy', service: 'ziririt-auth-service' });
  }
}