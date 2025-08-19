import { TokenManager } from '../auth/TokenManager';
import { SecureStorage } from '../storage/SecureStorage';
import { getDefaultHeaders } from '../../config/app.config';

export interface RequestConfig {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  timeout?: number;
  retry?: boolean;
  maxRetries?: number;
}

export interface InterceptorHandlers {
  onRequest?: (config: RequestConfig) => Promise<RequestConfig>;
  onResponse?: (response: Response) => Promise<Response>;
  onError?: (error: any) => Promise<any>;
  onTokenRefresh?: () => Promise<void>;
  onAuthenticationRequired?: () => void;
}

/**
 * Auth Interceptor for API requests
 * Handles authentication headers, token refresh, and retry logic
 */
export class AuthInterceptor {
  private static instance: AuthInterceptor;
  private tokenManager: TokenManager;
  private handlers: InterceptorHandlers = {};
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  private constructor() {
    this.tokenManager = TokenManager.getInstance();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): AuthInterceptor {
    if (!AuthInterceptor.instance) {
      AuthInterceptor.instance = new AuthInterceptor();
    }
    return AuthInterceptor.instance;
  }

  /**
   * Set interceptor handlers
   */
  setHandlers(handlers: InterceptorHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Intercept and modify request before sending
   */
  async interceptRequest(config: RequestConfig): Promise<RequestConfig> {
    try {
      // Add default headers
      config.headers = {
        ...getDefaultHeaders(),
        ...config.headers,
      };

      // Add authorization header if token exists
      const token = await this.tokenManager.getValidToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add device ID if available
      const deviceId = await SecureStorage.getItem('@ziririt:device_id');
      if (deviceId) {
        config.headers['X-Device-ID'] = deviceId;
      }

      // Call custom handler if provided
      if (this.handlers.onRequest) {
        config = await this.handlers.onRequest(config);
      }

      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  }

  /**
   * Intercept and handle response
   */
  async interceptResponse(response: Response, originalConfig: RequestConfig): Promise<Response> {
    try {
      // Call custom handler if provided
      if (this.handlers.onResponse) {
        response = await this.handlers.onResponse(response);
      }

      // Handle 401 Unauthorized
      if (response.status === 401) {
        return await this.handleUnauthorized(response, originalConfig);
      }

      // Handle other error statuses
      if (!response.ok) {
        return await this.handleErrorResponse(response, originalConfig);
      }

      return response;
    } catch (error) {
      console.error('Response interceptor error:', error);
      throw error;
    }
  }

  /**
   * Handle 401 Unauthorized response
   */
  private async handleUnauthorized(
    response: Response,
    originalConfig: RequestConfig
  ): Promise<Response> {
    try {
      // Check if token refresh is already in progress
      if (this.isRefreshing) {
        return await this.waitForTokenRefresh(originalConfig);
      }

      this.isRefreshing = true;

      // Try to refresh token
      try {
        const result = await this.tokenManager.refreshToken();
        
        // Notify all waiting requests
        this.onTokenRefreshed(result.token);
        
        // Retry original request with new token
        return await this.retryRequest(originalConfig, result.token);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear tokens and trigger re-authentication
        await this.tokenManager.clearTokens();
        
        // Notify handler that authentication is required
        if (this.handlers.onAuthenticationRequired) {
          this.handlers.onAuthenticationRequired();
        }
        
        throw new Error('Authentication required. Please log in again.');
      } finally {
        this.isRefreshing = false;
        this.refreshSubscribers = [];
      }
    } catch (error) {
      console.error('Error handling unauthorized response:', error);
      throw error;
    }
  }

  /**
   * Wait for token refresh to complete
   */
  private async waitForTokenRefresh(config: RequestConfig): Promise<Response> {
    return new Promise((resolve, reject) => {
      this.refreshSubscribers.push(async (token: string) => {
        try {
          const response = await this.retryRequest(config, token);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Notify waiting requests that token has been refreshed
   */
  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token));
  }

  /**
   * Retry request with new token
   */
  private async retryRequest(config: RequestConfig, token: string): Promise<Response> {
    // Update authorization header with new token
    const updatedConfig = {
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      },
    };

    // Make the request
    return await this.makeRequest(updatedConfig);
  }

  /**
   * Handle error responses (non-401)
   */
  private async handleErrorResponse(
    response: Response,
    config: RequestConfig
  ): Promise<Response> {
    // Check if retry is enabled
    if (config.retry === false) {
      return response;
    }

    // Check retry conditions
    const shouldRetry = this.shouldRetry(response.status, config);
    if (!shouldRetry) {
      return response;
    }

    // Retry with exponential backoff
    const retryCount = (config as any).__retryCount || 0;
    const maxRetries = config.maxRetries || this.MAX_RETRIES;

    if (retryCount < maxRetries) {
      const delay = this.RETRY_DELAY * Math.pow(2, retryCount);
      console.log(`Retrying request (attempt ${retryCount + 1}/${maxRetries}) after ${delay}ms`);
      
      await this.delay(delay);
      
      // Update retry count
      (config as any).__retryCount = retryCount + 1;
      
      // Retry the request
      return await this.makeRequest(config);
    }

    return response;
  }

  /**
   * Determine if request should be retried
   */
  private shouldRetry(status: number, config: RequestConfig): boolean {
    // Retry on network errors and 5xx server errors
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    
    // Don't retry if explicitly disabled
    if (config.retry === false) {
      return false;
    }

    // Don't retry non-idempotent methods by default
    if (['POST', 'PUT', 'DELETE'].includes(config.method.toUpperCase())) {
      return config.retry === true && retryableStatuses.includes(status);
    }

    return retryableStatuses.includes(status);
  }

  /**
   * Make HTTP request
   */
  private async makeRequest(config: RequestConfig): Promise<Response> {
    const { url, method, headers, body, params, timeout } = config;

    // Build URL with query params
    let requestUrl = url;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      requestUrl += (url.includes('?') ? '&' : '?') + queryString;
    }

    // Prepare request options
    const options: RequestInit = {
      method,
      headers,
    };

    // Add body if present
    if (body) {
      if (headers?.['Content-Type']?.includes('application/json')) {
        options.body = JSON.stringify(body);
      } else if (body instanceof FormData) {
        options.body = body;
        // Remove Content-Type header for FormData (browser sets it)
        delete options.headers?.['Content-Type'];
      } else {
        options.body = body;
      }
    }

    // Add timeout if specified
    if (timeout) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      options.signal = controller.signal;

      try {
        const response = await fetch(requestUrl, options);
        clearTimeout(timeoutId);
        return response;
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
      }
    }

    return await fetch(requestUrl, options);
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute request with interceptors
   */
  async execute(config: RequestConfig): Promise<Response> {
    try {
      // Intercept request
      const interceptedConfig = await this.interceptRequest(config);

      // Make request
      const response = await this.makeRequest(interceptedConfig);

      // Intercept response
      return await this.interceptResponse(response, interceptedConfig);
    } catch (error: any) {
      // Handle errors
      if (this.handlers.onError) {
        return await this.handlers.onError(error);
      }
      throw error;
    }
  }

  /**
   * Helper method for JSON requests
   */
  async fetchJSON<T = any>(config: RequestConfig): Promise<T> {
    const response = await this.execute({
      ...config,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...config.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Helper methods for common HTTP methods
   */
  async get<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    return this.fetchJSON<T>({ url, method: 'GET', params });
  }

  async post<T = any>(url: string, body?: any, params?: Record<string, any>): Promise<T> {
    return this.fetchJSON<T>({ url, method: 'POST', body, params });
  }

  async put<T = any>(url: string, body?: any, params?: Record<string, any>): Promise<T> {
    return this.fetchJSON<T>({ url, method: 'PUT', body, params });
  }

  async delete<T = any>(url: string, params?: Record<string, any>): Promise<T> {
    return this.fetchJSON<T>({ url, method: 'DELETE', params });
  }

  async patch<T = any>(url: string, body?: any, params?: Record<string, any>): Promise<T> {
    return this.fetchJSON<T>({ url, method: 'PATCH', body, params });
  }
}