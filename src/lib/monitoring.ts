// Application monitoring and error tracking
export interface ErrorReport {
  message: string;
  stack?: string;
  userId?: string;
  userAgent?: string;
  url?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: Date;
  userId?: string;
  context?: Record<string, any>;
}

class Monitor {
  private errorQueue: ErrorReport[] = [];
  private performanceQueue: PerformanceMetric[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.setupErrorHandling();
    this.setupPerformanceMonitoring();
    this.setupNetworkMonitoring();
  }

  private setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
      // Handle null error objects (common with cross-origin scripts)
      if (event.error === null) {
        // Don't report generic script errors as they provide no useful information
        // and are often caused by browser extensions or cross-origin scripts
        if (event.message === 'Script error.' || event.message === '') {
          console.warn('Cross-origin script error detected (details hidden by browser security policy)', {
            filename: event.filename,
            line: event.lineno,
            column: event.colno,
          });
          return; // Skip reporting generic script errors
        }

        this.reportError({
          message: event.message || 'Script error (details hidden by browser security policy)',
          stack: undefined,
          url: event.filename,
          timestamp: new Date(),
          severity: 'low', // Reduced severity for cross-origin errors
          context: {
            line: event.lineno,
            column: event.colno,
            type: 'cross-origin-script-error',
          },
        });
      } else {
        this.reportError({
          message: event.message,
          stack: event.error?.stack,
          url: event.filename,
          timestamp: new Date(),
          severity: 'high',
          context: {
            line: event.lineno,
            column: event.colno,
          },
        });
      }
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        timestamp: new Date(),
        severity: 'high',
        context: {
          type: 'unhandledrejection',
          reason: event.reason,
        },
      });
    });
  }

  private setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.reportPerformance({
          name: 'page_load_time',
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: 'ms',
          timestamp: new Date(),
        });

        this.reportPerformance({
          name: 'dom_content_loaded',
          value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          unit: 'ms',
          timestamp: new Date(),
        });
      }, 0);
    });

    // Monitor Core Web Vitals
    this.observeWebVitals();
  }

  private setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueues();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private observeWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          this.reportPerformance({
            name: 'largest_contentful_paint',
            value: lastEntry.startTime,
            unit: 'ms',
            timestamp: new Date(),
          });
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.reportPerformance({
              name: 'first_input_delay',
              value: entry.processingStart - entry.startTime,
              unit: 'ms',
              timestamp: new Date(),
            });
          });
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          this.reportPerformance({
            name: 'cumulative_layout_shift',
            value: clsValue,
            unit: 'count',
            timestamp: new Date(),
          });
        }).observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.error('Error setting up performance observers:', e);
      }
    }
  }

  reportError(error: Omit<ErrorReport, 'userAgent' | 'url'>) {
    const fullError: ErrorReport = {
      ...error,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    if (this.isOnline) {
      this.sendError(fullError);
    } else {
      this.errorQueue.push(fullError);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error reported:', fullError);
    }
  }

  reportPerformance(metric: PerformanceMetric) {
    if (this.isOnline) {
      this.sendPerformance(metric);
    } else {
      this.performanceQueue.push(metric);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance metric:', metric);
    }
  }

  private async sendError(error: ErrorReport) {
    try {
      // In a real implementation, send to your error tracking service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(error),
      // });

      // For demo, just log
      console.log('Error sent to monitoring service:', error);
    } catch (err) {
      console.error('Failed to send error report:', err);
      this.errorQueue.push(error);
    }
  }

  private async sendPerformance(metric: PerformanceMetric) {
    try {
      // In a real implementation, send to your analytics service
      // await fetch('/api/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(metric),
      // });

      // For demo, just log
      console.log('Performance metric sent:', metric);
    } catch (err) {
      console.error('Failed to send performance metric:', err);
      this.performanceQueue.push(metric);
    }
  }

  private async flushQueues() {
    // Send queued errors
    while (this.errorQueue.length > 0) {
      const error = this.errorQueue.shift();
      if (error) {
        await this.sendError(error);
      }
    }

    // Send queued performance metrics
    while (this.performanceQueue.length > 0) {
      const metric = this.performanceQueue.shift();
      if (metric) {
        await this.sendPerformance(metric);
      }
    }
  }

  // Manual error reporting
  captureException(error: Error, context?: Record<string, any>) {
    this.reportError({
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      severity: 'medium',
      context,
    });
  }

  // Manual performance tracking
  startTimer(name: string) {
    const startTime = performance.now();
    
    return {
      end: (context?: Record<string, any>) => {
        const duration = performance.now() - startTime;
        this.reportPerformance({
          name,
          value: duration,
          unit: 'ms',
          timestamp: new Date(),
          context,
        });
      },
    };
  }

  // Track user actions
  trackUserAction(action: string, context?: Record<string, any>) {
    this.reportPerformance({
      name: `user_action_${action}`,
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      context,
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'down'; checks: Record<string, boolean> }> {
    const checks: Record<string, boolean> = {};

    // Check API connectivity
    try {
      const response = await fetch('/api/health', { method: 'HEAD' });
      checks.api = response.ok;
    } catch {
      checks.api = false;
    }

    // Check local storage
    try {
      localStorage.setItem('health_check', 'test');
      localStorage.removeItem('health_check');
      checks.localStorage = true;
    } catch {
      checks.localStorage = false;
    }

    // Check network connectivity
    checks.network = this.isOnline;

    // Determine overall status
    const allHealthy = Object.values(checks).every(Boolean);
    const someHealthy = Object.values(checks).some(Boolean);
    
    const status = allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'down';

    return { status, checks };
  }
}

export const monitor = new Monitor();

// Utility functions
export const reportError = (error: Error, context?: Record<string, any>) => {
  monitor.captureException(error, context);
};

export const trackPerformance = (name: string, value: number, unit: 'ms' | 'bytes' | 'count' = 'ms') => {
  monitor.reportPerformance({
    name,
    value,
    unit,
    timestamp: new Date(),
  });
};

export const startTimer = (name: string) => {
  return monitor.startTimer(name);
};

export const trackUserAction = (action: string, context?: Record<string, any>) => {
  monitor.trackUserAction(action, context);
};