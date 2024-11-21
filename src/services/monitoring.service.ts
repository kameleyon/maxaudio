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
  private eventSource: EventSource | null = null;
  private alertHandlers: ((alert: Alert) => void)[] = [];
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 seconds

  constructor() {
    this.baseUrl = '/api/monitoring';
  }

  /**
   * Start system monitoring
   */
  startMonitoring(): void {
    this.initializeEventSource();
  }

  /**
   * Stop system monitoring
   */
  stopMonitoring(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = 0;
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
   * Initialize server-sent events connection
   */
  private initializeEventSource(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(`${this.baseUrl}/events`);

    this.eventSource.onmessage = (event) => {
      try {
        const alert: Alert = JSON.parse(event.data);
        this.notifyAlertHandlers(alert);
      } catch (error) {
        console.error('Error processing monitoring event:', error);
      }
    };

    this.eventSource.onerror = () => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }

      // Attempt to reconnect if max attempts not reached
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        this.reconnectTimeout = setTimeout(() => {
          this.initializeEventSource();
        }, this.reconnectDelay * this.reconnectAttempts);
      } else {
        console.error('Max reconnection attempts reached');
        this.notifyAlertHandlers({
          id: crypto.randomUUID(),
          type: 'error',
          message: 'Lost connection to monitoring service',
          component: 'monitoring',
          timestamp: new Date().toISOString()
        });
      }
    };

    this.eventSource.onopen = () => {
      this.reconnectAttempts = 0;
    };
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

  /**
   * Check component health
   */
  async checkComponentHealth(component: string): Promise<HealthCheck> {
    try {
      const startTime = Date.now();
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
        responseTime: Date.now() - Date.now(),
        message: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }
}

export const monitoringService = new MonitoringService();
export type { SystemHealth, HealthCheck, Alert };
