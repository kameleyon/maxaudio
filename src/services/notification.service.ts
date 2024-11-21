export interface UsageNotification {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  message: string
  timestamp: number
  readTimestamp?: number
  category: 'usage' | 'subscription' | 'system'
  persistent?: boolean
  event?: string
  resource?: string
  percentage?: number
  read?: boolean
}

type NotificationEvent = 
  | 'subscription_updated'
  | 'payment_succeeded'
  | 'subscription_expiring'
  | 'trial_ending'
  | 'payment_method_expiring'
  | 'usage_milestone'

type NotificationType = 'success' | 'warning' | 'error'

type NotificationMessages = {
  [K in NotificationEvent]: {
    [T in NotificationType]?: string
  }
}

class NotificationService {
  private readonly messages: NotificationMessages = {
    subscription_updated: {
      success: 'Your subscription has been successfully updated.',
      warning: 'Your subscription change is pending.',
      error: 'Failed to update your subscription.'
    },
    payment_succeeded: {
      success: 'Payment processed successfully.',
      warning: 'Your payment is being processed.',
      error: 'Payment failed. Please update your payment method.'
    },
    subscription_expiring: {
      warning: 'Your subscription will expire soon. Please renew to avoid service interruption.'
    },
    trial_ending: {
      warning: 'Your trial period is ending soon. Upgrade to continue using all features.'
    },
    payment_method_expiring: {
      warning: 'Your payment method will expire soon. Please update to avoid service interruption.'
    },
    usage_milestone: {
      success: 'Congratulations! You\'ve reached a usage milestone.',
      warning: 'You\'ve used 75% of your monthly limit.',
      error: 'You\'ve reached 90% of your monthly limit.'
    }
  }

  // Get persisted notifications
  getStoredNotifications(): UsageNotification[] {
    try {
      const stored = localStorage.getItem('audiomax_notifications')
      if (!stored) return []
      
      const notifications = JSON.parse(stored) as UsageNotification[]
      // Filter out expired notifications (older than 24 hours)
      const now = Date.now()
      return notifications.filter(n => now - n.timestamp < 24 * 60 * 60 * 1000)
    } catch (error) {
      console.error('Error reading stored notifications:', error)
      return []
    }
  }

  // Store notifications
  storeNotifications(notifications: UsageNotification[]): void {
    try {
      localStorage.setItem('audiomax_notifications', JSON.stringify(notifications))
    } catch (error) {
      console.error('Error storing notifications:', error)
    }
  }

  // Create subscription-related notifications
  createSubscriptionNotification(type: NotificationType, event: NotificationEvent): UsageNotification {
    const message = this.messages[event][type]
    if (!message) {
      throw new Error(`No message defined for event ${event} with type ${type}`)
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now(),
      category: 'subscription',
      event,
      persistent: true,
      read: false
    }
  }

  // Create usage-related notifications
  createUsageNotification(
    type: 'warning' | 'error',
    resource: 'characters' | 'voice_clones' | 'api_requests',
    percentage: number
  ): UsageNotification {
    const resourceNames = {
      characters: 'character',
      voice_clones: 'voice clone',
      api_requests: 'API request'
    }

    const message = percentage >= 90
      ? `You've reached ${percentage}% of your ${resourceNames[resource]} limit. Upgrade to continue using the service.`
      : `You're approaching your ${resourceNames[resource]} limit (${percentage}% used). Consider upgrading your plan.`

    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now(),
      category: 'usage',
      resource,
      percentage,
      persistent: percentage >= 90,
      read: false
    }
  }

  // Create system notifications
  createSystemNotification(
    type: 'info' | 'warning' | 'error',
    message: string,
    persistent: boolean = false
  ): UsageNotification {
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now(),
      category: 'system',
      persistent,
      read: false
    }
  }

  // Handle webhook events
  handleWebhookEvent(event: { type: string }): UsageNotification | null {
    switch (event.type) {
      case 'customer.subscription.updated':
        return this.createSubscriptionNotification('success', 'subscription_updated')
      
      case 'invoice.payment_succeeded':
        return this.createSubscriptionNotification('success', 'payment_succeeded')
      
      case 'invoice.payment_failed':
        return this.createSubscriptionNotification('error', 'payment_succeeded')
      
      case 'customer.subscription.trial_ending':
        return this.createSubscriptionNotification('warning', 'trial_ending')
      
      default:
        return null
    }
  }

  // Mark a notification as read
  markAsRead(notification: UsageNotification): UsageNotification {
    return {
      ...notification,
      read: true,
      readTimestamp: Date.now()
    }
  }
}

export const notificationService = new NotificationService()
