import { FastifyRequest, FastifyReply } from 'fastify';
import { LoggerService, MetricsService, PerformanceMonitorService } from '@base/shared-services';

export interface MonitoringConfig {
  serviceName: string;
  enableRequestLogging?: boolean;
  enableMetrics?: boolean;
  enablePerformanceMonitoring?: boolean;
  logRequestBodies?: boolean;
  logResponseBodies?: boolean;
  slowRequestThresholdMs?: number;
}

export class MonitoringMiddleware {
  private logger: LoggerService;
  private metrics: MetricsService;
  private performanceMonitor: PerformanceMonitorService;
  private config: Required<MonitoringConfig>;

  constructor(config: MonitoringConfig) {
    this.config = {
      enableRequestLogging: true,
      enableMetrics: true,
      enablePerformanceMonitoring: true,
      logRequestBodies: false,
      logResponseBodies: false,
      slowRequestThresholdMs: 1000,
      ...config
    };

    this.logger = new LoggerService(config.serviceName);
    this.metrics = new MetricsService(config.serviceName);
    this.performanceMonitor = new PerformanceMonitorService(config.serviceName);
  }

  // Request monitoring middleware
  requestMonitoring = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const startTime = Date.now();
    const operationId = `request_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
    const requestId = request.id || operationId;

    // Add request context to request object
    (request as any).monitoring = {
      operationId,
      requestId,
      startTime
    };

    const context = {
      requestId,
      method: request.method,
      path: request.url,
      userAgent: request.headers['user-agent'],
      userId: (request as any).user?.userId,
      ip: request.ip
    };

    // Log incoming request
    if (this.config.enableRequestLogging) {
      this.logger.logRequest(request.method, request.url, {
        ...context,
        body: this.config.logRequestBodies ? request.body : undefined
      });
    }

    // Start performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.performanceMonitor.startOperation(operationId, 'http_request', context);
    }

    // TODO: Implement proper response monitoring with Fastify hooks
    // Temporarily disabled to prevent reply.addHook errors
  };

  // Error monitoring middleware
  errorMonitoring = async (error: Error, request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const context = {
      requestId: (request as any).monitoring?.requestId,
      method: request.method,
      path: request.url,
      userId: (request as any).user?.userId,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    };

    // Log error
    this.logger.error(`Request error: ${error.message}`, error, context);

    // Record error metrics
    if (this.config.enableMetrics) {
      this.metrics.incrementCounter('errors_total', 1, {
        path: request.url,
        method: request.method,
        error_type: error.name
      });
    }

    // End performance monitoring with error
    const operationId = (request as any).monitoring?.operationId;
    if (operationId && this.config.enablePerformanceMonitoring) {
      this.performanceMonitor.endOperation(operationId, false, {
        error: error.message
      });
    }
  };

  // Business operation monitoring
  monitorBusinessOperation<T>(
    operationType: string,
    entityType: string
  ) {
    return async (operation: () => Promise<T>): Promise<T> => {
      return this.performanceMonitor.monitorBusinessOperation(
        operationType,
        entityType,
        operation
      );
    };
  }

  // Database operation monitoring
  monitorDatabaseOperation<T>(
    operation: string,
    table: string
  ) {
    return async (query: () => Promise<T>): Promise<T> => {
      return this.performanceMonitor.monitorDatabaseOperation(
        operation,
        table,
        query
      );
    };
  }

  // Service call monitoring
  monitorServiceCall<T>(
    targetService: string,
    endpoint: string
  ) {
    return async (call: () => Promise<T>): Promise<T> => {
      return this.performanceMonitor.monitorServiceCall(
        targetService,
        endpoint,
        call
      );
    };
  }

  // Get metrics endpoint handler
  getMetricsHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const metrics = this.metrics.exportMetrics();
      const performanceStats = this.performanceMonitor.getPerformanceStats();
      
      reply.code(200).send({
        ...metrics,
        performance: {
          activeOperations: performanceStats.activeOperations,
          slowOperations: performanceStats.slowOperations
        }
      });
    } catch (error) {
      this.logger.error('Failed to export metrics', error instanceof Error ? error : new Error('Unknown error'));
      reply.code(500).send({ error: 'Failed to export metrics' });
    }
  };

  // Health check with monitoring data
  getMonitoringHealthHandler = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const performanceStats = this.performanceMonitor.getPerformanceStats();
      const memUsage = process.memoryUsage();
      
      const health = {
        status: 'healthy' as const,
        service: this.config.serviceName,
        timestamp: new Date().toISOString(),
        monitoring: {
          activeOperations: performanceStats.activeOperations,
          slowOperations: performanceStats.slowOperations.length,
          memory: {
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
            external: Math.round(memUsage.external / 1024 / 1024),
            rss: Math.round(memUsage.rss / 1024 / 1024)
          }
        }
      };

      // Check if service is under stress
      if (performanceStats.activeOperations > 100 || performanceStats.slowOperations.length > 10) {
        (health as any).status = 'degraded';
      }

      reply.code(200).send(health);
    } catch (error) {
      this.logger.error('Failed to generate monitoring health check', error instanceof Error ? error : new Error('Unknown error'));
      reply.code(503).send({
        status: 'unhealthy',
        service: this.config.serviceName,
        timestamp: new Date().toISOString(),
        error: 'Failed to generate health check'
      });
    }
  };

  // Start system monitoring
  startSystemMonitoring(intervalMs: number = 30000): NodeJS.Timeout {
    return this.performanceMonitor.startSystemMonitoring(intervalMs);
  }

  // Cleanup stale operations
  startOperationCleanup(intervalMs: number = 60000): NodeJS.Timeout {
    return setInterval(() => {
      this.performanceMonitor.cleanupStaleOperations();
    }, intervalMs);
  }
}