/**
 * ApiClientManager - Centralized management of API clients and auth handling
 *
 * All API calls go through a single API gateway.
 * The gateway routes requests to appropriate microservices:
 * - /api/auth/* → Auth Service
 * - /api/profiles/* → Profile Service
 * - /api/journeys/* → Profile Service
 * - /api/posts/* → Post Service
 * - /api/media/* → Post Service
 * - /api/feed/* → Feed Service
 */

import { HttpRequest, IRequest } from '@base/shared-utils';
import {
  AuthController,
  FeedController,
  PostController,
  ProfileController,
} from '@base/shared-api-controllers';
import { getBackendConfig } from '../../config/firebase.config';
import { SecureStorage } from '../storage/SecureStorage';
import * as Device from 'expo-device';

interface TokenPayload {
  userId: string;
  email: string;
  exp: number;
  iat: number;
}

interface TokenRefreshResult {
  token: string;
  refreshToken?: string;
  user?: any;
}

type AuthErrorHandler = () => void;
type TokenRefreshSuccessHandler = (token: string) => void;

/**
 * Centralized API Client Manager
 * Uses a single API gateway for all service calls
 */
export class ApiClientManager {
  private static instance: ApiClientManager;

  // Single shared HttpRequest for all services (via API gateway)
  private httpRequest: IRequest;

  // Controllers using shared HttpRequest
  private _authController: AuthController;
  private _feedController: FeedController;
  private _postController: PostController;
  private _profileController: ProfileController;

  // Token refresh state
  private isRefreshing = false;
  private refreshPromise: Promise<TokenRefreshResult | null> | null = null;

  // Handlers
  private onAuthError: AuthErrorHandler | null = null;
  private onTokenRefreshSuccess: TokenRefreshSuccessHandler | null = null;

  // Configuration
  private _deviceId: string | null = null;
  private apiGatewayUrl: string;
  private readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    const backendConfig = getBackendConfig();
    this.apiGatewayUrl = backendConfig.apiGatewayUrl;

    console.log('[ApiClientManager] Initializing with API Gateway:', this.apiGatewayUrl);

    // Create single shared HttpRequest instance for all services
    this.httpRequest = new HttpRequest({ baseURL: this.apiGatewayUrl });

    // Create controllers - all use the same HttpRequest (same gateway)
    this._authController = new AuthController({
      baseURL: this.apiGatewayUrl,
      httpRequest: this.httpRequest,
    });

    this._feedController = new FeedController({
      baseURL: this.apiGatewayUrl,
      httpRequest: this.httpRequest,
    });

    this._postController = new PostController({
      baseURL: this.apiGatewayUrl,
      httpRequest: this.httpRequest,
    });

    this._profileController = new ProfileController({
      baseURL: this.apiGatewayUrl,
      httpRequest: this.httpRequest,
    });

    // Setup auth handlers
    this.setupAuthHandlers();
  }

  static getInstance(): ApiClientManager {
    if (!ApiClientManager.instance) {
      ApiClientManager.instance = new ApiClientManager();
    }
    return ApiClientManager.instance;
  }

  /**
   * Get device ID for authentication (stable per app session)
   */
  get deviceId(): string {
    if (!this._deviceId) {
      if (Device.isDevice) {
        this._deviceId = Device.modelId || Device.osBuildId || 'unknown-device';
      } else {
        this._deviceId = 'simulator-' + Math.random().toString(36).substr(2, 9);
      }
    }

    return this._deviceId;
  }

  /**
   * Setup auth handlers on the shared HTTP client
   */
  private setupAuthHandlers(): void {
    const tokenRefreshHandler = async (): Promise<string | null> => {
      const result = await this.handleTokenRefresh();
      return result?.token ?? null;
    };

    const authErrorHandler = (): void => {
      console.log('[ApiClientManager] Auth error, triggering logout');
      if (this.onAuthError) {
        this.onAuthError();
      }
    };

    // Configure the shared HTTP client with auth handlers
    if (this.httpRequest.setTokenRefreshHandler) {
      this.httpRequest.setTokenRefreshHandler(tokenRefreshHandler);
    }
    if (this.httpRequest.setAuthErrorHandler) {
      this.httpRequest.setAuthErrorHandler(authErrorHandler);
    }
  }

  /**
   * Handle token refresh with deduplication
   * Uses direct fetch to avoid HttpRequest interceptor loop
   */
  private async handleTokenRefresh(): Promise<TokenRefreshResult | null> {
    // If already refreshing, wait for result
    if (this.isRefreshing && this.refreshPromise) {
      console.log('[ApiClientManager] Token refresh in progress, waiting...');
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;

      if (result) {
        // Update HTTP client with new token
        this.setAccessToken(result.token);

        // Notify success handler
        if (this.onTokenRefreshSuccess) {
          this.onTokenRefreshSuccess(result.token);
        }
      }
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform actual token refresh using direct fetch
   * This bypasses HttpRequest interceptors to avoid circular dependency
   */
  private async performTokenRefresh(): Promise<TokenRefreshResult | null> {
    try {
      const refreshToken = await SecureStorage.getRefreshToken();

      if (!refreshToken) {
        console.error('[ApiClientManager] No refresh token available');
        return null;
      }

      console.log('[ApiClientManager] Refreshing token via gateway...');

      // Use direct fetch to bypass HttpRequest interceptor
      // All auth calls go through the gateway at /api/auth/*
      const response = await fetch(`${this.apiGatewayUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken,
          deviceId: this.deviceId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ApiClientManager] Refresh failed:', response.status, errorData);
        return null;
      }

      const data = await response.json();

      if (!data.accessToken && !data.token) {
        console.error('[ApiClientManager] Invalid refresh response');
        return null;
      }

      const newToken = data.accessToken || data.token;
      const newRefreshToken = data.refreshToken;

      // Store new tokens
      await SecureStorage.setAuthToken(newToken);
      if (newRefreshToken) {
        await SecureStorage.setRefreshToken(newRefreshToken);
      }

      console.log('[ApiClientManager] Token refreshed successfully');

      return {
        token: newToken,
        refreshToken: newRefreshToken,
        user: data.user,
      };
    } catch (error) {
      console.error('[ApiClientManager] Token refresh error:', error);
      return null;
    }
  }

  /**
   * Decode JWT token payload
   */
  private decodeToken(token: string): TokenPayload | null {
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
      return null;
    }
  }

  /**
   * Check if token is valid and not expired
   */
  isTokenValid(token: string): boolean {
    const payload = this.decodeToken(token);

    if (!payload) {
      return false;
    }

    const now = Date.now() / 1000;
    return payload.exp > now;
  }

  /**
   * Check if token will expire soon (within threshold)
   */
  isTokenExpiringSoon(token: string): boolean {
    const payload = this.decodeToken(token);

    if (!payload) {
      return true;
    }

    const now = Date.now();
    const expiryTime = payload.exp * 1000;
    return expiryTime - now < this.TOKEN_REFRESH_THRESHOLD;
  }

  /**
   * Get time until token expiry in milliseconds
   */
  getTokenExpiry(token: string): number {
    const payload = this.decodeToken(token);

    if (!payload) {
      return 0;
    }

    const now = Date.now();
    const expiryTime = payload.exp * 1000;
    return Math.max(0, expiryTime - now);
  }

  /**
   * Set access token on the shared HTTP client
   */
  setAccessToken(token: string): void {
    console.log('[ApiClientManager] Setting access token');
    this.httpRequest.setAccessToken(token);
  }

  /**
   * Clear access token
   */
  clearAccessToken(): void {
    this.httpRequest.clearAccessToken?.();
  }

  /**
   * Set auth error handler (called when refresh fails)
   */
  setAuthErrorHandler(handler: AuthErrorHandler): void {
    this.onAuthError = handler;
  }

  /**
   * Set token refresh success handler
   */
  setTokenRefreshSuccessHandler(handler: TokenRefreshSuccessHandler): void {
    this.onTokenRefreshSuccess = handler;
  }

  /**
   * Get valid access token, refreshing if needed
   */
  async getValidAccessToken(): Promise<string | null> {
    const token = await SecureStorage.getAuthToken();

    if (!token) {
      return null;
    }

    // If token is valid and not expiring soon, return it
    if (this.isTokenValid(token) && !this.isTokenExpiringSoon(token)) {
      return token;
    }

    // Token expired or expiring soon, try to refresh
    console.log('[ApiClientManager] Token expired or expiring soon, refreshing...');
    const refreshed = await this.handleTokenRefresh();
    return refreshed?.token ?? null;
  }

  /**
   * Manually trigger token refresh
   */
  async refreshToken(): Promise<TokenRefreshResult | null> {
    return this.handleTokenRefresh();
  }

  /**
   * Clear all stored tokens
   */
  async clearTokens(): Promise<void> {
    await SecureStorage.clearAuthToken();
    await SecureStorage.clearRefreshToken();
    this.clearAccessToken();
  }

  // Controller getters
  get authController(): AuthController {
    return this._authController;
  }

  get feedController(): FeedController {
    return this._feedController;
  }

  get postController(): PostController {
    return this._postController;
  }

  get profileController(): ProfileController {
    return this._profileController;
  }

  // For debugging
  getDebugInfo(): object {
    return {
      isRefreshing: this.isRefreshing,
      deviceId: this.deviceId,
      apiGatewayUrl: this.apiGatewayUrl,
    };
  }
}

export default ApiClientManager;
