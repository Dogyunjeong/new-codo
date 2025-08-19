import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import { AppConfig } from '../../configs/app.config.mts';

export interface GCPAuthData {
  idToken: string;
  provider: 'email' | 'google' | 'apple';
  deviceId?: string;
  userAgent?: string;
  ipAddress?: string;
  displayName?: string;
  isNewUser?: boolean;
}

export interface GCPUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  providerId: string;
  customClaims?: { [key: string]: any };
}

export interface TokenPayload {
  iss: string;          // Issuer
  aud: string;          // Audience (project ID)
  auth_time: number;    // Authentication time
  user_id: string;      // User ID
  sub: string;          // Subject (user ID)
  iat: number;          // Issued at
  exp: number;          // Expiration time
  email?: string;
  email_verified?: boolean;
  firebase?: {
    identities: {
      [key: string]: string[];
    };
    sign_in_provider: string;
  };
  name?: string;
  picture?: string;
}

/**
 * GCP Identity Platform Authentication Service
 * Handles verification of Identity Platform tokens and user management
 * Uses the Identity Platform REST API
 */
export class GCPIdentityAuthService {
  private client: OAuth2Client;
  private projectId: string;
  private apiKey: string;
  private identityToolkitBaseUrl = 'https://identitytoolkit.googleapis.com/v1';

  constructor(config: AppConfig) {
    this.projectId = config.gcpProjectId || config.firebaseProjectId || '';
    this.apiKey = config.gcpApiKey || '';
    
    // Initialize OAuth2 client for token verification
    this.client = new OAuth2Client({
      projectId: this.projectId,
    });
  }

  /**
   * Verify GCP Identity Platform ID token
   */
  async verifyIdToken(idToken: string): Promise<GCPUser> {
    try {
      // Verify the ID token using Google Auth Library
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: this.projectId, // Specify the audience
      });
      
      const payload = ticket.getPayload() as TokenPayload;
      
      if (!payload) {
        throw new Error('Invalid token payload');
      }

      // Extract provider from firebase claim or default to email
      let provider = 'email';
      if (payload.firebase?.sign_in_provider) {
        if (payload.firebase.sign_in_provider === 'google.com') {
          provider = 'google';
        } else if (payload.firebase.sign_in_provider === 'apple.com') {
          provider = 'apple';
        } else if (payload.firebase.sign_in_provider === 'password') {
          provider = 'email';
        }
      }

      return {
        uid: payload.sub,
        email: payload.email || null,
        displayName: payload.name || null,
        photoURL: payload.picture || null,
        emailVerified: payload.email_verified || false,
        providerId: provider,
        customClaims: payload.firebase,
      };
    } catch (error: any) {
      console.error('GCP Identity Platform token verification failed:', error);
      
      if (error.message?.includes('Token used too late')) {
        throw new Error('Token has expired. Please sign in again.');
      } else if (error.message?.includes('Token has been revoked')) {
        throw new Error('Token has been revoked. Please sign in again.');
      } else if (error.message?.includes('Wrong recipient')) {
        throw new Error('Invalid token audience.');
      }
      
      throw new Error('Authentication failed: ' + (error.message || 'Unknown error'));
    }
  }

  /**
   * Exchange refresh token for new ID token
   */
  async refreshIdToken(refreshToken: string): Promise<{ idToken: string; refreshToken: string; expiresIn: string }> {
    try {
      const response = await axios.post(
        `https://securetoken.googleapis.com/v1/token?key=${this.apiKey}`,
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }
      );

      return {
        idToken: response.data.id_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in,
      };
    } catch (error: any) {
      console.error('Failed to refresh token:', error.response?.data || error);
      throw new Error('Could not refresh authentication token');
    }
  }

  /**
   * Get user info from Identity Platform
   */
  async getUserInfo(idToken: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.identityToolkitBaseUrl}/accounts:lookup?key=${this.apiKey}`,
        {
          idToken: idToken,
        }
      );

      if (response.data.users && response.data.users.length > 0) {
        return response.data.users[0];
      }

      throw new Error('User not found');
    } catch (error: any) {
      console.error('Failed to get user info:', error.response?.data || error);
      throw new Error('Could not retrieve user information');
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(idToken: string): Promise<void> {
    try {
      await axios.post(
        `${this.identityToolkitBaseUrl}/accounts:sendOobCode?key=${this.apiKey}`,
        {
          requestType: 'VERIFY_EMAIL',
          idToken: idToken,
        }
      );
    } catch (error: any) {
      console.error('Failed to send email verification:', error.response?.data || error);
      throw new Error('Could not send verification email');
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await axios.post(
        `${this.identityToolkitBaseUrl}/accounts:sendOobCode?key=${this.apiKey}`,
        {
          requestType: 'PASSWORD_RESET',
          email: email,
        }
      );
    } catch (error: any) {
      console.error('Failed to send password reset email:', error.response?.data || error);
      throw new Error('Could not send password reset email');
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(idToken: string): Promise<void> {
    try {
      await axios.post(
        `${this.identityToolkitBaseUrl}/accounts:delete?key=${this.apiKey}`,
        {
          idToken: idToken,
        }
      );
    } catch (error: any) {
      console.error('Failed to delete user:', error.response?.data || error);
      throw new Error('Could not delete user account');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(idToken: string, displayName?: string, photoUrl?: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.identityToolkitBaseUrl}/accounts:update?key=${this.apiKey}`,
        {
          idToken: idToken,
          displayName: displayName,
          photoUrl: photoUrl,
          returnSecureToken: true,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Failed to update profile:', error.response?.data || error);
      throw new Error('Could not update user profile');
    }
  }

  /**
   * Link email/password to existing account
   */
  async linkEmailPassword(idToken: string, email: string, password: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.identityToolkitBaseUrl}/accounts:update?key=${this.apiKey}`,
        {
          idToken: idToken,
          email: email,
          password: password,
          returnSecureToken: true,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Failed to link email/password:', error.response?.data || error);
      throw new Error('Could not link email/password to account');
    }
  }

  /**
   * Unlink provider from account
   */
  async unlinkProvider(idToken: string, providersToDelete: string[]): Promise<any> {
    try {
      const response = await axios.post(
        `${this.identityToolkitBaseUrl}/accounts:update?key=${this.apiKey}`,
        {
          idToken: idToken,
          deleteProvider: providersToDelete,
          returnSecureToken: true,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Failed to unlink provider:', error.response?.data || error);
      throw new Error('Could not unlink provider from account');
    }
  }

  /**
   * Get provider type from user info
   */
  getProviderType(user: GCPUser): 'email' | 'google' | 'apple' | 'unknown' {
    return user.providerId as any || 'unknown';
  }
}