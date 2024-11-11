import axios from 'axios';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  components: {
    [key: string]: {
      status: 'healthy' | 'degraded' | 'down';
      message?: string;
      lastChecked: string;
    };
  };
}

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  message?: string;
}

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  component: string;
  timestamp: string;
  metadata?: Record<string, any>;
  resolved?: boolean;
  resolvedAt?: string;
}

class MonitoringService {
  private baseUrl: string;
  private checkInterval: number;
  private healthCheckTimer: ReturnType<typeof setInterval> | null = null;
  private alertHandlers: ((alert: Alert) => void)[] = [];

  constructor() {
    this.baseUrl = '/api/monitoring';
    this.checkInterval = 60000; // 1 minute
  }

  /**
   * Start system monitoring
   */
  startMonitoring(): void {
    this.performHealthCheck();
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.checkInterval);

    // Listen for server-sent events
    this.initializeEventSource();
  }

  /**
   * Stop system monitoring
   */
  stopMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  /**
   * Get current system health
   */
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      console.error('Error getting system health:', error);
      throw error;
    }
  }

  /**
   * Perform health check on all components
   */
  private async performHealthCheck(): Promise<void> {
    try {
      const components = [
        'database',
        'cache',
        'storage',
        'authentication',
        'tts-service',
        'voice-cloning'
      ];

      const checks: HealthCheck[] = await Promise.all(
        components.map(async (component) => {
          const startTime = Date.now();
          try {
            const response = await axios.get(`${this.baseUrl}/health/${component}`);
            const endTime = Date.now();
            return {
              name: component,
              status: response.data.status,
              responseTime: endTime - startTime,
              message: response.data.message
            };
          } catch (error) {
            return {
              name: component,
              status: 'down',
              responseTime: Date.now() - startTime,
              message: error instanceof Error ? error.message : 'Health check failed'
            };
          }
        })
      );

      // Report health check results
      await axios.post(`${this.baseUrl}/health/report`, { checks });

      // Generate alerts for degraded or down components
      checks.forEach((check) => {
        if (check.status !== 'healthy') {
          this.generateAlert({
            type: check.status === 'down' ? 'error' : 'warning',
            component: check.name,
            message: check.message || `${check.name} is ${check.status}`
          });
        }
      });
    } catch (error) {
      console.error('Error performing health check:', error);
    }
  }

  /**
   * Initialize server-sent events connection
   */
  private initializeEventSource(): void {
    const eventSource = new EventSource(`${this.baseUrl}/events`);

    eventSource.onmessage = (event) => {
      try {
        const alert: Alert = JSON.parse(event.data);
        this.notifyAlertHandlers(alert);
      } catch (error) {
        console.error('Error processing monitoring event:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('Error in monitoring event source:', error);
      eventSource.close();
      // Retry connection after delay
      setTimeout(() => this.initializeEventSource(), 5000);
    };
  }

  /**
   * Generate system alert
   */
  private generateAlert(options: {
    type: Alert['type'];
    component: string;
    message: string;
    metadata?: Record<string, any>;
  }): void {
    const alert: Alert = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...options
    };

    // Send alert to server
    axios.post(`${this.baseUrl}/alerts`, alert).catch((error) => {
      console.error('Error sending alert:', error);
    });

    // Notify handlers
    this.notifyAlertHandlers(alert);
  }

  /**
   * Subscribe to alerts
   */
  onAlert(handler: (alert: Alert) => void): () => void {
    this.alertHandlers.push(handler);
    return () => {
      this.alertHandlers = this.alertHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Notify alert handlers
   */
  private notifyAlertHandlers(alert: Alert): void {
    this.alertHandlers.forEach(handler => {
      try {
        handler(alert);
      } catch (error) {
        console.error('Error in alert handler:', error);
      }
    });
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/alerts/${alertId}/resolve`);
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw error;
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(): Promise<Alert[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/alerts/active`);
      return response.data;
    } catch (error) {
      console.error('Error getting active alerts:', error);
      throw error;
    }
  }

  /**
   * Get alert history
   */
  async getAlertHistory(options: {
    startDate?: Date;
    endDate?: Date;
    type?: Alert['type'];
    component?: string;
  } = {}): Promise<Alert[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/alerts/history`, {
        params: options
      });
      return response.data;
    } catch (error) {
      console.error('Error getting alert history:', error);
      throw error;
    }
  }
}

export const monitoringService = new MonitoringService();
export type { SystemHealth, HealthCheck, Alert };
