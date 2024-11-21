import axios from 'axios';

interface UserAnalytics {
  total: number;
  active: number;
  newToday: number;
  growth: number;
}

interface UsageAnalytics {
  totalRequests: number;
  averageResponseTime: number;
  errorRate: number;
  peakHour: number;
}

interface ResourceAnalytics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  bandwidth: number;
}

interface PerformanceAnalytics {
  uptime: number;
  averageLoad: number;
  cacheHitRate: number;
  queueLength: number;
}

export interface Analytics {
  users: UserAnalytics;
  usage: UsageAnalytics;
  resources: ResourceAnalytics;
  performance: PerformanceAnalytics;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

export interface ChartData {
  userActivity: TimeSeriesData[];
  systemLoad: TimeSeriesData[];
  errorRates: TimeSeriesData[];
  responseTime: TimeSeriesData[];
}

interface TrackEventOptions {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  type: string;
  metadata?: Record<string, any>;
  userAgent?: string;
  timestamp: string;
}

class AnalyticsService {
  private baseUrl: string;
  private sessionId: string;

  constructor() {
    this.baseUrl = '/api/analytics';
    this.sessionId = this.generateSessionId();
  }

  /**
   * Get analytics dashboard data
   */
  async getAnalytics(): Promise<Analytics> {
    try {
      const response = await axios.get(`${this.baseUrl}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Get chart data for specified time range
   */
  async getChartData(timeRange: '24h' | '7d' | '30d'): Promise<ChartData> {
    try {
      const response = await axios.get(`${this.baseUrl}/charts`, {
        params: { range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  }

  /**
   * Track user event
   */
  async trackEvent(options: TrackEventOptions): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/events`, {
        ...options,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error tracking event:', error);
      // Don't throw error to prevent affecting user experience
    }
  }

  /**
   * Report error for monitoring
   */
  async reportError(error: Error, metadata?: Record<string, any>): Promise<void> {
    try {
      const errorReport: ErrorReport = {
        message: error.message,
        stack: error.stack,
        type: error.name,
        metadata,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      await axios.post(`${this.baseUrl}/errors`, errorReport);
    } catch (err) {
      console.error('Error reporting error:', err);
      // Don't throw error to prevent affecting user experience
    }
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(): Promise<void> {
    try {
      // Get performance metrics
      const metrics = {
        pageLoad: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0,
        resources: performance.getEntriesByType('resource').map(entry => ({
          name: entry.name,
          duration: entry.duration,
          size: (entry as any).transferSize || 0
        }))
      };

      await axios.post(`${this.baseUrl}/performance`, {
        metrics,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        sessionId: this.sessionId
      });
    } catch (error) {
      console.error('Error tracking performance:', error);
      // Don't throw error to prevent affecting user experience
    }
  }

  /**
   * Initialize analytics tracking
   */
  initialize(): void {
    // Track page views
    this.trackEvent({
      category: 'Page',
      action: 'View',
      label: window.location.pathname
    });

    // Track performance on load
    window.addEventListener('load', () => {
      this.trackPerformance();
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.reportError(event.error);
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(new Error(event.reason));
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent({
        category: 'Page',
        action: document.hidden ? 'Hide' : 'Show',
        label: window.location.pathname
      });
    });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return crypto.randomUUID();
  }
}

export const analyticsService = new AnalyticsService();
