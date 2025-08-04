import { DatabaseConnection } from '../database/db.mjs';
import { GoogleOAuthService, GoogleUserInfo } from './google-oauth.service.mjs';
import { AppleOAuthService, AppleUserInfo } from './apple-oauth.service.mjs';
import { JWTUtils } from '../utils/jwt.utils.mjs';
import { 
  User, 
  RefreshToken, 
  AuthResponse, 
  GoogleOAuthRequest, 
  AppleOAuthRequest,
  JWTPayload 
} from '../types/auth.types.mjs';

export class AuthService {
  private db = DatabaseConnection.getInstance();
  private googleOAuth = new GoogleOAuthService();
  private appleOAuth = new AppleOAuthService();

  public async authenticateWithGoogle(request: GoogleOAuthRequest): Promise<AuthResponse> {
    try {
      const googleUser = await this.googleOAuth.authenticate(request);
      const user = await this.findOrCreateGoogleUser(googleUser);
      return await this.generateAuthResponse(user, request);
    } catch (error) {
      console.error('Google authentication failed:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  public async authenticateWithApple(request: AppleOAuthRequest): Promise<AuthResponse> {
    try {
      const appleUser = await this.appleOAuth.authenticate(request);
      const user = await this.findOrCreateAppleUser(appleUser);
      return await this.generateAuthResponse(user, request);
    } catch (error) {
      console.error('Apple authentication failed:', error);
      throw new Error('Failed to authenticate with Apple');
    }
  }

  private async findOrCreateGoogleUser(googleUser: GoogleUserInfo): Promise<User> {
    // Try to find existing user by Google ID
    let result = await this.db.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleUser.id]
    );

    if (result.rows.length > 0) {
      const user = this.mapDatabaseUserToUser(result.rows[0]);
      // Update last login
      await this.updateLastLogin(user.id);
      return user;
    }

    // Try to find existing user by email
    result = await this.db.query(
      'SELECT * FROM users WHERE email = $1',
      [googleUser.email]
    );

    if (result.rows.length > 0) {
      // Link Google account to existing user
      const user = this.mapDatabaseUserToUser(result.rows[0]);
      await this.db.query(
        'UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2',
        [googleUser.id, user.id]
      );
      await this.updateLastLogin(user.id);
      return { ...user, googleId: googleUser.id };
    }

    // Create new user - generate username from email
    const username = googleUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.random().toString(36).substr(2, 4);
    
    const insertResult = await this.db.query(
      `INSERT INTO users (username, email, display_name, avatar_url, provider, provider_id, google_id, is_active, is_verified, last_login_at) 
       VALUES ($1, $2, $3, $4, 'google', $5, $5, true, $6, NOW()) RETURNING *`,
      [username, googleUser.email, googleUser.name, googleUser.picture, googleUser.id, googleUser.emailVerified]
    );

    return this.mapDatabaseUserToUser(insertResult.rows[0]);
  }

  private async findOrCreateAppleUser(appleUser: AppleUserInfo): Promise<User> {
    // Try to find existing user by Apple ID
    let result = await this.db.query(
      'SELECT * FROM users WHERE apple_id = $1',
      [appleUser.id]
    );

    if (result.rows.length > 0) {
      const user = this.mapDatabaseUserToUser(result.rows[0]);
      await this.updateLastLogin(user.id);
      return user;
    }

    // Try to find existing user by email (if provided)
    if (appleUser.email) {
      result = await this.db.query(
        'SELECT * FROM users WHERE email = $1',
        [appleUser.email]
      );

      if (result.rows.length > 0) {
        // Link Apple account to existing user
        const user = this.mapDatabaseUserToUser(result.rows[0]);
        await this.db.query(
          'UPDATE users SET apple_id = $1, updated_at = NOW() WHERE id = $2',
          [appleUser.id, user.id]
        );
        await this.updateLastLogin(user.id);
        return { ...user, appleId: appleUser.id };
      }
    }

    // Create new user
    const email = appleUser.email || `${appleUser.id}@privaterelay.appleid.com`;
    const displayName = appleUser.name || `Apple User ${appleUser.id.substring(0, 8)}`;
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Math.random().toString(36).substr(2, 4);
    
    const insertResult = await this.db.query(
      `INSERT INTO users (username, email, display_name, provider, provider_id, apple_id, is_active, is_verified, last_login_at) 
       VALUES ($1, $2, $3, 'apple', $4, $4, true, $5, NOW()) RETURNING *`,
      [username, email, displayName, appleUser.id, appleUser.emailVerified]
    );

    return this.mapDatabaseUserToUser(insertResult.rows[0]);
  }

  private async generateAuthResponse(
    user: User, 
    request: GoogleOAuthRequest | AppleOAuthRequest
  ): Promise<AuthResponse> {
    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      isVerified: user.isVerified || false,
    };

    const accessToken = JWTUtils.generateAccessToken(jwtPayload);
    const refreshToken = await this.createRefreshToken(user.id, request);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified || false,
      },
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  private async createRefreshToken(
    userId: string, 
    request: GoogleOAuthRequest | AppleOAuthRequest
  ): Promise<string> {
    const token = JWTUtils.generateSecureToken();
    const tokenHash = JWTUtils.hashToken(token);
    
    // Store refresh token in database
    const result = await this.db.query(
      `INSERT INTO refresh_tokens (token_hash, user_id, device_id, user_agent, ip_address, expires_at) 
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days') RETURNING id`,
      [tokenHash, userId, request.deviceId, request.userAgent, request.ipAddress]
    );

    const tokenId = result.rows[0].id;
    
    // Generate JWT refresh token
    return JWTUtils.generateRefreshToken({ userId, tokenId });
  }

  public async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    const verification = JWTUtils.verifyRefreshToken(refreshToken);
    
    if (!verification.valid || !verification.payload) {
      throw new Error('Invalid refresh token');
    }

    // Check if refresh token exists in database and is not revoked
    const result = await this.db.query(
      `SELECT rt.*, u.* FROM refresh_tokens rt 
       JOIN users u ON rt.user_id = u.id 
       WHERE rt.id = $1 AND rt.user_id = $2 AND rt.revoked_at IS NULL AND rt.expires_at > NOW()`,
      [verification.payload.tokenId, verification.payload.userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Refresh token not found or expired');
    }

    const user = this.mapDatabaseUserToUser(result.rows[0]);
    
    const jwtPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      isVerified: user.isVerified || false,
    };

    const accessToken = JWTUtils.generateAccessToken(jwtPayload);
    
    // Update last used timestamp
    await this.db.query(
      'UPDATE refresh_tokens SET updated_at = NOW() WHERE id = $1',
      [verification.payload.tokenId]
    );

    return {
      accessToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  public async logout(refreshToken: string): Promise<void> {
    const verification = JWTUtils.verifyRefreshToken(refreshToken);
    
    if (!verification.valid || !verification.payload) {
      return; // Silent failure for invalid tokens
    }

    // Revoke refresh token
    await this.db.query(
      'UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = $1 AND user_id = $2',
      [verification.payload.tokenId, verification.payload.userId]
    );
  }

  public async getUserById(userId: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE id = $1 AND (is_active IS NULL OR is_active = true)',
      [userId]
    );

    return result.rows.length > 0 ? this.mapDatabaseUserToUser(result.rows[0]) : null;
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await this.db.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [userId]
    );
  }

  private mapDatabaseUserToUser(dbUser: any): User {
    return {
      id: dbUser.id, // This is already a UUID in the database
      username: dbUser.username,
      email: dbUser.email,
      displayName: dbUser.display_name,
      avatarUrl: dbUser.avatar_url,
      provider: dbUser.provider,
      providerId: dbUser.provider_id,
      googleId: dbUser.google_id,
      appleId: dbUser.apple_id,
      isActive: dbUser.is_active,
      isVerified: dbUser.is_verified,
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at),
      lastLoginAt: dbUser.last_login_at ? new Date(dbUser.last_login_at) : undefined,
    };
  }
}