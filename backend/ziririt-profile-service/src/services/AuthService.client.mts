import { ServiceRegistryService, AuthServiceClient, ServiceClientFactory } from '@base/server-services';

export class AuthServiceClientManager {
  private registry: ServiceRegistryService;
  private clientFactory: ServiceClientFactory;
  private authClient: AuthServiceClient;

  constructor() {
    // Initialize service registry
    this.registry = new ServiceRegistryService({
      healthCheckInterval: 30000,
      unhealthyThreshold: 3,
      enableAutoDiscovery: true
    });

    // Register auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4101';
    this.registry.registerService({
      name: 'auth',
      url: authServiceUrl,
      health: `${authServiceUrl}/health`,
      version: '1.0.0',
      metadata: {
        type: 'authentication',
        capabilities: ['oauth', 'jwt', 'refresh']
      }
    });

    // Initialize client factory
    this.clientFactory = new ServiceClientFactory(this.registry, {
      timeout: 10000,
      retryAttempts: 3
    });

    // Create auth service client
    this.authClient = new AuthServiceClient(this.registry);
  }

  // Validate JWT token with auth service
  async validateToken(accessToken: string): Promise<{
    valid: boolean;
    userId?: string;
    email?: string;
    displayName?: string;
  }> {
    try {
      const response = await this.authClient.validateToken(accessToken);
      return {
        valid: true,
        userId: response.userId,
        email: response.email,
        displayName: response.displayName
      };
    } catch (error) {
      console.error('Token validation failed:', error);
      return { valid: false };
    }
  }

  // Get user information from auth service
  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await this.authClient.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }

  // Check if auth service is available
  async isAuthServiceAvailable(): Promise<boolean> {
    return this.authClient.isServiceAvailable();
  }

  // Get service registry status
  getServiceStatus() {
    return this.registry.getStatus();
  }

  // Shutdown connections
  shutdown(): void {
    this.registry.shutdown();
  }
}