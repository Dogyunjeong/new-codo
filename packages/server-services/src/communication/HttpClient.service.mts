import { LoggerService } from '../monitoring/Logger.service.mts';
import { PerformanceMonitorService } from '../monitoring/PerformanceMonitor.service.mts';

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  defaultHeaders?: Record<string, string>;
  retryAttempts?: number;
  retryDelay?: number;
  serviceName?: string;
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

export class HttpClientService {
  private config: Required<HttpClientConfig>;
  private logger: LoggerService;
  private performanceMonitor: PerformanceMonitorService;

  constructor(config: HttpClientConfig) {
    this.config = {
      timeout: 10000,
      defaultHeaders: {},
      retryAttempts: 3,
      retryDelay: 1000,
      serviceName: 'http-client',
      ...config
    };

    this.logger = new LoggerService(this.config.serviceName);
    this.performanceMonitor = new PerformanceMonitorService(this.config.serviceName);
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
        const response = await this.performanceMonitor.monitorServiceCall(
          this.extractServiceName(url),
          path,
          () => this.executeRequest<T>(method, url, data, headers, timeout)
        );

        // Validate status if custom validator provided
        if (requestConfig?.validateStatus && !requestConfig.validateStatus(response.status)) {
          throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
        }

        // Default validation - consider 2xx as success
        if (response.status >= 200 && response.status < 300) {
          this.logger.info(`HTTP ${method} request successful`, {
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
          this.logger.error(`HTTP ${method} request failed after ${maxRetries + 1} attempts`, lastError, {
            url,
            method,
            totalAttempts: maxRetries + 1
          });
          throw lastError;
        }

        this.logger.warn(`HTTP ${method} request failed, retrying (attempt ${attempt + 1}/${maxRetries + 1})`, {
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

  private extractServiceName(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'unknown-service';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Circuit breaker pattern for service health
  private serviceHealth: Map<string, { 
    failures: number; 
    lastFailure: number; 
    circuitOpen: boolean;
    nextAttempt: number;
  }> = new Map();

  private readonly circuitBreakerThreshold = 5;
  private readonly circuitBreakerTimeout = 60000; // 1 minute

  private shouldAllowRequest(serviceName: string): boolean {
    const health = this.serviceHealth.get(serviceName);
    if (!health) return true;

    if (health.circuitOpen) {
      if (Date.now() > health.nextAttempt) {
        // Try to close circuit
        health.circuitOpen = false;
        health.failures = 0;
        this.logger.info(`Circuit breaker closed for service: ${serviceName}`);
        return true;
      }
      return false;
    }

    return true;
  }

  private recordSuccess(serviceName: string): void {
    const health = this.serviceHealth.get(serviceName);
    if (health) {
      health.failures = 0;
      health.circuitOpen = false;
    }
  }

  private recordFailure(serviceName: string): void {
    const health = this.serviceHealth.get(serviceName) || {
      failures: 0,
      lastFailure: 0,
      circuitOpen: false,
      nextAttempt: 0
    };

    health.failures++;
    health.lastFailure = Date.now();

    if (health.failures >= this.circuitBreakerThreshold) {
      health.circuitOpen = true;
      health.nextAttempt = Date.now() + this.circuitBreakerTimeout;
      
      this.logger.warn(`Circuit breaker opened for service: ${serviceName}`, {
        failures: health.failures,
        nextAttempt: new Date(health.nextAttempt).toISOString()
      });
    }

    this.serviceHealth.set(serviceName, health);
  }
}