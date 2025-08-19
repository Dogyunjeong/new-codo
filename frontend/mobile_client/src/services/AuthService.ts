import { AuthController } from '@base/shared-api-controllers';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { Platform, NativeModules } from 'react-native';
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
import { TokenManager } from './auth/TokenManager';
import { SecureStorage } from './storage/SecureStorage';
import { getBackendConfig, getAppSettings, getOAuthConfig } from '../config/firebase.config';
import * as Device from 'expo-device';

export interface AuthUser {
  userId: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  isVerified: boolean;
  provider: 'email' | 'google' | 'apple';
  firebaseUid?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: AuthUser;
  isNewUser?: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
}

export class AuthService {
  private static instance: AuthService;
  private authController: AuthController;
  private tokenManager: TokenManager;
  private deviceId: string;
  private authStateUnsubscribe: (() => void) | null = null;

  private constructor() {
    const backend = getBackendConfig();
    this.authController = new AuthController({ baseURL: backend.authServiceUrl });
    this.tokenManager = TokenManager.getInstance();
    this.deviceId = this.getDeviceId();
    this.initializeAuthListener();
    this.configureGoogleSignIn();
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
            'Google Sign-In: native module not available (Expo Go or missing). Skipping configuration.',
          );
        }
        return;
      }

      // For development/testing, use mock if no OAuth config
      if (__DEV__ && (!config.googleWebClientId || config.googleWebClientId === '')) {
        console.log('Google Sign-In: Using mock mode in development');
        return;
      }

      GoogleSignin.configure({
        webClientId: config.googleWebClientId,
        iosClientId: config.googleIosClientId,
        offlineAccess: true,
        hostedDomain: '', // Use empty string to allow any domain
        forceCodeForRefreshToken: true,
      });

      console.log('Google Sign-In configured with native module');
    } catch (error) {
      console.error('Error configuring Google Sign-In:', error);
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
   * Get device ID for authentication
   */
  private getDeviceId(): string {
    if (Device.isDevice) {
      return Device.modelId || Device.osBuildId || 'unknown-device';
    }
    return 'simulator-' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Initialize Firebase auth state listener
   */
  private initializeAuthListener(): void {
    const auth = getFirebaseAuth();
    this.authStateUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log('Firebase auth state changed: User signed in', firebaseUser.email);
        // Token refresh will be handled by TokenManager
      } else {
        console.log('Firebase auth state changed: User signed out');
      }
    });
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthResponse> {
    try {
      // Sign in with Firebase first
      const firebaseResult = await EmailAuthService.signIn(email, password);

      // Exchange Firebase token for backend JWT
      const response = await this.exchangeFirebaseToken(firebaseResult.idToken, AuthProvider.EMAIL);

      return response;
    } catch (error: any) {
      console.error('Email sign-in error:', error);

      // Fallback to mock in development if enabled
      if (__DEV__ && getAppSettings().mockAuthEnabled) {
        console.warn('Using mock authentication for development');
        return this.getMockAuthResponse(email, 'Test User');
      }

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
      const response = await this.exchangeFirebaseToken(
        firebaseResult.idToken,
        AuthProvider.EMAIL,
        {
          isNewUser: true,
          displayName: data.displayName,
        },
      );

      return response;
    } catch (error: any) {
      console.error('Email sign-up error:', error);

      // Fallback to mock in development if enabled
      if (__DEV__ && getAppSettings().mockAuthEnabled) {
        console.warn('Using mock signup for development');
        return this.getMockAuthResponse(data.email, data.displayName || 'New User', false);
      }

      throw error;
    }
  }

  /**
   * Sign in with Google using native Google Sign-In module
   * Tries One-Tap Sign-In first on Android, then falls back to regular sign-in
   */
  async signInWithGoogle(useOneTap: boolean = true): Promise<AuthResponse> {
    try {
      const hasNativeModule = !!(NativeModules as any)?.RNGoogleSignin;
      if (!hasNativeModule) {
        throw new Error(
          'Google Sign-In is not available in Expo Go. Please build and run a development client.',
        );
      }
      let idToken: string | undefined;
      let isNewUser = false;

      // Try One-Tap Sign-In first if requested (Android only)
      if (useOneTap && Platform.OS === 'android') {
        try {
          const response = await GoogleOneTapSignIn.signIn({
            webClientId: getOAuthConfig().googleWebClientId,
          });

          if (isSuccessResponse(response)) {
            idToken = response.data.idToken;
          } else if (isNoSavedCredentialFoundResponse(response)) {
            // Fall back to regular sign-in
            console.log('No saved credentials for One-Tap, using regular sign-in');
          }
        } catch (error) {
          console.log('One-Tap sign-in not available, falling back to regular sign-in');
        }
      }

      // If One-Tap didn't work or wasn't attempted, use regular sign-in
      if (!idToken) {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        const tokens = await GoogleSignin.getTokens();
        idToken = tokens.idToken;

        if (!idToken) {
          throw new Error('No ID token received from Google');
        }

        // Sign in to Firebase to check if new user
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(getFirebaseAuth(), credential);
        isNewUser = userCredential.additionalUserInfo?.isNewUser || false;

        // Get Firebase ID token for backend
        idToken = await userCredential.user.getIdToken();
      }

      // Exchange Firebase token for backend JWT
      const response = await this.exchangeFirebaseToken(idToken, AuthProvider.GOOGLE, {
        isNewUser,
      });

      return response;
    } catch (error: any) {
      // Handle cancellation
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Google sign-in cancelled');
        throw new Error('Sign-in was cancelled');
      }

      console.error('Google sign-in error:', error);

      // Fallback to mock in development if enabled
      if (__DEV__ && getAppSettings().mockAuthEnabled) {
        console.warn('Using mock Google authentication for development');
        return this.getMockAuthResponse('mockuser@gmail.com', 'Mock Google User');
      }

      throw error;
    }
  }

  /**
   * Sign in with Apple
   */
  async signInWithApple(): Promise<AuthResponse> {
    try {
      // Check availability and sign in with Apple
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
      console.error('Apple sign-in error:', error);
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
      const response = await fetch(`${getBackendConfig().authServiceUrl}/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: firebaseToken,
          deviceId: this.deviceId,
          userAgent: `mobile-${Device.osName}-${Device.osVersion}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Token exchange failed');
      }

      const data = await response.json();

      // Store tokens in secure storage
      await SecureStorage.setAuthToken(data.accessToken);
      if (data.refreshToken) {
        await SecureStorage.setRefreshToken(data.refreshToken);
      }

      // Convert response to AuthResponse format
      const authResponse: AuthResponse = {
        token: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          userId: data.user.id,
          email: data.user.email,
          displayName: data.user.displayName,
          photoURL: data.user.photoUrl,
          isVerified: data.user.isVerified,
          provider,
          firebaseUid: data.user.firebaseUid,
        },
        isNewUser: additionalData?.isNewUser,
      };

      // Initialize token manager with the new token
      await this.tokenManager.initialize();

      return authResponse;
    } catch (error) {
      console.error('Token exchange error:', error);
      throw new Error('Failed to authenticate with backend');
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken?: string): Promise<AuthResponse> {
    try {
      // Use TokenManager for refresh
      const result = await this.tokenManager.refreshToken();

      // Get current user data
      const userData = await this.getCurrentUser();

      return {
        token: result.token,
        refreshToken: result.refreshToken,
        user: userData,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
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

        // Apple doesn't require specific sign-out

        // Sign out from Firebase
        await auth.signOut();
      }

      // Clear tokens
      await this.tokenManager.clearTokens();

      // Call backend logout if we have a refresh token
      try {
        const refreshToken = await this.tokenManager.getRefreshToken();
        if (refreshToken) {
          await this.authController.logout(refreshToken);
        }
      } catch (error) {
        // Continue even if backend logout fails
        console.error('Backend logout error:', error);
      }

      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }

  /**
   * Verify current token
   */
  async verifyToken(): Promise<boolean> {
    try {
      const isValid = await this.tokenManager.validateToken();
      if (!isValid) return false;

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

      if (!firebaseUser) return null;

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
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Set access token for API calls
   */
  setAccessToken(token: string): void {
    this.authController.setAccessToken(token);
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
   * Get mock auth response for development
   */
  private getMockAuthResponse(
    email: string,
    displayName: string,
    isVerified: boolean = true,
  ): AuthResponse {
    // Generate proper JWT-formatted mock tokens
    const now = Math.floor(Date.now() / 1000);
    const userId = 'mock-user-' + Math.random().toString(36).substr(2, 9);
    
    // Create mock JWT payload
    const payload = {
      userId,
      email,
      exp: now + 3600, // 1 hour expiry
      iat: now,
      iss: 'mock-auth-service',
    };
    
    // Create mock JWT token (base64 encoded but not signed)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const signature = 'mock-signature';
    const mockToken = `${header}.${body}.${signature}`;
    
    // Create mock refresh token
    const refreshPayload = {
      userId,
      exp: now + 86400 * 7, // 7 days expiry
      iat: now,
      type: 'refresh',
    };
    const refreshBody = btoa(JSON.stringify(refreshPayload));
    const mockRefreshToken = `${header}.${refreshBody}.${signature}`;
    
    return {
      token: mockToken,
      refreshToken: mockRefreshToken,
      user: {
        userId,
        email,
        displayName,
        isVerified,
        provider: AuthProvider.EMAIL,
      },
      isNewUser: !isVerified,
    };
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.authStateUnsubscribe) {
      this.authStateUnsubscribe();
      this.authStateUnsubscribe = null;
    }
    this.tokenManager.cleanup();
  }
}
