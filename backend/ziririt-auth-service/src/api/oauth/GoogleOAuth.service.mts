import { OAuth2Client } from 'google-auth-library';

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export interface GoogleAuthData {
  idToken: string;
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export class GoogleOAuthService {
  private client: OAuth2Client;

  constructor(clientId: string) {
    this.client = new OAuth2Client(clientId);
  }

  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: this.client._clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google ID token payload');
      }

      return {
        id: payload.sub,
        email: payload.email!,
        verified_email: payload.email_verified || false,
        name: payload.name || '',
        given_name: payload.given_name || '',
        family_name: payload.family_name || '',
        picture: payload.picture || '',
        locale: payload.locale || 'en',
      };
    } catch (error) {
      throw new Error(`Google token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async authenticate(authData: GoogleAuthData): Promise<GoogleUserInfo> {
    return this.verifyIdToken(authData.idToken);
  }
}