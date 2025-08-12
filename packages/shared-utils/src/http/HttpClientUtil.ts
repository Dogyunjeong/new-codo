// Platform-agnostic HTTP client utility
// Server-specific features should be injected via configuration

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
  // Optional injectable logger
  logger?: ILogger;
}

export interface ILogger {
  error(message: string, error?: any, context?: any): void;
  warn(message: string, context?: any): void;
  info(message: string, context?: any): void;
  debug(message: string, context?: any): void;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  validateStatus?: (status: number) => boolean;
}

export class HttpClientUtil {
  private config: Required<Omit<HttpClientConfig, 'logger'>> & { logger?: ILogger };

  constructor(config: HttpClientConfig) {
    this.config = {
      timeout: 10000,
      defaultHeaders: {},
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };
  }

  async get<T = any>(path: string, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('GET', path, undefined, config);
  }

  async post<T = any>(path: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('POST', path, data, config);
  }

  async put<T = any>(path: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', path, data, config);
  }

  async delete<T = any>(path: string, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', path, undefined, config);
  }

  async patch<T = any>(path: string, data?: any, config?: RequestConfig): Promise<HttpResponse<T>> {
    return this.request<T>('PATCH', path, data, config);
  }

  private async request<T>(
    method: string,
    path: string,
    data?: any,
    requestConfig?: RequestConfig
  ): Promise<HttpResponse<T>> {
    const url = this.buildUrl(path);
    const headers = this.buildHeaders(requestConfig?.headers);
    const timeout = requestConfig?.timeout || this.config.timeout;
    const maxRetries = requestConfig?.retries ?? this.config.retryAttempts;

    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await this.executeRequest<T>(method, url, data, headers, timeout);

        // Validate status if custom validator provided
        if (requestConfig?.validateStatus && !requestConfig.validateStatus(response.status)) {
          throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
        }

        // Default validation - consider 2xx as success
        if (response.status >= 200 && response.status < 300) {
          this.config.logger?.info(`HTTP ${method} request successful`, {
            url,
            status: response.status,
            attempt: attempt + 1
          });
          return response;
        }

        throw new Error(`HTTP ${method} request failed with status ${response.status}: ${response.statusText}`);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxRetries) {
          this.config.logger?.error(`HTTP ${method} request failed after ${maxRetries + 1} attempts`, lastError, {
            url,
            method,
            totalAttempts: maxRetries + 1
          });
          throw lastError;
        }

        this.config.logger?.warn(`HTTP ${method} request failed, retrying (attempt ${attempt + 1}/${maxRetries + 1})`, {
          url,
          method,
          error: lastError.message,
          nextRetryIn: this.config.retryDelay
        });

        await this.delay(this.config.retryDelay * (attempt + 1)); // Exponential backoff
      }
    }

    throw lastError!;
  }

  private async executeRequest<T>(
    method: string,
    url: string,
    data?: any,
    headers?: Record<string, string>,
    timeout?: number
  ): Promise<HttpResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const requestInit: RequestInit = {
        method,
        headers,
        signal: controller.signal,
        body: data ? JSON.stringify(data) : undefined
      };

      const response = await fetch(url, requestInit);
      
      let responseData: T;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text() as any;
      }

      // Convert Headers to plain object
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private buildUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.config.baseURL}${cleanPath}`;
  }

  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...this.config.defaultHeaders,
      ...customHeaders
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Update config methods for runtime changes
  public updateConfig(config: Partial<HttpClientConfig>): void {
    Object.assign(this.config, config);
  }

  public setDefaultHeader(key: string, value: string): void {
    this.config.defaultHeaders[key] = value;
  }

  public removeDefaultHeader(key: string): void {
    delete this.config.defaultHeaders[key];
  }
}