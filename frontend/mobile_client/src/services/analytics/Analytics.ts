/**
 * Analytics Service
 */

export enum EventCategory {
  AUTH = 'AUTH',
  SECURITY = 'SECURITY',
  ERROR = 'ERROR',
  PERFORMANCE = 'PERFORMANCE',
  USER_ACTION = 'USER_ACTION',
}

export enum EventType {
  TRACK = 'TRACK',
  SCREEN = 'SCREEN',
  IDENTIFY = 'IDENTIFY',
}

interface TrackEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface ScreenEvent {
  name: string;
  properties?: Record<string, any>;
}

interface IdentifyEvent {
  userId: string;
  traits?: Record<string, any>;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: TrackEvent[] = [];
  private enabled = true;
  
  private constructor() {
    this.initialize();
  }
  
  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }
  
  private async initialize() {
    // Initialize analytics providers (Firebase Analytics, etc.)
    if (__DEV__) {
      console.log('Analytics initialized in development mode');
    }
  }
  
  /**
   * Track an event
   */
  track(event: TrackEvent) {
    if (!this.enabled) return;
    
    this.events.push(event);
    
    if (__DEV__) {
      console.log('Analytics Event:', event);
    }
    
    // Send to analytics provider
    this.sendEvent(event);
  }
  
  /**
   * Track screen view
   */
  screen(event: ScreenEvent) {
    if (!this.enabled) return;
    
    if (__DEV__) {
      console.log('Screen View:', event);
    }
    
    // Send to analytics provider
    this.sendScreenEvent(event);
  }
  
  /**
   * Identify user
   */
  identify(event: IdentifyEvent) {
    if (!this.enabled) return;
    
    if (__DEV__) {
      console.log('Identify User:', event.userId);
    }
    
    // Send to analytics provider
    this.sendIdentifyEvent(event);
  }
  
  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
  
  /**
   * Get event count
   */
  async getCount(action: string): Promise<number> {
    return this.events.filter(e => e.action === action).length;
  }
  
  /**
   * Clear events (for testing)
   */
  clearEvents() {
    this.events = [];
  }
  
  /**
   * Send event to analytics provider
   */
  private async sendEvent(event: TrackEvent) {
    try {
      // Implement actual analytics provider integration here
      // e.g., Firebase Analytics, Segment, Mixpanel, etc.
      
      if (__DEV__) {
        // In development, just log the event
        return;
      }
      
      // Production analytics implementation
      // await firebaseAnalytics.logEvent(event.action, {
      //   category: event.category,
      //   label: event.label,
      //   value: event.value,
      //   ...event.metadata,
      // });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }
  
  /**
   * Send screen event to analytics provider
   */
  private async sendScreenEvent(event: ScreenEvent) {
    try {
      // Implement screen tracking
      // await firebaseAnalytics.logScreenView({
      //   screen_name: event.name,
      //   ...event.properties,
      // });
    } catch (error) {
      console.error('Failed to send screen event:', error);
    }
  }
  
  /**
   * Send identify event to analytics provider
   */
  private async sendIdentifyEvent(event: IdentifyEvent) {
    try {
      // Implement user identification
      // await firebaseAnalytics.setUserId(event.userId);
      // await firebaseAnalytics.setUserProperties(event.traits);
    } catch (error) {
      console.error('Failed to send identify event:', error);
    }
  }
}

// Export singleton instance
export const Analytics = AnalyticsService.getInstance();