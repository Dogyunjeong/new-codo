import { FastifyRequest, FastifyReply } from 'fastify';
import { BaseHandler } from '../base/BaseHandler.mts';

export interface HealthCheckDependency {
  name: string;
  check: () => Promise<boolean>;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  service: string;
  timestamp: string;
  dependencies?: {
    [key: string]: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
    };
  };
}

export class HealthController extends BaseHandler {
  private serviceName: string;
  private dependencies: HealthCheckDependency[];

  constructor(serviceName: string, dependencies: HealthCheckDependency[] = []) {
    super();
    this.serviceName = serviceName;
    this.dependencies = dependencies;
  }

  async healthCheck(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const health: HealthStatus = {
        status: 'healthy',
        service: this.serviceName,
        timestamp: new Date().toISOString()
      };

      // Check dependencies if any
      if (this.dependencies.length > 0) {
        health.dependencies = {};
        
        for (const dep of this.dependencies) {
          const startTime = Date.now();
          try {
            const isHealthy = await dep.check();
            const responseTime = Date.now() - startTime;
            
            health.dependencies[dep.name] = {
              status: isHealthy ? 'healthy' : 'unhealthy',
              responseTime
            };
            
            if (!isHealthy) {
              health.status = 'unhealthy';
            }
          } catch (error) {
            const responseTime = Date.now() - startTime;
            health.dependencies[dep.name] = {
              status: 'unhealthy',
              responseTime
            };
            health.status = 'unhealthy';
          }
        }
      }

      const statusCode = health.status === 'healthy' ? 200 : 503;
      reply.code(statusCode).send(health);
    } catch (error) {
      this.handleError(reply, error, 'health check');
    }
  }

  async readiness(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Simple readiness check - service is ready to accept requests
      reply.code(200).send({
        status: 'ready',
        service: this.serviceName,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(reply, error, 'readiness check');
    }
  }

  async liveness(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // Simple liveness check - service is alive
      reply.code(200).send({
        status: 'alive',
        service: this.serviceName,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(reply, error, 'liveness check');
    }
  }
}