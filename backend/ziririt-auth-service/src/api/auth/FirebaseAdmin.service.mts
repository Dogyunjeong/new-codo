import admin from 'firebase-admin';
import { AppConfig } from '../../configs/app.config.mjs';

export interface DecodedIdToken extends admin.auth.DecodedIdToken {
  // Extended properties if needed
}

export class FirebaseAdminService {
  private app: admin.app.App;
  private static instance: FirebaseAdminService | null = null;

  constructor(config: AppConfig) {
    // Check if already initialized
    if (admin.apps.length > 0) {
      this.app = admin.apps[0];
    } else {
      // Check for Google Application Default Credentials first
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      
      if (credentialsPath) {
        console.log('Firebase Admin SDK: Using service account from file:', credentialsPath);
        // Initialize with service account file
        this.app = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: config.firebaseServiceAccount?.projectId || config.gcpProjectId || 'codo-dev-469003',
        });
      } else {
        // Fallback to credentials from config
        const privateKey = config.firebaseServiceAccount?.privateKey || config.firebasePrivateKey || '';
        const clientEmail = config.firebaseServiceAccount?.clientEmail || config.firebaseClientEmail || '';
        const projectId = config.firebaseServiceAccount?.projectId || config.gcpProjectId || 'codo-dev-469003';
        
        if (!privateKey || !clientEmail || privateKey === '' || clientEmail === '') {
          console.warn('Firebase Admin SDK: No valid service account credentials found.');
          console.warn('Using mock mode for development. Real authentication will not work.');
          
          // Initialize with application default credentials (will fail in production)
          this.app = admin.initializeApp({
            projectId: projectId,
          });
        } else {
          // Initialize Firebase Admin with service account credentials
          this.app = admin.initializeApp({
            credential: admin.credential.cert({
              projectId: projectId,
              clientEmail: clientEmail,
              privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
          });
        }
      }
    }
  }

  static getInstance(config: AppConfig): FirebaseAdminService {
    if (!FirebaseAdminService.instance) {
      FirebaseAdminService.instance = new FirebaseAdminService(config);
    }
    return FirebaseAdminService.instance;
  }

  /**
   * Verify a Firebase ID token
   */
  async verifyIdToken(idToken: string, checkRevoked = false): Promise<DecodedIdToken> {
    try {
      const decodedToken = await this.app.auth().verifyIdToken(idToken, checkRevoked);
      return decodedToken;
    } catch (error: any) {
      if (error.code === 'auth/id-token-expired') {
        throw new Error('ID token has expired. Please sign in again.');
      } else if (error.code === 'auth/id-token-revoked') {
        throw new Error('ID token has been revoked. Please sign in again.');
      } else if (error.code === 'auth/invalid-id-token') {
        throw new Error('Invalid ID token provided.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('User account has been disabled.');
      }
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Get user by UID
   */
  async getUser(uid: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.app.auth().getUser(uid);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('User not found.');
      }
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.app.auth().getUserByEmail(email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('User not found.');
      }
      throw new Error(`Failed to get user by email: ${error.message}`);
    }
  }

  /**
   * Create a custom token for a user
   */
  async createCustomToken(uid: string, claims?: object): Promise<string> {
    try {
      return await this.app.auth().createCustomToken(uid, claims);
    } catch (error: any) {
      throw new Error(`Failed to create custom token: ${error.message}`);
    }
  }

  /**
   * Set custom user claims
   */
  async setCustomUserClaims(uid: string, customClaims: object | null): Promise<void> {
    try {
      await this.app.auth().setCustomUserClaims(uid, customClaims);
    } catch (error: any) {
      throw new Error(`Failed to set custom claims: ${error.message}`);
    }
  }

  /**
   * Revoke refresh tokens for a user
   */
  async revokeRefreshTokens(uid: string): Promise<void> {
    try {
      await this.app.auth().revokeRefreshTokens(uid);
    } catch (error: any) {
      throw new Error(`Failed to revoke refresh tokens: ${error.message}`);
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(uid: string): Promise<void> {
    try {
      await this.app.auth().deleteUser(uid);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('User not found.');
      }
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Create a new user
   */
  async createUser(properties: admin.auth.CreateRequest): Promise<admin.auth.UserRecord> {
    try {
      return await this.app.auth().createUser(properties);
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        throw new Error('Email already exists.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.code === 'auth/invalid-password') {
        throw new Error('Invalid password. Must be at least 6 characters.');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Update a user
   */
  async updateUser(uid: string, properties: admin.auth.UpdateRequest): Promise<admin.auth.UserRecord> {
    try {
      return await this.app.auth().updateUser(uid, properties);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('User not found.');
      } else if (error.code === 'auth/email-already-exists') {
        throw new Error('Email already exists.');
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * List users with pagination
   */
  async listUsers(maxResults = 1000, pageToken?: string): Promise<admin.auth.ListUsersResult> {
    try {
      return await this.app.auth().listUsers(maxResults, pageToken);
    } catch (error: any) {
      throw new Error(`Failed to list users: ${error.message}`);
    }
  }

  /**
   * Generate password reset link
   */
  async generatePasswordResetLink(email: string, actionCodeSettings?: admin.auth.ActionCodeSettings): Promise<string> {
    try {
      return await this.app.auth().generatePasswordResetLink(email, actionCodeSettings);
    } catch (error: any) {
      throw new Error(`Failed to generate password reset link: ${error.message}`);
    }
  }

  /**
   * Generate email verification link
   */
  async generateEmailVerificationLink(email: string, actionCodeSettings?: admin.auth.ActionCodeSettings): Promise<string> {
    try {
      return await this.app.auth().generateEmailVerificationLink(email, actionCodeSettings);
    } catch (error: any) {
      throw new Error(`Failed to generate email verification link: ${error.message}`);
    }
  }

  /**
   * Generate sign-in with email link
   */
  async generateSignInWithEmailLink(email: string, actionCodeSettings: admin.auth.ActionCodeSettings): Promise<string> {
    try {
      return await this.app.auth().generateSignInWithEmailLink(email, actionCodeSettings);
    } catch (error: any) {
      throw new Error(`Failed to generate sign-in link: ${error.message}`);
    }
  }

  /**
   * Get provider type from decoded token
   */
  getProviderFromToken(decodedToken: DecodedIdToken): string {
    if (decodedToken.firebase?.sign_in_provider) {
      const provider = decodedToken.firebase.sign_in_provider;
      if (provider === 'google.com') return 'google';
      if (provider === 'apple.com') return 'apple';
      if (provider === 'password') return 'email';
      return provider;
    }
    return 'unknown';
  }
}