import { LoggerService } from './Logger.service.mts';
import { MetricsService } from './Metrics.service.mts';

interface PerformanceEntry {
  operation: string;
  startTime: number;
  context?: Record<string, any>;
}

export class PerformanceMonitorService {
  private logger: LoggerService;
  private metrics: MetricsService;
  private activeOperations: Map<string, PerformanceEntry> = new Map();
  private alertThresholds: Map<string, number> = new Map();

  constructor(serviceName: string) {
    this.logger = new LoggerService(serviceName);
    this.metrics = new MetricsService(serviceName);
    
    // Set default alert thresholds (in milliseconds)
    this.alertThresholds.set('database_query', 1000);
    this.alertThresholds.set('http_request', 5000);
    this.alertThresholds.set('service_call', 3000);
    this.alertThresholds.set('business_operation', 2000);
  }

  // Start timing an operation
  startOperation(operationId: string, operationType: string, context?: Record<string, any>): void {
    this.activeOperations.set(operationId, {
      operation: operationType,
      startTime: Date.now(),
      context
    });

    this.logger.debug(`Started operation: ${operationType}`, {
      operationId,
      ...context
    });
  }

  // End timing an operation and record metrics
  endOperation(operationId: string, success: boolean = true, additionalContext?: Record<string, any>): number {
    const entry = this.activeOperations.get(operationId);
    if (!entry) {
      this.logger.warn(`Attempted to end unknown operation: ${operationId}`);
      return 0;
    }

    const duration = Date.now() - entry.startTime;
    const context = { ...entry.context, ...additionalContext };

    // Record metrics
    this.metrics.recordHistogram(`${entry.operation}_duration_ms`, duration, {
      success: success.toString(),
      ...context
    });

    this.metrics.incrementCounter(`${entry.operation}_total`, 1, {
      success: success.toString(),
      ...context
    });

    // Log completion
    const level = success ? 'info' : 'error';
    this.logger[level](`Completed operation: ${entry.operation}`, {
      operationId,
      duration,
      success,
      ...context
    });

    // Check for performance alerts
    this.checkPerformanceAlert(entry.operation, duration, context);

    this.activeOperations.delete(operationId);
    return duration;
  }

  // Convenience method for timing a function
  async timeOperation<T>(
    operationType: string,
    operation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const operationId = `${operationType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.startOperation(operationId, operationType, context);
    
    try {
      const result = await operation();
      this.endOperation(operationId, true);
      return result;
    } catch (error) {
      this.endOperation(operationId, false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Synchronous version for non-async operations
  timeSync<T>(
    operationType: string,
    operation: () => T,
    context?: Record<string, any>
  ): T {
    const operationId = `${operationType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.startOperation(operationId, operationType, context);
    
    try {
      const result = operation();
      this.endOperation(operationId, true);
      return result;
    } catch (error) {
      this.endOperation(operationId, false, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  // Database operation monitoring
  async monitorDatabaseOperation<T>(
    operation: string,
    table: string,
    query: () => Promise<T>
  ): Promise<T> {
    return this.timeOperation('database_query', query, {
      operation,
      table
    });
  }

  // HTTP request monitoring
  async monitorHttpRequest<T>(
    method: string,
    path: string,
    handler: () => Promise<T>
  ): Promise<T> {
    return this.timeOperation('http_request', handler, {
      method,
      path
    });
  }

  // Service call monitoring
  async monitorServiceCall<T>(
    targetService: string,
    endpoint: string,
    call: () => Promise<T>
  ): Promise<T> {
    return this.timeOperation('service_call', call, {
      target_service: targetService,
      endpoint
    });
  }

  // Business operation monitoring
  async monitorBusinessOperation<T>(
    operationType: string,
    entityType: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const result = await this.timeOperation('business_operation', operation, {
      operation_type: operationType,
      entity_type: entityType
    });

    // Record business event
    this.metrics.recordBusinessEvent(operationType, entityType);
    
    return result;
  }

  // Set performance alert thresholds
  setAlertThreshold(operationType: string, thresholdMs: number): void {
    this.alertThresholds.set(operationType, thresholdMs);
  }

  // Check if operation exceeded threshold and alert
  private checkPerformanceAlert(operationType: string, duration: number, context?: Record<string, any>): void {
    const threshold = this.alertThresholds.get(operationType);
    if (threshold && duration > threshold) {
      this.logger.warn(`Performance alert: ${operationType} took ${duration}ms (threshold: ${threshold}ms)`, {
        duration,
        threshold,
        operationType,
        ...context
      });

      this.metrics.incrementCounter('performance_alerts_total', 1, {
        operation_type: operationType,
        threshold: threshold.toString()
      });
    }
  }

  // System resource monitoring
  startSystemMonitoring(intervalMs: number = 30000): NodeJS.Timeout {
    return setInterval(() => {
      this.metrics.recordMemoryUsage();
      
      // Record active operations count
      this.metrics.setGauge('active_operations_count', this.activeOperations.size);
      
      // Log system stats periodically
      const memUsage = process.memoryUsage();
      this.logger.info('System metrics recorded', {
        memory_heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
        memory_heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
        active_operations: this.activeOperations.size
      });
    }, intervalMs);
  }

  // Get current performance statistics
  getPerformanceStats(): {
    activeOperations: number;
    metrics: any;
    slowOperations: Array<{
      operationId: string;
      operation: string;
      duration: number;
      context?: Record<string, any>;
    }>;
  } {
    const now = Date.now();
    const slowOperations = Array.from(this.activeOperations.entries())
      .filter(([_, entry]) => now - entry.startTime > 5000) // Operations running for more than 5 seconds
      .map(([operationId, entry]) => ({
        operationId,
        operation: entry.operation,
        duration: now - entry.startTime,
        context: entry.context
      }));

    return {
      activeOperations: this.activeOperations.size,
      metrics: this.metrics.exportMetrics(),
      slowOperations
    };
  }

  // Cleanup long-running operations (should be called periodically)
  cleanupStaleOperations(maxAgeMs: number = 300000): void { // 5 minutes default
    const now = Date.now();
    const staleOperations: string[] = [];

    this.activeOperations.forEach((entry, operationId) => {
      if (now - entry.startTime > maxAgeMs) {
        staleOperations.push(operationId);
        
        this.logger.warn(`Cleaning up stale operation: ${entry.operation}`, {
          operationId,
          duration: now - entry.startTime,
          operation: entry.operation,
          context: entry.context
        });
      }
    });

    staleOperations.forEach(id => this.activeOperations.delete(id));
  }
}