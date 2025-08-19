import { User } from 'firebase/auth';
import { SecureStorage } from '../storage/SecureStorage';
import { getFirebaseAuth } from '../firebase/firebase.init';
import { AuthController } from '@base/shared-api-controllers';
import { getBackendConfig } from '../../config/firebase.config';
import { AppState, AppStateStatus } from 'react-native';
import * as Device from 'expo-device';

interface TokenPayload {
  userId: string;
  email: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

interface TokenRefreshResult {
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * Token Manager for handling JWT tokens and refresh logic
 */
export class TokenManager {
  private static instance: TokenManager;
  private refreshTimer: NodeJS.Timeout | null = null;
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
  private readonly MIN_REFRESH_INTERVAL = 30 * 1000; // 30 seconds minimum between refreshes
  private lastRefreshTime: number = 0;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<TokenRefreshResult> | null = null;
  private appStateSubscription: any = null;
  private authController: AuthController;
  private deviceId: string;

  private constructor() {
    const backend = getBackendConfig();
    this.authController = new AuthController({ baseURL: backend.authServiceUrl });
    this.deviceId = this.getDeviceId();
    this.setupAppStateListener();
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
   * Get singleton instance
   */
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Initialize token manager with current tokens
   */
  async initialize(): Promise<void> {
    try {
      const token = await SecureStorage.getAuthToken();
      if (token) {
        const expiresIn = this.getTokenExpiry(token);
        if (expiresIn > 0) {
          await this.scheduleTokenRefresh(expiresIn);
        } else {
          // Token expired, try to refresh
          await this.refreshToken();
        }
      }
    } catch (error) {
      console.error('Failed to initialize token manager:', error);
    }
  }

  /**
   * Setup app state listener for token refresh
   */
  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground, check if token needs refresh
        this.checkAndRefreshToken();
      }
    });
  }

  /**
   * Check and refresh token if needed
   */
  private async checkAndRefreshToken(): Promise<void> {
    try {
      const token = await SecureStorage.getAuthToken();
      if (token) {
        const expiresIn = this.getTokenExpiry(token);
        if (expiresIn < this.TOKEN_REFRESH_THRESHOLD) {
          await this.refreshToken();
        }
      }
    } catch (error) {
      console.error('Failed to check and refresh token:', error);
    }
  }

  /**
   * Schedule automatic token refresh
   */
  async scheduleTokenRefresh(expiresIn: number): Promise<void> {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Calculate when to refresh (5 minutes before expiry)
    const refreshTime = Math.max(
      expiresIn - this.TOKEN_REFRESH_THRESHOLD,
      this.MIN_REFRESH_INTERVAL
    );

    console.log(`Scheduling token refresh in ${refreshTime / 1000} seconds`);

    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('Scheduled token refresh failed:', error);
      }
    }, refreshTime);
  }

  /**
   * Refresh the authentication token
   */
  async refreshToken(): Promise<TokenRefreshResult> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      console.log('Token refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    // Check minimum refresh interval
    const now = Date.now();
    if (now - this.lastRefreshTime < this.MIN_REFRESH_INTERVAL) {
      throw new Error('Token refresh attempted too soon');
    }

    this.isRefreshing = true;
    this.lastRefreshTime = now;

    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<TokenRefreshResult> {
    try {
      const refreshToken = await SecureStorage.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('Refreshing token...');

      // Call the backend to refresh the token
      const response = await this.authController.refreshSession({
        refreshToken,
        deviceId: this.deviceId,
      });

      if (!response.data?.token) {
        throw new Error('Invalid refresh response');
      }

      // Store new tokens
      await SecureStorage.setAuthToken(response.data.token);
      if (response.data.refreshToken) {
        await SecureStorage.setRefreshToken(response.data.refreshToken);
      }

      // Calculate expiry time
      const expiresIn = this.getTokenExpiry(response.data.token);

      // Schedule next refresh
      await this.scheduleTokenRefresh(expiresIn);

      console.log('Token refreshed successfully');

      return {
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        expiresIn,
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // Clear stored tokens on refresh failure
      await this.clearTokens();
      
      throw error;
    }
  }

  /**
   * Get token expiry time in milliseconds
   */
  private getTokenExpiry(token: string): number {
    try {
      const payload = this.decodeToken(token);
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      return expiryTime - now;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return 0;
    }
  }

  /**
   * Decode JWT token payload
   */
  decodeToken(token: string): TokenPayload {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  /**
   * Validate token format and expiry
   */
  isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear stored tokens
   */
  async clearTokens(): Promise<void> {
    await SecureStorage.clearAuthToken();
    await SecureStorage.clearRefreshToken();
    this.clearRefreshTimer();
  }

  /**
   * Clear refresh timer
   */
  clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Get current access token
   */
  async getAccessToken(): Promise<string | null> {
    const token = await SecureStorage.getAuthToken();
    
    if (!token) {
      return null;
    }

    // Check if token is still valid
    if (!this.isTokenValid(token)) {
      // Try to refresh
      try {
        const result = await this.refreshToken();
        return result.token;
      } catch (error) {
        console.error('Failed to refresh expired token:', error);
        return null;
      }
    }

    return token;
  }

  /**
   * Set access token (used after login)
   */
  async setAccessToken(token: string, refreshToken?: string): Promise<void> {
    await SecureStorage.setAuthToken(token);
    
    if (refreshToken) {
      await SecureStorage.setRefreshToken(refreshToken);
    }

    // Schedule refresh
    const expiresIn = this.getTokenExpiry(token);
    if (expiresIn > 0) {
      await this.scheduleTokenRefresh(expiresIn);
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.clearRefreshTimer();
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
  }
}