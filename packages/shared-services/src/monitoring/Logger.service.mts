interface LogContext {
  service: string;
  requestId?: string;
  userId?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn', 
  INFO = 'info',
  DEBUG = 'debug'
}

export class LoggerService {
  private serviceName: string;
  private logLevel: LogLevel;

  constructor(serviceName: string, logLevel: LogLevel = LogLevel.INFO) {
    this.serviceName = serviceName;
    this.logLevel = logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logContext = {
      service: this.serviceName,
      ...context
    };

    return JSON.stringify({
      timestamp,
      level,
      message,
      context: logContext
    });
  }

  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const errorContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };

    console.error(this.formatLog(LogLevel.ERROR, message, errorContext));
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    console.warn(this.formatLog(LogLevel.WARN, message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    console.info(this.formatLog(LogLevel.INFO, message, context));
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    console.debug(this.formatLog(LogLevel.DEBUG, message, context));
  }

  // Performance logging
  startTimer(operation: string, context?: LogContext): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.info(`Operation completed: ${operation}`, {
        ...context,
        operation,
        duration
      });
    };
  }

  // Request logging
  logRequest(method: string, path: string, context?: LogContext): void {
    this.info(`Incoming request: ${method} ${path}`, {
      ...context,
      method,
      path,
      type: 'request'
    });
  }

  logResponse(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
    const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    const message = `Request completed: ${method} ${path} - ${statusCode}`;
    
    if (level === LogLevel.ERROR) {
      this.error(message, undefined, {
        ...context,
        method,
        path,
        statusCode,
        duration,
        type: 'response'
      });
    } else {
      this.info(message, {
        ...context,
        method,
        path,
        statusCode,
        duration,
        type: 'response'
      });
    }
  }

  // Database operation logging
  logDatabaseOperation(operation: string, table: string, duration: number, context?: LogContext): void {
    this.debug(`Database operation: ${operation} on ${table}`, {
      ...context,
      operation,
      table,
      duration,
      type: 'database'
    });
  }

  // Service-to-service communication logging
  logServiceCall(targetService: string, endpoint: string, duration: number, statusCode?: number, context?: LogContext): void {
    const message = `Service call: ${targetService}${endpoint}`;
    const logContext = {
      ...context,
      targetService,
      endpoint,
      duration,
      statusCode,
      type: 'service_call'
    };

    if (statusCode && statusCode >= 400) {
      this.error(message, undefined, logContext);
    } else {
      this.info(message, logContext);
    }
  }

  // Business logic logging
  logBusinessEvent(event: string, entityId?: string, context?: LogContext): void {
    this.info(`Business event: ${event}`, {
      ...context,
      event,
      entityId,
      type: 'business_event'
    });
  }
}