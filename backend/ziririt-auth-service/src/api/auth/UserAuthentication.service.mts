import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { JWTService, TokenResponse } from '@base/server-services';
import { UserRegistrationService } from './UserRegistration.service.mts';
import { RefreshTokenService } from './RefreshToken.service.mts';
import { SessionManagementService } from './SessionManagement.service.mts';
import { GoogleOAuthService, GoogleAuthData } from '../oauth/GoogleOAuth.service.mts';
import { AppleOAuthService, AppleAuthData } from '../oauth/AppleOAuth.service.mts';
import { EmailPasswordAuthService, EmailPasswordAuthData, EmailPasswordSignupData } from './EmailPasswordAuth.service.mts';

export interface AuthConfig {
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  googleClientId: string;
  appleClientId: string;
}

export interface FirebaseUserData {
  firebaseUid: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  provider: string;
  emailVerified: boolean;
}

export class UserAuthenticationService {
  private userRegistrationService: UserRegistrationService;
  private refreshTokenService: RefreshTokenService;
  private sessionService: SessionManagementService;
  private jwtService: JWTService;
  private googleOAuthService: GoogleOAuthService;
  private appleOAuthService: AppleOAuthService;
  private emailPasswordAuthService: EmailPasswordAuthService;

  constructor(pool: Pool, config: AuthConfig) {
    this.userRegistrationService = new UserRegistrationService(pool);
    this.refreshTokenService = new RefreshTokenService(pool);
    this.sessionService = new SessionManagementService(pool);
    this.jwtService = new JWTService({
      accessTokenSecret: config.jwtSecret,
      refreshTokenSecret: config.jwtRefreshSecret,
      accessTokenExpiresIn: config.jwtExpiresIn,
      refreshTokenExpiresIn: config.jwtRefreshExpiresIn,
    });
    this.googleOAuthService = new GoogleOAuthService(config.googleClientId);
    this.appleOAuthService = new AppleOAuthService(config.appleClientId);
    this.emailPasswordAuthService = new EmailPasswordAuthService(pool);
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
      const tokenResponse = this.jwtService.generateTokenPair(this.buildTokenUser(user), tokenId);

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
      const tokenResponse = this.jwtService.generateTokenPair(this.buildTokenUser(user), tokenId);

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
      // Verify refresh token JWT signature
      const tokenVerification = this.jwtService.verifyRefreshToken(refreshToken);
      if (!tokenVerification.valid || !tokenVerification.payload) {
        throw new Error('Invalid refresh token');
      }

      // Check for refresh token in user_sessions table (Firebase auth flow)
      const session = await this.sessionService.validateSession(refreshToken);

      // If not in sessions, check refresh_tokens table (legacy/direct auth flow)
      const storedToken = session ? null : await this.refreshTokenService.findByToken(refreshToken);

      if (!session && !storedToken) {
        throw new Error('Refresh token not found or expired');
      }

      // Get user ID from either session or stored token
      const userId = session ? session.userId : storedToken!.userId;

      // Get user
      const user = await this.userRegistrationService.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new tokens
      const tokenId = uuidv4();
      const tokenResponse = this.jwtService.generateTokenPair(this.buildTokenUser(user), tokenId);

      // Rotate tokens based on storage type
      if (session) {
        // Rotate session refresh token
        await this.sessionService.rotateRefreshToken(refreshToken, tokenResponse.refreshToken);
      } else {
        // Delete old refresh token and create new one in refresh_tokens table
        await this.refreshTokenService.deleteByToken(refreshToken);
        await this.refreshTokenService.create({
          userId: user.id,
          token: tokenResponse.refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });
      }

      return tokenResponse;
    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      // Try to invalidate from both storage systems
      await Promise.all([
        this.sessionService.invalidateSession(refreshToken).catch(() => {}),
        this.refreshTokenService.deleteByToken(refreshToken).catch(() => {}),
      ]);
    } catch (error) {
      // Log error but don't throw to prevent information leakage
      console.error('Logout error:', error);
    }
  }

  async authenticateWithEmailPassword(authData: EmailPasswordAuthData): Promise<TokenResponse> {
    try {
      // Authenticate user with email and password
      const user = await this.emailPasswordAuthService.login(authData);

      // Generate tokens
      const tokenId = uuidv4();
      const tokenResponse = this.jwtService.generateTokenPair(this.buildTokenUser(user), tokenId);

      // Store refresh token
      await this.refreshTokenService.create({
        userId: user.id,
        token: tokenResponse.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      return {
        ...tokenResponse,
        user: {
          id: user.id,
          userId: user.id,
          email: user.email,
          displayName: user.display_name,
          isVerified: user.is_verified,
          firebaseUid: user.firebase_uid || user.firebaseUid,
        },
      };
    } catch (error) {
      throw new Error(`Email/password authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async signupWithEmailPassword(signupData: EmailPasswordSignupData): Promise<TokenResponse> {
    try {
      // Create user with email and password
      const user = await this.emailPasswordAuthService.signup(signupData);

      // Generate tokens
      const tokenId = uuidv4();
      const tokenResponse = this.jwtService.generateTokenPair(this.buildTokenUser(user), tokenId);

      // Store refresh token
      await this.refreshTokenService.create({
        userId: user.id,
        token: tokenResponse.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });

      return {
        ...tokenResponse,
        user: {
          id: user.id,
          userId: user.id,
          email: user.email,
          displayName: user.display_name,
          isVerified: user.is_verified,
          firebaseUid: user.firebase_uid || user.firebaseUid,
        },
      };
    } catch (error) {
      throw new Error(`Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserById(userId: string) {
    return this.userRegistrationService.findById(userId);
  }

  verifyAccessToken(token: string) {
    return this.jwtService.verifyAccessToken(token);
  }

  async findOrCreateByFirebaseUid(userData: FirebaseUserData) {
    try {
      // Try to find existing user by Firebase UID
      let user = await this.userRegistrationService.findByFirebaseUid(userData.firebaseUid);
      
      if (!user && userData.email) {
        // Try to find by email (for existing users migrating to Firebase)
        user = await this.userRegistrationService.findByEmail(userData.email);
        
        if (user) {
          // Update existing user with Firebase UID
          await this.userRegistrationService.updateFirebaseUid(user.id, userData.firebaseUid);
        }
      }
      
      if (!user) {
        // Create new user
        user = await this.userRegistrationService.createFromFirebase(userData);
      } else {
        // Update user info from Firebase
        await this.userRegistrationService.updateFromFirebase(user.id, userData);
      }
      
      return user;
    } catch (error) {
      throw new Error(`Failed to find or create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRegistrationService.updateLastLogin(userId);
  }

  generateAccessToken(user: any): string {
    const tokenData = {
      userId: user.id,
      email: user.email,
      displayName: user.display_name || user.displayName,
      isVerified: user.email_verified || user.emailVerified || false,
      firebaseUid: user.firebase_uid || user.firebaseUid,
      provider: user.provider,
    };
    return this.jwtService.generateAccessToken(tokenData);
  }

  generateRefreshToken(user: any): string {
    const tokenId = uuidv4();
    const tokenData = {
      userId: user.id,
      tokenId,
    };
    return this.jwtService.generateRefreshToken(tokenData);
  }

  private buildTokenUser(user: any): {
    id: string;
    email: string;
    displayName: string;
    isVerified: boolean;
    firebaseUid?: string;
    provider?: string;
  } {
    return {
      id: user.id,
      email: user.email,
      displayName: user.display_name || user.displayName || user.username || user.email,
      isVerified: user.is_verified ?? user.isVerified ?? user.email_verified ?? user.emailVerified ?? false,
      firebaseUid: user.firebase_uid || user.firebaseUid,
      provider: user.provider,
    };
  }
}
