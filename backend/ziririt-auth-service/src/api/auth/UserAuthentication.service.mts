import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { JWTService, TokenResponse } from '@base/server-services';
import { UserRegistrationService } from './UserRegistration.service.mts';
import { RefreshTokenService } from './RefreshToken.service.mts';
import { GoogleOAuthService, GoogleAuthData } from '../oauth/GoogleOAuth.service.mts';
import { AppleOAuthService, AppleAuthData } from '../oauth/AppleOAuth.service.mts';

export interface AuthConfig {
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  googleClientId: string;
  appleClientId: string;
}

export class UserAuthenticationService {
  private userRegistrationService: UserRegistrationService;
  private refreshTokenService: RefreshTokenService;
  private jwtService: JWTService;
  private googleOAuthService: GoogleOAuthService;
  private appleOAuthService: AppleOAuthService;

  constructor(pool: Pool, config: AuthConfig) {
    this.userRegistrationService = new UserRegistrationService(pool);
    this.refreshTokenService = new RefreshTokenService(pool);
    this.jwtService = new JWTService({
      accessTokenSecret: config.jwtSecret,
      refreshTokenSecret: config.jwtRefreshSecret,
      accessTokenExpiresIn: config.jwtExpiresIn,
      refreshTokenExpiresIn: config.jwtRefreshExpiresIn,
    });
    this.googleOAuthService = new GoogleOAuthService(config.googleClientId);
    this.appleOAuthService = new AppleOAuthService(config.appleClientId);
  }

  async authenticateWithGoogle(authData: GoogleAuthData): Promise<TokenResponse> {
    try {
      // Verify Google token and get user info
      const googleUser = await this.googleOAuthService.authenticate(authData);

      // Register or get existing user
      const user = await this.userRegistrationService.registerFromGoogle(googleUser);

      // Update last login
      await this.userRegistrationService.updateLastLogin(user.id);

      // Generate tokens
      const tokenId = uuidv4();
      const tokenResponse = this.jwtService.generateTokenPair(user, tokenId);

      // Store refresh token
      await this.refreshTokenService.create({
        userId: user.id,
        token: tokenResponse.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      return tokenResponse;
    } catch (error) {
      throw new Error(`Google authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async authenticateWithApple(authData: AppleAuthData): Promise<TokenResponse> {
    try {
      // Verify Apple token and get user info
      const appleUser = await this.appleOAuthService.authenticate(authData);

      // Register or get existing user
      const user = await this.userRegistrationService.registerFromApple(appleUser);

      // Update last login
      await this.userRegistrationService.updateLastLogin(user.id);

      // Generate tokens
      const tokenId = uuidv4();
      const tokenResponse = this.jwtService.generateTokenPair(user, tokenId);

      // Store refresh token
      await this.refreshTokenService.create({
        userId: user.id,
        token: tokenResponse.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      return tokenResponse;
    } catch (error) {
      throw new Error(`Apple authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    try {
      // Verify refresh token
      const tokenVerification = this.jwtService.verifyRefreshToken(refreshToken);
      if (!tokenVerification.valid || !tokenVerification.payload) {
        throw new Error('Invalid refresh token');
      }

      // Check if refresh token exists in database
      const storedToken = await this.refreshTokenService.findByToken(refreshToken);
      if (!storedToken) {
        throw new Error('Refresh token not found or expired');
      }

      // Get user
      const user = await this.userRegistrationService.findById(tokenVerification.payload.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const tokenId = uuidv4();
      const tokenResponse = this.jwtService.generateTokenPair(user, tokenId);

      // Delete old refresh token and create new one
      await this.refreshTokenService.deleteByToken(refreshToken);
      await this.refreshTokenService.create({
        userId: user.id,
        token: tokenResponse.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      return tokenResponse;
    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await this.refreshTokenService.deleteByToken(refreshToken);
    } catch (error) {
      // Log error but don't throw to prevent information leakage
      console.error('Logout error:', error);
    }
  }

  async getUserById(userId: string) {
    return this.userRegistrationService.findById(userId);
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verifyAccessToken(token);
  }
}