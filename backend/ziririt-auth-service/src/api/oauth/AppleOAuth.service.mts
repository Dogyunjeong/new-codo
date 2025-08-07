import jwt from 'jsonwebtoken';

export interface AppleUserInfo {
  id: string;
  email: string;
  email_verified: boolean;
  name?: string;
}

export interface AppleAuthData {
  idToken: string;
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
}

interface AppleIdTokenPayload {
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  sub: string;
  email: string;
  email_verified: boolean;
  auth_time: number;
}

export class AppleOAuthService {
  private clientId: string;

  constructor(clientId: string) {
    this.clientId = clientId;
  }

  async verifyIdToken(idToken: string): Promise<AppleUserInfo> {
    try {
      // For production, you would need to verify the token against Apple's public keys
      // This is a simplified version for development
      const decoded = jwt.decode(idToken) as AppleIdTokenPayload;
      
      if (!decoded || !decoded.sub || !decoded.email) {
        throw new Error('Invalid Apple ID token payload');
      }

      // Verify audience (client ID)
      if (decoded.aud !== this.clientId) {
        throw new Error('Invalid Apple ID token audience');
      }

      // Verify issuer
      if (decoded.iss !== 'https://appleid.apple.com') {
        throw new Error('Invalid Apple ID token issuer');
      }

      // Check expiration
      if (decoded.exp < Date.now() / 1000) {
        throw new Error('Apple ID token has expired');
      }

      return {
        id: decoded.sub,
        email: decoded.email,
        email_verified: decoded.email_verified || false,
      };
    } catch (error) {
      throw new Error(`Apple token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async authenticate(authData: AppleAuthData): Promise<AppleUserInfo> {
    return this.verifyIdToken(authData.idToken);
  }
}