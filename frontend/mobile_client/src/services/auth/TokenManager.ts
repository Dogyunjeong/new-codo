/**
 * TokenManager - Handles JWT token lifecycle and scheduling
 *
 * This is a simplified TokenManager that delegates actual refresh operations
 * to ApiClientManager. It focuses on:
 * - Token validation
 * - Scheduling automatic refresh
 * - App state handling
 */

import { AppState, AppStateStatus } from 'react-native';
import { SecureStorage } from '../storage/SecureStorage';
import { ApiClientManager } from '../api/ApiClientManager';

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
  user?: any;
}

/**
 * Token Manager for handling JWT token lifecycle
 */
export class TokenManager {
  private static instance: TokenManager;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes before expiry
  private readonly MIN_REFRESH_INTERVAL = 30 * 1000; // 30 seconds minimum between refreshes
  private appStateSubscription: any = null;
  private apiClientManager: ApiClientManager;

  private constructor() {
    this.apiClientManager = ApiClientManager.getInstance();
    this.setupAppStateListener();
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

      if (!token) {
        console.log('[TokenManager] No token found, skipping initialization');
        return;
      }

      // Set token on all HTTP clients
      this.apiClientManager.setAccessToken(token);

      // Schedule refresh based on token expiry
      const expiresIn = this.getTokenExpiry(token);

      if (expiresIn > 0) {
        await this.scheduleTokenRefresh(expiresIn);
      } else {
        // Token expired, try to refresh immediately
        console.log('[TokenManager] Token expired, attempting immediate refresh');
        await this.refreshToken();
      }
    } catch (error) {
      console.error('[TokenManager] Failed to initialize:', error);
    }
  }

  /**
   * Setup app state listener for token refresh
   */
  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          // App came to foreground, check if token needs refresh
          this.checkAndRefreshToken();
        }
      }
    );
  }

  /**
   * Check and refresh token if needed
   */
  private async checkAndRefreshToken(): Promise<void> {
    try {
      const token = await SecureStorage.getAuthToken();

      if (!token) {
        return;
      }

      const expiresIn = this.getTokenExpiry(token);

      if (expiresIn < this.TOKEN_REFRESH_THRESHOLD) {
        console.log('[TokenManager] Token expiring soon, refreshing on app foreground');
        await this.refreshToken();
      }
    } catch (error) {
      console.error('[TokenManager] Failed to check and refresh token:', error);
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

    console.log(`[TokenManager] Scheduling token refresh in ${refreshTime / 1000} seconds`);

    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshToken();
      } catch (error) {
        console.error('[TokenManager] Scheduled token refresh failed:', error);
      }
    }, refreshTime);
  }

  /**
   * Refresh the authentication token
   * Delegates to ApiClientManager to avoid circular dependencies
   */
  async refreshToken(): Promise<TokenRefreshResult> {
    console.log('[TokenManager] Refreshing token...');

    const result = await this.apiClientManager.refreshToken();

    if (!result) {
      throw new Error('Token refresh failed');
    }

    // Schedule next refresh
    const expiresIn = this.getTokenExpiry(result.token);
    await this.scheduleTokenRefresh(expiresIn);

    return {
      token: result.token,
      refreshToken: result.refreshToken,
      expiresIn,
      user: result.user,
    };
  }

  /**
   * Get token expiry time in milliseconds
   */
  private getTokenExpiry(token: string): number {
    try {
      const payload = this.decodeToken(token);
      const expiryTime = payload.exp * 1000;
      const now = Date.now();
      return expiryTime - now;
    } catch (error) {
      console.error('[TokenManager] Failed to decode token:', error);
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
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
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
    await this.apiClientManager.clearTokens();
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
   * Get current access token (with validation and auto-refresh if needed)
   */
  async getAccessToken(): Promise<string | null> {
    return this.apiClientManager.getValidAccessToken();
  }

  /**
   * Get a valid token, attempting refresh if needed
   */
  async getValidToken(): Promise<string | null> {
    return this.apiClientManager.getValidAccessToken();
  }

  /**
   * Get stored refresh token
   */
  async getRefreshToken(): Promise<string | null> {
    return SecureStorage.getRefreshToken();
  }

  /**
   * Validate current access token
   */
  async validateToken(): Promise<boolean> {
    const token = await SecureStorage.getAuthToken();

    if (!token) {
      return false;
    }

    return this.isTokenValid(token);
  }

  /**
   * Set access token (used after login)
   */
  async setAccessToken(token: string, refreshToken?: string): Promise<void> {
    await SecureStorage.setAuthToken(token);

    if (refreshToken) {
      await SecureStorage.setRefreshToken(refreshToken);
    }

    // Update all HTTP clients
    this.apiClientManager.setAccessToken(token);

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
