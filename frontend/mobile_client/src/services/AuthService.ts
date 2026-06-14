/**
 * AuthService - Main authentication service
 *
 * Uses ApiClientManager's shared AuthController to ensure
 * auth handlers are properly configured.
 */

import { AuthProvider, AuthUser, AuthResponse, SignUpData } from './auth/types';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  GoogleSignin,
  GoogleOneTapSignIn,
  statusCodes,
  isSuccessResponse,
  isNoSavedCredentialFoundResponse,
} from '@react-native-google-signin/google-signin';
import { getFirebaseAuth } from './firebase/firebase.init';
import { AppleAuthService } from './auth/AppleAuthService';
import { EmailAuthService } from './auth/EmailAuthService';
import { GoogleAuthService } from './auth/GoogleAuthService';
import { TokenManager } from './auth/TokenManager';
import { SecureStorage } from './storage/SecureStorage';
import { ApiClientManager } from './api/ApiClientManager';
import { getBackendConfig, getOAuthConfig } from '../config/firebase.config';
import * as Device from 'expo-device';

// Re-export types for convenience
export { AuthProvider, AuthUser, AuthResponse, SignUpData } from './auth/types';

export class AuthService {
  private static instance: AuthService;
  private apiClientManager: ApiClientManager;
  private tokenManager: TokenManager;

  private constructor() {
    this.apiClientManager = ApiClientManager.getInstance();
    this.tokenManager = TokenManager.getInstance();
    this.configureGoogleSignIn();

    // Auth error handler is set by AuthContext — do not override it here
  }

  private get authController() {
    return this.apiClientManager.authController;
  }

  /**
   * Configure Google Sign-In with native module
   */
  private configureGoogleSignIn(): void {
    try {
      const config = getOAuthConfig();
      const isExpoGo = Constants?.appOwnership === 'expo';
      const hasNativeModule = !!(NativeModules as any)?.RNGoogleSignin;

      if (isExpoGo || !hasNativeModule) {
        if (__DEV__) {
          console.log(
            '[AuthService] Google Sign-In: native module not available (Expo Go or missing). Skipping configuration.',
          );
        }
        return;
      }

      // Skip if no OAuth config
      if (!config.googleWebClientId || config.googleWebClientId === '') {
        console.log('[AuthService] Google Sign-In: No web client ID configured');
        return;
      }

      GoogleSignin.configure({
        webClientId: config.googleWebClientId,
        iosClientId: config.googleIosClientId,
        offlineAccess: true,
        hostedDomain: '', // Use empty string to allow any domain
        forceCodeForRefreshToken: true,
      });

      console.log('[AuthService] Google Sign-In configured with native module');
    } catch (error) {
      console.error('[AuthService] Error configuring Google Sign-In:', error);
      // Don't throw in development
      if (!__DEV__) {
        throw error;
      }
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      const firebaseResult = await EmailAuthService.signIn(email, password);
      return this.exchangeFirebaseToken(firebaseResult.idToken, AuthProvider.EMAIL);
    } catch (error: any) {
      console.error('[AuthService] Email sign-in error:', error);
      throw error;
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(data: SignUpData): Promise<AuthResponse> {
    try {
      // Sign up with Firebase
      const firebaseResult = await EmailAuthService.signUp(data);

      // Exchange Firebase token for backend JWT
      const response = await this.exchangeFirebaseToken(firebaseResult.idToken, AuthProvider.EMAIL, {
        isNewUser: true,
        displayName: data.displayName,
      });

      return response;
    } catch (error: any) {
      console.error('[AuthService] Email sign-up error:', error);
      throw error;
    }
  }

  /**
   * Sign in with Google using native Google Sign-In module
   * Tries One-Tap Sign-In first on Android, then falls back to regular sign-in.
   */
  async signInWithGoogle(useOneTap: boolean = true): Promise<AuthResponse> {
    try {
      const hasNativeModule = !!(NativeModules as any)?.RNGoogleSignin;
      const oauthConfig = getOAuthConfig();

      if (!hasNativeModule) {
        throw new Error(
          'Google Sign-In is not available in Expo Go. Please build and run a development client.',
        );
      }

      let idToken: string | undefined;
      let isNewUser = false;

      // One-Tap path avoids some native OAuth client mismatches on Android.
      if (useOneTap && Platform.OS === 'android') {
        try {
          const oneTapResponse = await GoogleOneTapSignIn.signIn({
            webClientId: oauthConfig.googleWebClientId,
          });

          if (isSuccessResponse(oneTapResponse)) {
            idToken = oneTapResponse.data.idToken;
          } else if (isNoSavedCredentialFoundResponse(oneTapResponse)) {
            console.log('[AuthService] No saved One-Tap credential, falling back to regular Google sign-in');
          }
        } catch {
          console.log('[AuthService] One-Tap unavailable, falling back to regular Google sign-in');
        }
      }

      if (!idToken) {
        // Regular Google Sign-In path
        await GoogleSignin.hasPlayServices();
        await GoogleSignin.signIn();
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens.idToken;

        if (!idToken) {
          throw new Error('No ID token received from Google');
        }

        // Sign in to Firebase to check if new user
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(getFirebaseAuth(), credential);
        isNewUser = !!(userCredential as any)?.additionalUserInfo?.isNewUser;

        // Get Firebase ID token for backend
        idToken = await userCredential.user.getIdToken();
      }

      if (!idToken) {
        throw new Error('No ID token received from Google');
      }

      // Exchange Firebase token for backend JWT
      const response = await this.exchangeFirebaseToken(idToken, AuthProvider.GOOGLE, {
        isNewUser,
      });

      return response;
    } catch (error: any) {
      // Handle cancellation
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('[AuthService] Google sign-in cancelled');
        throw new Error('Sign-in was cancelled');
      }

      if (error.code === statusCodes.DEVELOPER_ERROR) {
        throw new Error(
          'Google OAuth client is not found for this app build. Check Google OAuth client IDs and rebuild the app.',
        );
      }

      console.error('[AuthService] Google sign-in error:', error);
      throw error;
    }
  }

  /**
   * Sign in with Apple
   */
  async signInWithApple(): Promise<AuthResponse> {
    try {
      const isAvailable = await AppleAuthService.isAvailable();

      if (!isAvailable) {
        throw new Error('Apple Sign-In is not available on this device');
      }

      const appleResult = await AppleAuthService.signIn();

      // Exchange Firebase token for backend JWT
      const response = await this.exchangeFirebaseToken(appleResult.idToken, AuthProvider.APPLE, {
        isNewUser: appleResult.isNewUser,
        displayName: appleResult.fullName
          ? `${appleResult.fullName.givenName || ''} ${appleResult.fullName.familyName || ''}`.trim()
          : undefined,
      });

      return response;
    } catch (error) {
      console.error('[AuthService] Apple sign-in error:', error);
      throw error;
    }
  }

  /**
   * Exchange Firebase token for backend JWT
   */
  async exchangeFirebaseToken(
    firebaseToken: string,
    provider: AuthProvider,
    additionalData?: {
      isNewUser?: boolean;
      displayName?: string;
    },
  ): Promise<AuthResponse> {
    try {
      // Call backend to verify and exchange Firebase token for JWT
      // All requests go through the API gateway
      const response = await fetch(`${getBackendConfig().apiGatewayUrl}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: firebaseToken,
          deviceId: this.apiClientManager.deviceId,
          userAgent: `mobile-${Device.osName}-${Device.osVersion}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Token exchange failed');
      }

      const data = await response.json();

      // Token storage and HTTP client update is handled by AuthContext.handleAuthSuccess
      // to avoid duplicate writes

      // Convert response to AuthResponse format
      const authResponse: AuthResponse = {
        token: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          userId: data.user.userId || data.user.id,
          email: data.user.email,
          displayName: data.user.displayName,
          photoURL: data.user.photoUrl,
          isVerified: data.user.isVerified,
          provider,
          firebaseUid: data.user.firebaseUid || data.user.userId || data.user.id,
        },
        isNewUser: additionalData?.isNewUser,
      };

      // Initialize token manager with the new token
      await this.tokenManager.initialize();

      return authResponse;
    } catch (error) {
      console.error('[AuthService] Token exchange error:', error);
      throw new Error('Failed to authenticate with backend');
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      // Use TokenManager for refresh
      const result = await this.tokenManager.refreshToken();

      const refreshedUserId = result.user?.userId || result.user?.id || result.user?.firebaseUid;
      const refreshedUserData = result.user && refreshedUserId
        ? {
            userId: refreshedUserId,
            email: result.user.email ?? null,
            displayName: result.user.displayName ?? null,
            photoURL: result.user.photoURL || result.user.photoUrl || null,
            isVerified: !!result.user.isVerified,
            provider: this.normalizeProvider(result.user.provider),
            firebaseUid: result.user.firebaseUid || refreshedUserId,
          }
        : null;

      // Fallback order: refresh response -> secure storage -> Firebase
      const storedUserData = (await SecureStorage.getUserData()) as AuthUser | null;
      const firebaseUserData = await this.getCurrentUser();
      const userData = refreshedUserData || storedUserData || firebaseUserData;

      if (!userData) {
        throw new Error('No user data available after token refresh');
      }

      await SecureStorage.setUserData(userData);

      return {
        token: result.token,
        refreshToken: result.refreshToken,
        user: userData,
      };
    } catch (error) {
      console.error('[AuthService] Token refresh error:', error);
      throw error;
    }
  }

  private normalizeProvider(provider?: string): AuthProvider {
    if (provider === AuthProvider.GOOGLE) {
      return AuthProvider.GOOGLE;
    }
    if (provider === AuthProvider.APPLE) {
      return AuthProvider.APPLE;
    }
    return AuthProvider.EMAIL;
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      // Sign out from Firebase
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;

      if (currentUser) {
        // Determine provider and sign out accordingly
        const providers = currentUser.providerData.map((p) => p.providerId);

        if (providers.includes('google.com')) {
          await GoogleAuthService.signOut();
        }

        // Sign out from Firebase
        await auth.signOut();
      }

      // Clear tokens from all HTTP clients
      await this.apiClientManager.clearTokens();

      // Clear token manager timers
      this.tokenManager.clearRefreshTimer();

      console.log('[AuthService] User signed out successfully');
    } catch (error) {
      console.error('[AuthService] Sign-out error:', error);
      throw error;
    }
  }

  /**
   * Verify current token
   */
  async verifyToken(): Promise<boolean> {
    try {
      const isValid = await this.tokenManager.validateToken();

      if (!isValid) {
        return false;
      }

      // Also verify with backend
      await this.authController.verifyToken();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const auth = getFirebaseAuth();
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        return null;
      }

      // Get provider
      let provider: AuthProvider = AuthProvider.EMAIL;

      if (firebaseUser.providerData.some((p) => p.providerId === 'google.com')) {
        provider = AuthProvider.GOOGLE;
      } else if (firebaseUser.providerData.some((p) => p.providerId === 'apple.com')) {
        provider = AuthProvider.APPLE;
      }

      return {
        userId: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        isVerified: firebaseUser.emailVerified,
        provider,
        firebaseUid: firebaseUser.uid,
      };
    } catch (error) {
      console.error('[AuthService] Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get current access token
   */
  async getAccessToken(): Promise<string | null> {
    try {
      // Use ApiClientManager's method which handles validation and refresh
      const token = await this.apiClientManager.getValidAccessToken();

      if (!token) {
        // If no stored token, try to get from Firebase
        const auth = getFirebaseAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const idToken = await currentUser.getIdToken();
          return idToken;
        }
      }

      return token;
    } catch (error) {
      console.error('[AuthService] Error getting access token:', error);
      return null;
    }
  }

  /**
   * Set access token for API calls
   */
  setAccessToken(token: string): void {
    this.apiClientManager.setAccessToken(token);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    await EmailAuthService.sendPasswordResetEmail(email);
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(): Promise<void> {
    await EmailAuthService.sendVerificationEmail();
  }

  /**
   * Update password
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await EmailAuthService.updatePassword(currentPassword, newPassword);
  }

  /**
   * Link authentication provider
   */
  async linkProvider(provider: AuthProvider): Promise<void> {
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error('No authenticated user');
    }

    switch (provider) {
      case AuthProvider.GOOGLE:
        await GoogleAuthService.linkAccount(currentUser);
        break;
      case AuthProvider.APPLE:
        await AppleAuthService.linkAccount();
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Unlink authentication provider
   */
  async unlinkProvider(provider: AuthProvider): Promise<void> {
    switch (provider) {
      case AuthProvider.GOOGLE:
        await GoogleAuthService.unlinkAccount();
        break;
      case AuthProvider.APPLE:
        await AppleAuthService.unlinkAccount();
        break;
      case AuthProvider.EMAIL:
        await EmailAuthService.unlinkAccount();
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.tokenManager.cleanup();
  }
}
