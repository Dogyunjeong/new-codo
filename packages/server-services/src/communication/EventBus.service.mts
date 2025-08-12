import { LoggerService } from '../monitoring/Logger.service.mts';

export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}

export interface EventHandler<T = any> {
  handle(event: DomainEvent<T>): Promise<void>;
  eventType: string;
  serviceName: string;
}

export interface EventBusConfig {
  serviceName: string;
  enablePersistence?: boolean;
  enableRetry?: boolean;
  maxRetryAttempts?: number;
  retryDelayMs?: number;
}

export class EventBusService {
  private handlers: Map<string, EventHandler[]> = new Map();
  private logger: LoggerService;
  private config: Required<EventBusConfig>;
  private eventStore: DomainEvent[] = []; // Simple in-memory store
  private processingQueue: DomainEvent[] = [];
  private isProcessing = false;

  constructor(config: EventBusConfig) {
    this.config = {
      enablePersistence: true,
      enableRetry: true,
      maxRetryAttempts: 3,
      retryDelayMs: 1000,
      ...config
    };

    this.logger = new LoggerService(`event-bus-${config.serviceName}`);
    this.startEventProcessing();
  }

  // Register an event handler
  subscribe<T = any>(handler: EventHandler<T>): void {
    const eventType = handler.eventType;
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);

    this.logger.info(`Event handler registered`, {
      eventType,
      serviceName: handler.serviceName,
      totalHandlers: handlers.length
    });
  }

  // Unregister an event handler
  unsubscribe(handler: EventHandler): void {
    const eventType = handler.eventType;
    const handlers = this.handlers.get(eventType) || [];
    const index = handlers.indexOf(handler);
    
    if (index > -1) {
      handlers.splice(index, 1);
      this.handlers.set(eventType, handlers);
      
      this.logger.info(`Event handler unregistered`, {
        eventType,
        serviceName: handler.serviceName,
        remainingHandlers: handlers.length
      });
    }
  }

  // Publish an event
  async publish(event: Omit<DomainEvent, 'id' | 'timestamp'>): Promise<void> {
    const domainEvent: DomainEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      ...event
    };

    this.logger.info(`Publishing event`, {
      eventId: domainEvent.id,
      eventType: domainEvent.type,
      aggregateId: domainEvent.aggregateId,
      aggregateType: domainEvent.aggregateType
    });

    // Store event if persistence is enabled
    if (this.config.enablePersistence) {
      this.eventStore.push(domainEvent);
    }

    // Add to processing queue
    this.processingQueue.push(domainEvent);
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processEvents();
    }
  }

  // Process events from the queue
  private async processEvents(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const event = this.processingQueue.shift()!;
      await this.processEvent(event);
    }

    this.isProcessing = false;
  }

  // Process a single event
  private async processEvent(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    
    if (handlers.length === 0) {
      this.logger.debug(`No handlers found for event type: ${event.type}`, {
        eventId: event.id
      });
      return;
    }

    const promises = handlers.map(handler => this.executeHandler(handler, event));
    await Promise.allSettled(promises);
  }

  // Execute an event handler with retry logic
  private async executeHandler(handler: EventHandler, event: DomainEvent): Promise<void> {
    let attempt = 0;
    const maxAttempts = this.config.enableRetry ? this.config.maxRetryAttempts : 1;

    while (attempt < maxAttempts) {
      try {
        await handler.handle(event);
        
        this.logger.debug(`Event handled successfully`, {
          eventId: event.id,
          eventType: event.type,
          handlerService: handler.serviceName,
          attempt: attempt + 1
        });
        
        return; // Success, exit retry loop
      } catch (error) {
        attempt++;
        
        this.logger.error(`Event handler failed`, error instanceof Error ? error : new Error('Unknown error'), {
          eventId: event.id,
          eventType: event.type,
          handlerService: handler.serviceName,
          attempt,
          maxAttempts
        });

        if (attempt < maxAttempts) {
          // Wait before retry
          await this.delay(this.config.retryDelayMs * attempt);
        } else {
          // Max attempts reached, log final failure
          this.logger.error(`Event handler failed permanently after ${maxAttempts} attempts`, error instanceof Error ? error : new Error('Unknown error'), {
            eventId: event.id,
            eventType: event.type,
            handlerService: handler.serviceName
          });
        }
      }
    }
  }

  // Get all events for an aggregate
  getEventsForAggregate(aggregateId: string, aggregateType?: string): DomainEvent[] {
    return this.eventStore.filter(event => 
      event.aggregateId === aggregateId && 
      (!aggregateType || event.aggregateType === aggregateType)
    ).sort((a, b) => a.version - b.version);
  }

  // Get events by type
  getEventsByType(eventType: string): DomainEvent[] {
    return this.eventStore.filter(event => event.type === eventType)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Get recent events
  getRecentEvents(limit: number = 100): DomainEvent[] {
    return this.eventStore
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get event bus statistics
  getStatistics(): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    handlersByType: Record<string, number>;
    queueSize: number;
    isProcessing: boolean;
  } {
    const eventsByType: Record<string, number> = {};
    const handlersByType: Record<string, number> = {};

    this.eventStore.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    this.handlers.forEach((handlers, eventType) => {
      handlersByType[eventType] = handlers.length;
    });

    return {
      totalEvents: this.eventStore.size,
      eventsByType,
      handlersByType,
      queueSize: this.processingQueue.length,
      isProcessing: this.isProcessing
    };
  }

  // Start background event processing
  private startEventProcessing(): void {
    // Process events every 100ms if there are any in queue
    setInterval(() => {
      if (this.processingQueue.length > 0 && !this.isProcessing) {
        this.processEvents();
      }
    }, 100);
  }

  // Utility methods
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cleanup
  shutdown(): void {
    this.handlers.clear();
    this.processingQueue.length = 0;
    this.logger.info('Event bus shutdown complete');
  }
}

// Domain event types for the application
export const EventTypes = {
  // User events
  USER_REGISTERED: 'user.registered',
  USER_PROFILE_UPDATED: 'user.profile.updated',
  USER_FOLLOWED: 'user.followed',
  USER_UNFOLLOWED: 'user.unfollowed',

  // Goal events
  GOAL_CREATED: 'goal.created',
  GOAL_UPDATED: 'goal.updated',
  GOAL_COMPLETED: 'goal.completed',
  GOAL_DELETED: 'goal.deleted',

  // Post events
  POST_CREATED: 'post.created',
  POST_UPDATED: 'post.updated',
  POST_DELETED: 'post.deleted',
  POST_LIKED: 'post.liked',
  POST_UNLIKED: 'post.unliked',
  POST_COMMENTED: 'post.commented',

  // System events
  SERVICE_STARTED: 'service.started',
  SERVICE_STOPPED: 'service.stopped',
  SERVICE_HEALTH_CHANGED: 'service.health.changed',
} as const;

// Base event handler class
export abstract class BaseEventHandler<T = any> implements EventHandler<T> {
  abstract eventType: string;
  abstract serviceName: string;
  protected logger: LoggerService;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
    this.logger = new LoggerService(`event-handler-${serviceName}`);
  }

  abstract handle(event: DomainEvent<T>): Promise<void>;

  protected logEventReceived(event: DomainEvent<T>): void {
    this.logger.info(`Received event: ${event.type}`, {
      eventId: event.id,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType
    });
  }
}