// Platform-agnostic logger utility
// Can be used in browser, Node.js, or React Native environments

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogContext {
  service?: string;
  requestId?: string;
  userId?: string;
  operation?: string;
  duration?: number;
  [key: string]: any;
}

export interface ILogOutput {
  log(level: LogLevel, message: string, context?: LogContext, error?: Error): void;
}

// Default console output that works in all JavaScript environments
export class ConsoleLogOutput implements ILogOutput {
  log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    };

    const logString = JSON.stringify(logData);

    switch (level) {
      case LogLevel.ERROR:
        console.error(logString);
        break;
      case LogLevel.WARN:
        console.warn(logString);
        break;
      case LogLevel.INFO:
        console.info(logString);
        break;
      case LogLevel.DEBUG:
        console.debug(logString);
        break;
    }
  }
}

export class LoggerUtil {
  private serviceName: string;
  private logLevel: LogLevel;
  private output: ILogOutput;

  constructor(
    serviceName: string,
    logLevel: LogLevel = LogLevel.INFO,
    output?: ILogOutput
  ) {
    this.serviceName = serviceName;
    this.logLevel = logLevel;
    this.output = output || new ConsoleLogOutput();
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  error(message: string, error?: Error | any, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    
    const errorObj = error instanceof Error ? error : 
                    error ? new Error(String(error)) : undefined;
    
    this.output.log(LogLevel.ERROR, message, {
      service: this.serviceName,
      ...context
    }, errorObj);
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    this.output.log(LogLevel.WARN, message, {
      service: this.serviceName,
      ...context
    });
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    this.output.log(LogLevel.INFO, message, {
      service: this.serviceName,
      ...context
    });
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    this.output.log(LogLevel.DEBUG, message, {
      service: this.serviceName,
      ...context
    });
  }

  // Simple timer utility
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

  // Factory method to create child loggers
  createChild(childName: string): LoggerUtil {
    return new LoggerUtil(
      `${this.serviceName}:${childName}`,
      this.logLevel,
      this.output
    );
  }

  // Update configuration at runtime
  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  setOutput(output: ILogOutput): void {
    this.output = output;
  }
}