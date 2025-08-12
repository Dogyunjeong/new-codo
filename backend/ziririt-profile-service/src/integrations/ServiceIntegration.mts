import { 
  ServiceRegistryService, 
  ServiceClientFactory,
  AuthServiceClient,
  PostServiceClient,
  LoggerService
} from '@base/server-services';

export class ServiceIntegrationManager {
  private serviceRegistry: ServiceRegistryService;
  private clientFactory: ServiceClientFactory;
  private authClient: AuthServiceClient;
  private postClient: PostServiceClient;
  private logger: LoggerService;

  constructor() {
    this.logger = new LoggerService('profile-service-integration');

    // Initialize service registry
    this.serviceRegistry = new ServiceRegistryService({
      healthCheckInterval: 30000,
      unhealthyThreshold: 3,
      enableAutoDiscovery: true
    });

    // Register external services
    this.registerExternalServices();

    // Initialize service clients
    this.clientFactory = new ServiceClientFactory(this.serviceRegistry, {
      timeout: 10000,
      retryAttempts: 3
    });

    this.authClient = new AuthServiceClient(this.serviceRegistry);
    this.postClient = new PostServiceClient(this.serviceRegistry);
  }

  private registerExternalServices(): void {
    // Register auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4101';
    this.serviceRegistry.registerService({
      name: 'auth',
      url: authServiceUrl,
      health: `${authServiceUrl}/health`,
      version: '1.0.0',
      metadata: {
        type: 'authentication',
        capabilities: ['oauth', 'jwt', 'refresh']
      }
    });

    // Register post service
    const postServiceUrl = process.env.POST_SERVICE_URL || 'http://localhost:4103';
    this.serviceRegistry.registerService({
      name: 'post',
      url: postServiceUrl,
      health: `${postServiceUrl}/health`,
      version: '1.0.0',
      metadata: {
        type: 'content',
        capabilities: ['posts', 'media', 'interactions']
      }
    });

    // Auto-discover other services from environment
    this.serviceRegistry.autoDiscoverServices();
    
    this.logger.info('External services registered', {
      authService: authServiceUrl,
      postService: postServiceUrl
    });
  }

  // Service integration methods
  async validateUserToken(accessToken: string): Promise<{
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
      this.logger.error('Token validation failed', error instanceof Error ? error : new Error('Unknown error'));
      return { valid: false };
    }
  }

  async getUserPosts(userId: string, page: number = 1, limit: number = 20): Promise<any> {
    try {
      return await this.postClient.getUserPosts(userId, page, limit);
    } catch (error) {
      this.logger.error('Failed to get user posts', error instanceof Error ? error : new Error('Unknown error'));
      return { items: [], pagination: { page, limit, hasMore: false } };
    }
  }

  // Direct HTTP notification methods (simpler than events)
  async notifyPostServiceOfProfileUpdate(userId: string, profileData: any): Promise<boolean> {
    try {
      await this.postClient.patch(`/users/${userId}/profile`, profileData);
      this.logger.info('Profile update notification sent to post service', { userId });
      return true;
    } catch (error) {
      this.logger.warn('Failed to notify post service of profile update', { 
        userId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }

  async notifyAuthServiceOfProfileChange(userId: string, changes: any): Promise<boolean> {
    try {
      await this.authClient.patch(`/users/${userId}/profile-sync`, changes);
      this.logger.info('Profile change notification sent to auth service', { userId });
      return true;
    } catch (error) {
      this.logger.warn('Failed to notify auth service of profile change', { 
        userId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }

  // Health and monitoring methods
  async getServiceHealth(): Promise<{
    serviceRegistry: any;
    externalServices: any;
  }> {
    const serviceRegistryStatus = this.serviceRegistry.getStatus();
    
    const externalServices = {
      auth: await this.authClient.isServiceAvailable(),
      post: await this.postClient.isServiceAvailable()
    };

    return {
      serviceRegistry: serviceRegistryStatus,
      externalServices
    };
  }

  // Simple database notification patterns (alternative to events)
  async createDatabaseNotification(type: string, data: any): Promise<void> {
    // This could trigger database triggers or simple webhook calls
    this.logger.info('Database notification created', { type, data });
    
    // Example: Could insert into a notifications table
    // await this.db.query('INSERT INTO notifications (type, data) VALUES ($1, $2)', [type, JSON.stringify(data)]);
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down service integrations...');
    
    this.serviceRegistry.shutdown();
    
    this.logger.info('Service integrations shutdown complete');
  }
}

// Singleton instance
let serviceIntegrationInstance: ServiceIntegrationManager | null = null;

export function getServiceIntegration(): ServiceIntegrationManager {
  if (!serviceIntegrationInstance) {
    serviceIntegrationInstance = new ServiceIntegrationManager();
  }
  return serviceIntegrationInstance;
}

export async function shutdownServiceIntegration(): Promise<void> {
  if (serviceIntegrationInstance) {
    await serviceIntegrationInstance.shutdown();
    serviceIntegrationInstance = null;
  }
}