import jwt from 'jsonwebtoken';
import { getAppConfig } from '../configs/app.config.mjs';
import { AppleOAuthRequest } from '../types/auth.types.mjs';

export interface AppleUserInfo {
  id: string;
  email?: string;
  name?: string;
  emailVerified: boolean;
}

interface AppleJWTPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  email?: string;
  email_verified?: string;
  name?: {
    firstName?: string;
    lastName?: string;
  };
}

export class AppleOAuthService {
  private config = getAppConfig();

  public async authenticate(request: AppleOAuthRequest): Promise<AppleUserInfo> {
    try {
      const decoded = this.verifyAppleToken(request.idToken);
      
      if (!decoded.sub) {
        throw new Error('Invalid Apple ID token: missing subject');
      }

      return {
        id: decoded.sub,
        email: decoded.email,
        name: this.formatAppleName(decoded.name),
        emailVerified: decoded.email_verified === 'true',
      };
    } catch (error) {
      console.error('Apple OAuth authentication failed:', error);
      throw new Error('Failed to authenticate with Apple');
    }
  }

  public verifyAppleToken(idToken: string): AppleJWTPayload {
    try {
      // For development, we'll decode without verification
      // In production, you should verify the token with Apple's public keys
      const decoded = jwt.decode(idToken) as AppleJWTPayload;
      
      if (!decoded) {
        throw new Error('Unable to decode Apple ID token');
      }

      // Verify audience matches your app
      if (decoded.aud !== this.config.appleClientId) {
        throw new Error('Apple ID token audience mismatch');
      }

      // Check if token is expired
      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTime) {
        throw new Error('Apple ID token has expired');
      }

      return decoded;
    } catch (error) {
      console.error('Apple token verification failed:', error);
      throw new Error('Invalid Apple ID token');
    }
  }

  private formatAppleName(name?: { firstName?: string; lastName?: string }): string | undefined {
    if (!name) return undefined;
    
    const parts = [];
    if (name.firstName) parts.push(name.firstName);
    if (name.lastName) parts.push(name.lastName);
    
    return parts.length > 0 ? parts.join(' ') : undefined;
  }

  public async generateClientSecret(): Promise<string> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: this.config.appleTeamId,
        iat: now,
        exp: now + 3600, // 1 hour
        aud: 'https://appleid.apple.com',
        sub: this.config.appleClientId,
      };

      const header = {
        kid: this.config.applePrivateKeyId,
        alg: 'ES256',
      };

      return jwt.sign(payload, this.config.applePrivateKey, {
        algorithm: 'ES256',
        header,
      });
    } catch (error) {
      console.error('Apple client secret generation failed:', error);
      throw new Error('Failed to generate Apple client secret');
    }
  }
}