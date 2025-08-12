import { LoggerService } from '../monitoring/Logger.service.mts';

export interface ServiceEndpoint {
  name: string;
  url: string;
  health?: string;
  version?: string;
  metadata?: Record<string, any>;
  lastHealthCheck?: Date;
  isHealthy?: boolean;
}

export interface ServiceRegistryConfig {
  healthCheckInterval?: number; // milliseconds
  unhealthyThreshold?: number; // failed health checks before marking unhealthy
  enableAutoDiscovery?: boolean;
}

export class ServiceRegistryService {
  private services: Map<string, ServiceEndpoint> = new Map();
  private healthCheckInterval?: NodeJS.Timeout;
  private logger: LoggerService;
  private config: Required<ServiceRegistryConfig>;
  private healthCheckCounts: Map<string, number> = new Map();

  constructor(config: ServiceRegistryConfig = {}) {
    this.config = {
      healthCheckInterval: 30000, // 30 seconds
      unhealthyThreshold: 3,
      enableAutoDiscovery: true,
      ...config
    };

    this.logger = new LoggerService('service-registry');
    
    if (this.config.enableAutoDiscovery) {
      this.startHealthChecks();
    }
  }

  // Register a service
  registerService(service: ServiceEndpoint): void {
    this.services.set(service.name, {
      ...service,
      isHealthy: true,
      lastHealthCheck: new Date()
    });

    this.logger.info(`Service registered: ${service.name}`, {
      url: service.url,
      version: service.version
    });
  }

  // Unregister a service
  unregisterService(serviceName: string): void {
    if (this.services.delete(serviceName)) {
      this.healthCheckCounts.delete(serviceName);
      this.logger.info(`Service unregistered: ${serviceName}`);
    }
  }

  // Get service endpoint
  getService(serviceName: string): ServiceEndpoint | undefined {
    return this.services.get(serviceName);
  }

  // Get healthy service endpoint
  getHealthyService(serviceName: string): ServiceEndpoint | undefined {
    const service = this.services.get(serviceName);
    return service?.isHealthy ? service : undefined;
  }

  // Get all services
  getAllServices(): ServiceEndpoint[] {
    return Array.from(this.services.values());
  }

  // Get healthy services
  getHealthyServices(): ServiceEndpoint[] {
    return Array.from(this.services.values()).filter(service => service.isHealthy);
  }

  // Get services by metadata filter
  getServicesByMetadata(filter: Record<string, any>): ServiceEndpoint[] {
    return Array.from(this.services.values()).filter(service => {
      if (!service.metadata) return false;
      
      return Object.entries(filter).every(([key, value]) => 
        service.metadata![key] === value
      );
    });
  }

  // Load balance between multiple instances of the same service
  getServiceWithLoadBalancing(serviceName: string, strategy: 'round-robin' | 'random' = 'round-robin'): ServiceEndpoint | undefined {
    const services = this.getHealthyServices().filter(s => 
      s.name === serviceName || s.name.startsWith(`${serviceName}-`)
    );

    if (services.length === 0) {
      return undefined;
    }

    if (services.length === 1) {
      return services[0];
    }

    switch (strategy) {
      case 'random':
        return services[Math.floor(Math.random() * services.length)];
      case 'round-robin':
      default:
        // Simple round-robin using current timestamp
        const index = Math.floor(Date.now() / 1000) % services.length;
        return services[index];
    }
  }

  // Check service health
  private async checkServiceHealth(service: ServiceEndpoint): Promise<boolean> {
    if (!service.health) {
      return true; // No health endpoint means we assume it's healthy
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(service.health, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (response.ok) {
        this.resetHealthCheckCount(service.name);
        return true;
      } else {
        this.incrementHealthCheckCount(service.name);
        this.logger.warn(`Health check failed for ${service.name}`, {
          status: response.status,
          statusText: response.statusText
        });
        return false;
      }
    } catch (error) {
      this.incrementHealthCheckCount(service.name);
      this.logger.error(`Health check error for ${service.name}`, error instanceof Error ? error : new Error('Unknown error'));
      return false;
    }
  }

  private resetHealthCheckCount(serviceName: string): void {
    this.healthCheckCounts.set(serviceName, 0);
  }

  private incrementHealthCheckCount(serviceName: string): void {
    const current = this.healthCheckCounts.get(serviceName) || 0;
    this.healthCheckCounts.set(serviceName, current + 1);
  }

  private isServiceUnhealthy(serviceName: string): boolean {
    const failCount = this.healthCheckCounts.get(serviceName) || 0;
    return failCount >= this.config.unhealthyThreshold;
  }

  // Start periodic health checks
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      const services = Array.from(this.services.values());
      
      for (const service of services) {
        const isHealthy = await this.checkServiceHealth(service);
        const wasHealthy = service.isHealthy;
        
        service.isHealthy = isHealthy && !this.isServiceUnhealthy(service.name);
        service.lastHealthCheck = new Date();

        // Log status changes
        if (wasHealthy && !service.isHealthy) {
          this.logger.warn(`Service marked as unhealthy: ${service.name}`, {
            failedChecks: this.healthCheckCounts.get(service.name)
          });
        } else if (!wasHealthy && service.isHealthy) {
          this.logger.info(`Service recovered: ${service.name}`);
        }
      }
    }, this.config.healthCheckInterval);

    this.logger.info('Service registry health checks started', {
      interval: this.config.healthCheckInterval,
      threshold: this.config.unhealthyThreshold
    });
  }

  // Stop health checks
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
      this.logger.info('Service registry health checks stopped');
    }
  }

  // Get service registry status
  getStatus(): {
    totalServices: number;
    healthyServices: number;
    unhealthyServices: number;
    services: Array<{
      name: string;
      url: string;
      isHealthy: boolean;
      lastHealthCheck?: Date;
      failedChecks: number;
    }>;
  } {
    const services = Array.from(this.services.values());
    
    return {
      totalServices: services.length,
      healthyServices: services.filter(s => s.isHealthy).length,
      unhealthyServices: services.filter(s => !s.isHealthy).length,
      services: services.map(service => ({
        name: service.name,
        url: service.url,
        isHealthy: service.isHealthy || false,
        lastHealthCheck: service.lastHealthCheck,
        failedChecks: this.healthCheckCounts.get(service.name) || 0
      }))
    };
  }

  // Auto-discover services from environment
  autoDiscoverServices(): void {
    const servicePatterns = [
      'AUTH_SERVICE_URL',
      'PROFILE_SERVICE_URL',
      'POST_SERVICE_URL',
      'NOTIFICATION_SERVICE_URL'
    ];

    servicePatterns.forEach(pattern => {
      const url = process.env[pattern];
      if (url) {
        const serviceName = pattern.replace('_SERVICE_URL', '').toLowerCase().replace('_', '-');
        
        this.registerService({
          name: serviceName,
          url: url,
          health: `${url}/health`,
          metadata: {
            discoveredFrom: 'environment',
            pattern: pattern
          }
        });
      }
    });

    this.logger.info('Auto-discovery completed', {
      discoveredServices: this.services.size
    });
  }

  // Cleanup and shutdown
  shutdown(): void {
    this.stopHealthChecks();
    this.services.clear();
    this.healthCheckCounts.clear();
    this.logger.info('Service registry shutdown complete');
  }
}