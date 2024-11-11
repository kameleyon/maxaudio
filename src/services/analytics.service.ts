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

  constructor() {
    this.baseUrl = '/api/analytics';
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
        sessionId: this.getSessionId(),
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
  async trackPerformance(metrics: PerformanceEntry[]): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/performance`, {
        metrics,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error tracking performance:', error);
      // Don't throw error to prevent affecting user experience
    }
  }

  /**
   * Track resource usage
   */
  async trackResourceUsage(resources: ResourceAnalytics): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/resources`, {
        ...resources,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error tracking resource usage:', error);
      // Don't throw error to prevent affecting user experience
    }
  }

  /**
   * Get session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  /**
   * Initialize performance monitoring
   */
  initializePerformanceMonitoring(): void {
    // Track page load performance
    window.addEventListener('load', () => {
      const performanceEntries = performance.getEntriesByType('navigation');
      this.trackPerformance(performanceEntries);
    });

    // Track resource load performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      this.trackPerformance(entries);
    });

    observer.observe({
      entryTypes: ['resource', 'paint', 'largest-contentful-paint', 'first-input']
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.reportError(event.error);
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(new Error(event.reason));
    });
  }

  /**
   * Initialize resource monitoring
   */
  initializeResourceMonitoring(): void {
    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.trackResourceUsage({
          cpuUsage: 0, // Not available in browser
          memoryUsage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
          diskUsage: 0, // Not available in browser
          bandwidth: 0 // Calculate from ResourceTiming API
        });
      }, 60000); // Every minute
    }

    // Monitor bandwidth usage
    const calculateBandwidth = () => {
      const resources = performance.getEntriesByType('resource');
      const totalBytes = resources.reduce((total, resource) => {
        return total + (resource as any).transferSize || 0;
      }, 0);
      return totalBytes;
    };

    setInterval(() => {
      const bandwidth = calculateBandwidth();
      performance.clearResourceTimings();
      
      this.trackResourceUsage({
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        bandwidth
      });
    }, 60000); // Every minute
  }
}

export const analyticsService = new AnalyticsService();
