import { OAuth2Client } from 'google-auth-library';
import { getAppConfig } from '../configs/app.config.mts';
import { GoogleOAuthRequest } from '../types/auth.types.mts';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  emailVerified: boolean;
}

export class GoogleOAuthService {
  private client: OAuth2Client;
  private config = getAppConfig();

  constructor() {
    this.client = new OAuth2Client(this.config.googleClientId);
  }

  public async authenticate(request: GoogleOAuthRequest): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: request.idToken,
        audience: this.config.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google ID token payload');
      }

      if (!payload.email) {
        throw new Error('Email not provided by Google');
      }

      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture,
        emailVerified: payload.email_verified === true,
      };
    } catch (error) {
      console.error('Google OAuth authentication failed:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  public async refreshToken(refreshToken: string): Promise<string> {
    try {
      this.client.setCredentials({ refresh_token: refreshToken });
      const response = await this.client.refreshAccessToken();
      
      if (!response.credentials.access_token) {
        throw new Error('No access token received');
      }

      return response.credentials.access_token;
    } catch (error) {
      console.error('Google token refresh failed:', error);
      throw new Error('Failed to refresh Google token');
    }
  }

  public async revokeToken(token: string): Promise<void> {
    try {
      await this.client.revokeToken(token);
    } catch (error) {
      console.error('Google token revocation failed:', error);
      throw new Error('Failed to revoke Google token');
    }
  }
}