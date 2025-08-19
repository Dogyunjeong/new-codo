/**
 * Authentication Monitoring and Analytics
 */

import { Analytics, EventType, EventCategory } from '../analytics/Analytics';

export class AuthMonitoring {
  private static instance: AuthMonitoring;
  
  private constructor() {}
  
  static getInstance(): AuthMonitoring {
    if (!AuthMonitoring.instance) {
      AuthMonitoring.instance = new AuthMonitoring();
    }
    return AuthMonitoring.instance;
  }
  
  /**
   * Track login attempt
   */
  trackLoginAttempt(method: 'email' | 'google' | 'apple', success: boolean, error?: string) {
    Analytics.track({
      category: EventCategory.AUTH,
      action: 'login_attempt',
      label: method,
      value: success ? 1 : 0,
      metadata: {
        success,
        method,
        error: error || undefined,
        timestamp: Date.now(),
      },
    });
  }
  
  /**
   * Track signup attempt
   */
  trackSignupAttempt(method: 'email' | 'google' | 'apple', success: boolean, error?: string) {
    Analytics.track({
      category: EventCategory.AUTH,
      action: 'signup_attempt',
      label: method,
      value: success ? 1 : 0,
      metadata: {
        success,
        method,
        error: error || undefined,
        timestamp: Date.now(),
      },
    });
  }
  
  /**
   * Track token refresh
   */
  trackTokenRefresh(success: boolean, trigger: 'auto' | 'manual' | 'expiry') {
    Analytics.track({
      category: EventCategory.AUTH,
      action: 'token_refresh',
      label: trigger,
      value: success ? 1 : 0,
      metadata: {
        success,
        trigger,
        timestamp: Date.now(),
      },
    });
  }
  
  /**
   * Track session events
   */
  trackSessionEvent(event: 'start' | 'end' | 'extend', reason?: string) {
    Analytics.track({
      category: EventCategory.AUTH,
      action: 'session_' + event,
      label: reason || 'unknown',
      metadata: {
        event,
        reason,
        timestamp: Date.now(),
      },
    });
  }
  
  /**
   * Track security events
   */
  trackSecurityEvent(event: 'biometric_enabled' | 'biometric_disabled' | 'password_changed' | 'account_locked') {
    Analytics.track({
      category: EventCategory.SECURITY,
      action: event,
      metadata: {
        event,
        timestamp: Date.now(),
      },
    });
  }
  
  /**
   * Track error events
   */
  trackError(error: Error, context: string) {
    Analytics.track({
      category: EventCategory.ERROR,
      action: 'auth_error',
      label: context,
      metadata: {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: Date.now(),
      },
    });
  }
  
  /**
   * Track performance metrics
   */
  trackPerformance(operation: string, duration: number) {
    Analytics.track({
      category: EventCategory.PERFORMANCE,
      action: 'auth_performance',
      label: operation,
      value: duration,
      metadata: {
        operation,
        duration,
        timestamp: Date.now(),
      },
    });
  }
  
  /**
   * Start performance measurement
   */
  startMeasurement(operation: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.trackPerformance(operation, duration);
    };
  }
  
  /**
   * Get authentication metrics
   */
  async getMetrics() {
    return {
      loginAttempts: await Analytics.getCount('login_attempt'),
      signupAttempts: await Analytics.getCount('signup_attempt'),
      tokenRefreshes: await Analytics.getCount('token_refresh'),
      sessionStarts: await Analytics.getCount('session_start'),
      errors: await Analytics.getCount('auth_error'),
    };
  }
}

// Export singleton instance
export const authMonitoring = AuthMonitoring.getInstance();