import { FastifyRequest, FastifyReply } from 'fastify';
import { UserAuthenticationService } from './UserAuthentication.service.mts';
import { GoogleAuthData } from '../oauth/GoogleOAuth.service.mts';
import { AppleAuthData } from '../oauth/AppleOAuth.service.mts';
import { EmailPasswordAuthData, EmailPasswordSignupData } from './EmailPasswordAuth.service.mts';
import { FirebaseAdminService } from './FirebaseAdmin.service.mts';
import { getAppConfig } from '../../configs/app.config.mts';
import { SessionManagementService } from './SessionManagement.service.mts';
import { PostgresConnectionService } from '@base/server-services';

export class AuthHandler {
  private authService: UserAuthenticationService;
  private firebaseAdmin: FirebaseAdminService;
  private sessionService: SessionManagementService;
  private config = getAppConfig();

  constructor(authService: UserAuthenticationService) {
    this.authService = authService;
    this.firebaseAdmin = FirebaseAdminService.getInstance(this.config);
    const dbConnection = PostgresConnectionService.getInstance({ connectionString: this.config.databaseUrl });
    this.sessionService = new SessionManagementService(dbConnection.getPool());
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

  async emailLogin(request: FastifyRequest<{ Body: EmailPasswordAuthData }>, reply: FastifyReply) {
    try {
      const authResponse = await this.authService.authenticateWithEmailPassword(request.body);
      return reply.code(200).send(authResponse);
    } catch (error) {
      request.log.error('Email login error:', error);
      return reply.code(401).send({ 
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Invalid credentials'
      });
    }
  }

  async emailSignup(request: FastifyRequest<{ Body: EmailPasswordSignupData }>, reply: FastifyReply) {
    try {
      const authResponse = await this.authService.signupWithEmailPassword(request.body);
      return reply.code(201).send(authResponse);
    } catch (error) {
      request.log.error('Email signup error:', error);
      return reply.code(400).send({ 
        error: 'Signup failed',
        message: error instanceof Error ? error.message : 'Could not create account'
      });
    }
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

  async verifyAndExchange(request: FastifyRequest<{ Body: { idToken: string; deviceId?: string; userAgent?: string; ipAddress?: string } }>, reply: FastifyReply) {
    try {
      const { idToken, deviceId, userAgent, ipAddress } = request.body;
      const clientIp = ipAddress || request.ip;
      const clientAgent = userAgent || request.headers['user-agent'] || '';

      // Verify Firebase ID token
      const decodedToken = await this.firebaseAdmin.verifyIdToken(idToken);
      
      // Get or create user in local database
      const user = await this.authService.findOrCreateByFirebaseUid({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email || null,
        displayName: decodedToken.name || null,
        photoUrl: decodedToken.picture || null,
        provider: this.firebaseAdmin.getProviderFromToken(decodedToken),
        emailVerified: decodedToken.email_verified || false,
      });
      
      // Generate backend JWT tokens
      const accessToken = this.authService.generateAccessToken(user);
      const refreshToken = this.authService.generateRefreshToken(user);
      
      // Create session
      await this.sessionService.createSession({
        userId: user.id,
        refreshToken,
        deviceId,
        deviceType: this.detectDeviceType(clientAgent),
        ipAddress: clientIp,
        userAgent: clientAgent,
      });
      
      // Update last login
      await this.authService.updateLastLogin(user.id);
      
      return reply.code(200).send({
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          photoUrl: user.photoUrl,
          isVerified: user.emailVerified,
        },
      });
    } catch (error) {
      request.log.error('Token verification error:', error);
      return reply.code(401).send({ 
        error: 'Authentication failed',
        message: error instanceof Error ? error.message : 'Invalid token'
      });
    }
  }

  async exchangeToken(request: FastifyRequest<{ Body: { idToken: string; deviceId?: string; userAgent?: string; ipAddress?: string } }>, reply: FastifyReply) {
    // Alias for verifyAndExchange
    return this.verifyAndExchange(request, reply);
  }

  async getSession(request: FastifyRequest, reply: FastifyReply) {
    try {
      const tokenUser = (request as any).user;
      const sessions = await this.sessionService.getUserSessions(tokenUser.userId);
      
      return reply.code(200).send({
        sessions: sessions.map(s => ({
          id: s.id,
          deviceId: s.deviceId,
          deviceType: s.deviceType,
          ipAddress: s.ipAddress,
          lastUsedAt: s.lastUsedAt,
          createdAt: s.createdAt,
        })),
      });
    } catch (error) {
      request.log.error('Get session error:', error);
      return reply.code(500).send({ error: 'Failed to get session information' });
    }
  }

  private detectDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile')) return 'mobile';
    if (ua.includes('tablet')) return 'tablet';
    if (ua.includes('desktop')) return 'desktop';
    return 'unknown';
  }
}