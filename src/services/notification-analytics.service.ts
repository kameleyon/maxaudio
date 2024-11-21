import { UsageNotification } from './notification.service'

export interface NotificationAnalytics {
  totalCount: number
  unreadCount: number
  byType: Record<string, number>
  byCategory: Record<string, number>
  byHour: Record<number, number>
  byDay: Record<string, number>
  responseTime: {
    average: number
    byType: Record<string, number>
  }
  trends: {
    daily: number[]
    weekly: number[]
    monthly: number[]
  }
}

class NotificationAnalyticsService {
  private readonly DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  analyzeNotifications(notifications: UsageNotification[]): NotificationAnalytics {
    const now = Date.now()
    const sortedNotifications = [...notifications].sort((a, b) => b.timestamp - a.timestamp)

    // Initialize counters
    const byType: Record<string, number> = {}
    const byCategory: Record<string, number> = {}
    const byHour: Record<number, number> = {}
    const byDay: Record<string, number> = {}
    const responseTimeByType: Record<string, number[]> = {}
    const dailyCounts: number[] = new Array(30).fill(0)
    const weeklyCounts: number[] = new Array(12).fill(0)
    const monthlyCounts: number[] = new Array(12).fill(0)

    // Initialize hours
    for (let i = 0; i < 24; i++) {
      byHour[i] = 0
    }

    // Initialize days
    this.DAYS_OF_WEEK.forEach(day => {
      byDay[day] = 0
    })

    let totalResponseTime = 0
    let responseTimeCount = 0

    sortedNotifications.forEach(notification => {
      // Count by type
      byType[notification.type] = (byType[notification.type] || 0) + 1

      // Count by category
      byCategory[notification.category] = (byCategory[notification.category] || 0) + 1

      const date = new Date(notification.timestamp)
      
      // Count by hour
      byHour[date.getHours()]++

      // Count by day of week
      byDay[this.DAYS_OF_WEEK[date.getDay()]]++

      // Calculate response time (time between notification and read)
      if (notification.read) {
        const responseTime = notification.readTimestamp! - notification.timestamp
        totalResponseTime += responseTime
        responseTimeCount++

        if (!responseTimeByType[notification.type]) {
          responseTimeByType[notification.type] = []
        }
        responseTimeByType[notification.type].push(responseTime)
      }

      // Calculate trends
      const daysAgo = Math.floor((now - notification.timestamp) / (1000 * 60 * 60 * 24))
      if (daysAgo < 30) dailyCounts[daysAgo]++
      if (daysAgo < 84) weeklyCounts[Math.floor(daysAgo / 7)]++
      const monthIndex = date.getMonth()
      monthlyCounts[monthIndex]++
    })

    // Calculate average response times by type
    const averageResponseTimeByType: Record<string, number> = {}
    Object.entries(responseTimeByType).forEach(([type, times]) => {
      averageResponseTimeByType[type] = times.reduce((a, b) => a + b, 0) / times.length
    })

    return {
      totalCount: notifications.length,
      unreadCount: notifications.filter(n => !n.read).length,
      byType,
      byCategory,
      byHour,
      byDay,
      responseTime: {
        average: responseTimeCount ? totalResponseTime / responseTimeCount : 0,
        byType: averageResponseTimeByType
      },
      trends: {
        daily: dailyCounts,
        weekly: weeklyCounts,
        monthly: monthlyCounts
      }
    }
  }

  getNotificationPatterns(notifications: UsageNotification[]): string[] {
    const analytics = this.analyzeNotifications(notifications)
    const patterns: string[] = []

    // Most common notification type
    const mostCommonType = Object.entries(analytics.byType)
      .sort((a, b) => b[1] - a[1])[0]
    if (mostCommonType) {
      patterns.push(`Most common notification type: ${mostCommonType[0]} (${mostCommonType[1]} notifications)`)
    }

    // Peak notification hours
    const peakHour = Object.entries(analytics.byHour)
      .sort((a, b) => b[1] - a[1])[0]
    if (peakHour) {
      patterns.push(`Peak notification hour: ${peakHour[0]}:00 (${peakHour[1]} notifications)`)
    }

    // Response time patterns
    if (analytics.responseTime.average > 0) {
      const avgMinutes = Math.round(analytics.responseTime.average / (1000 * 60))
      patterns.push(`Average response time: ${avgMinutes} minutes`)
    }

    // Usage trends
    const recentTrend = analytics.trends.daily.slice(0, 7)
    const weeklyAverage = recentTrend.reduce((a, b) => a + b, 0) / 7
    if (weeklyAverage > 0) {
      patterns.push(`Average daily notifications this week: ${weeklyAverage.toFixed(1)}`)
    }

    return patterns
  }

  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }
}

export const notificationAnalytics = new NotificationAnalyticsService()
