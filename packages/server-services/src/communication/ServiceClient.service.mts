import { HttpClientService, HttpResponse, RequestConfig } from './HttpClient.service.mts';
import { ServiceRegistryService } from './ServiceRegistry.service.mts';
import { LoggerService } from '../monitoring/Logger.service.mts';

export interface ServiceClientConfig {
  serviceName: string;
  registry: ServiceRegistryService;
  timeout?: number;
  retryAttempts?: number;
  enableCircuitBreaker?: boolean;
  defaultHeaders?: Record<string, string>;
}

export interface AuthTokenProvider {
  getAccessToken(): Promise<string | null>;
}

export class ServiceClientService {
  private httpClient: HttpClientService;
  private registry: ServiceRegistryService;
  private logger: LoggerService;
  private config: ServiceClientConfig;
  private authTokenProvider?: AuthTokenProvider;

  constructor(config: ServiceClientConfig) {
    this.config = config;
    this.registry = config.registry;
    this.logger = new LoggerService(`service-client-${config.serviceName}`);

    // Get service endpoint from registry
    const serviceEndpoint = this.registry.getHealthyService(config.serviceName);
    if (!serviceEndpoint) {
      throw new Error(`Service not found in registry: ${config.serviceName}`);
    }

    this.httpClient = new HttpClientService({
      baseURL: serviceEndpoint.url,
      timeout: config.timeout || 10000,
      retryAttempts: config.retryAttempts || 3,
      defaultHeaders: config.defaultHeaders || {},
      serviceName: config.serviceName
    });

    this.logger.info(`Service client initialized for: ${config.serviceName}`, {
      baseURL: serviceEndpoint.url
    });
  }

  // Set authentication token provider
  setAuthTokenProvider(provider: AuthTokenProvider): void {
    this.authTokenProvider = provider;
  }

  // Generic request method with service discovery
  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    path: string,
    data?: any,
    config?: RequestConfig
  ): Promise<HttpResponse<T>> {
    // Get fresh service endpoint (for load balancing or failover)
    const serviceEndpoint = this.registry.getServiceWithLoadBalancing(this.config.serviceName);
    if (!serviceEndpoint) {
      throw new Error(`No healthy service instances available: ${this.config.serviceName}`);
    }

    // Update client base URL if it changed
    if (serviceEndpoint.url !== this.httpClient['config'].baseURL) {
      this.httpClient = new HttpClientService({
        ...this.httpClient['config'],
        baseURL: serviceEndpoint.url
      });
    }

    // Add authentication headers if available
    const headers = { ...config?.headers };
    if (this.authTokenProvider) {
      try {
        const token = await this.authTokenProvider.getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        this.logger.warn('Failed to get access token', { error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    const requestConfig = { ...config, headers };

    switch (method) {
      case 'GET':
        return this.httpClient.get<T>(path, requestConfig);
      case 'POST':
        return this.httpClient.post<T>(path, data, requestConfig);
      case 'PUT':
        return this.httpClient.put<T>(path, data, requestConfig);
      case 'DELETE':
        return this.httpClient.delete<T>(path, requestConfig);
      case 'PATCH':
        return this.httpClient.patch<T>(path, data, requestConfig);
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  }

  // Convenience methods
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

  // Check if service is available
  async isServiceAvailable(): Promise<boolean> {
    const service = this.registry.getHealthyService(this.config.serviceName);
    return service !== undefined;
  }

  // Get service health status
  async getServiceHealth(): Promise<any> {
    try {
      const response = await this.get('/health');
      return response.data;
    } catch (error) {
      this.logger.error('Failed to get service health', error instanceof Error ? error : new Error('Unknown error'));
      return null;
    }
  }
}

// Factory for creating service clients
export class ServiceClientFactory {
  private registry: ServiceRegistryService;
  private authTokenProvider?: AuthTokenProvider;
  private defaultConfig: Partial<ServiceClientConfig>;

  constructor(
    registry: ServiceRegistryService,
    defaultConfig: Partial<ServiceClientConfig> = {}
  ) {
    this.registry = registry;
    this.defaultConfig = defaultConfig;
  }

  setAuthTokenProvider(provider: AuthTokenProvider): void {
    this.authTokenProvider = provider;
  }

  createClient(serviceName: string, config: Partial<ServiceClientConfig> = {}): ServiceClientService {
    const client = new ServiceClientService({
      serviceName,
      registry: this.registry,
      ...this.defaultConfig,
      ...config
    });

    if (this.authTokenProvider) {
      client.setAuthTokenProvider(this.authTokenProvider);
    }

    return client;
  }

  // Pre-configured service clients
  createAuthServiceClient(): ServiceClientService {
    return this.createClient('auth');
  }

  createProfileServiceClient(): ServiceClientService {
    return this.createClient('profile');
  }

  createPostServiceClient(): ServiceClientService {
    return this.createClient('post');
  }

  createNotificationServiceClient(): ServiceClientService {
    return this.createClient('notification');
  }
}

// Domain-specific API clients
export class AuthServiceClient extends ServiceClientService {
  constructor(registry: ServiceRegistryService, config: Partial<ServiceClientConfig> = {}) {
    super({
      serviceName: 'auth',
      registry,
      ...config
    });
  }

  async authenticateWithGoogle(idToken: string): Promise<any> {
    const response = await this.post('/auth/google', { idToken });
    return response.data;
  }

  async authenticateWithApple(identityToken: string): Promise<any> {
    const response = await this.post('/auth/apple', { identityToken });
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const response = await this.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async validateToken(accessToken: string): Promise<any> {
    const response = await this.post('/auth/validate', { accessToken });
    return response.data;
  }
}

export class ProfileServiceClient extends ServiceClientService {
  constructor(registry: ServiceRegistryService, config: Partial<ServiceClientConfig> = {}) {
    super({
      serviceName: 'profile',
      registry,
      ...config
    });
  }

  async getProfile(userId: string): Promise<any> {
    const response = await this.get(`/profiles/${userId}`);
    return response.data;
  }

  async updateProfile(userId: string, profileData: any): Promise<any> {
    const response = await this.put(`/profiles/${userId}`, profileData);
    return response.data;
  }

  async getUserGoals(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    const response = await this.get(`/goals/user/${userId}`, {
      headers: {
        'X-Page': page.toString(),
        'X-Limit': limit.toString()
      }
    });
    return response.data;
  }

  async followUser(targetUserId: string): Promise<any> {
    const response = await this.post(`/social/follow/${targetUserId}`);
    return response.data;
  }
}

export class PostServiceClient extends ServiceClientService {
  constructor(registry: ServiceRegistryService, config: Partial<ServiceClientConfig> = {}) {
    super({
      serviceName: 'post',
      registry,
      ...config
    });
  }

  async createPost(postData: any): Promise<any> {
    const response = await this.post('/posts', postData);
    return response.data;
  }

  async getPost(postId: string): Promise<any> {
    const response = await this.get(`/posts/${postId}`);
    return response.data;
  }

  async getUserPosts(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    const response = await this.get(`/posts/user/${userId}`, {
      headers: {
        'X-Page': page.toString(),
        'X-Limit': limit.toString()
      }
    });
    return response.data;
  }

  async likePost(postId: string): Promise<any> {
    const response = await this.post(`/interactions/posts/${postId}/like`);
    return response.data;
  }

  async addComment(postId: string, commentData: any): Promise<any> {
    const response = await this.post(`/interactions/posts/${postId}/comments`, commentData);
    return response.data;
  }
}