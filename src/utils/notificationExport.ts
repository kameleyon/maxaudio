import { UsageNotification } from '../services/notification.service'
import { format as formatDate } from 'date-fns'

export class ExportError extends Error {
  constructor(
    message: string,
    public code: 'FILE_SIZE_LIMIT' | 'BROWSER_SUPPORT' | 'NETWORK' | 'UNKNOWN',
    public details?: any
  ) {
    super(message)
    this.name = 'ExportError'
  }
}

interface ExportOptions {
  format: 'csv' | 'json'
  timeRange?: 'all' | 'month' | 'week'
  includeFields?: Array<keyof UsageNotification>
  onProgress?: (progress: number) => void
}

export async function exportNotifications(
  notifications: UsageNotification[],
  options: ExportOptions
): Promise<void> {
  try {
    // Report initial progress
    options.onProgress?.(0)

    // Filter notifications by time range
    const filteredNotifications = filterNotificationsByTimeRange(notifications, options.timeRange)
    options.onProgress?.(10)

    // Format the data
    const exportData = await formatNotificationsForExport(filteredNotifications, options)
    options.onProgress?.(50)

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    const dataSize = new Blob([exportData]).size
    if (dataSize > maxSize) {
      throw new ExportError(
        'Export file size exceeds limit (50MB)',
        'FILE_SIZE_LIMIT',
        { size: dataSize, limit: maxSize }
      )
    }
    options.onProgress?.(75)

    // Download the file
    await downloadFile(exportData, options.format)
    options.onProgress?.(100)
  } catch (error) {
    if (error instanceof ExportError) {
      throw error
    }
    
    if (error instanceof Error) {
      throw new ExportError(
        'Failed to export notifications',
        'UNKNOWN',
        { originalError: error }
      )
    }
    
    throw new ExportError('An unexpected error occurred', 'UNKNOWN')
  }
}

function filterNotificationsByTimeRange(
  notifications: UsageNotification[],
  timeRange: ExportOptions['timeRange'] = 'all'
): UsageNotification[] {
  const now = Date.now()
  const msInDay = 24 * 60 * 60 * 1000

  switch (timeRange) {
    case 'week':
      return notifications.filter(n => now - n.timestamp < 7 * msInDay)
    case 'month':
      return notifications.filter(n => now - n.timestamp < 30 * msInDay)
    default:
      return notifications
  }
}

async function formatNotificationsForExport(
  notifications: UsageNotification[],
  options: ExportOptions
): Promise<string> {
  if (options.format === 'csv') {
    return formatAsCSV(notifications, options.includeFields)
  }
  return formatAsJSON(notifications, options.includeFields)
}

function formatAsCSV(
  notifications: UsageNotification[],
  includeFields?: Array<keyof UsageNotification>
): string {
  const fields = includeFields || [
    'timestamp',
    'type',
    'category',
    'message',
    'read',
    'readTimestamp',
    'percentage',
    'persistent'
  ] as Array<keyof UsageNotification>

  // Create header row
  const header = fields.join(',')

  // Create data rows
  const rows = notifications.map(notification => {
    return fields.map(field => {
      const value = notification[field]
      
      if (field === 'timestamp' || field === 'readTimestamp') {
        return value ? `"${formatDate(value as number, 'yyyy-MM-dd HH:mm:ss')}"` : '""'
      }
      
      if (typeof value === 'string') {
        // Escape quotes and wrap in quotes
        return `"${value.replace(/"/g, '""')}"`
      }
      
      if (typeof value === 'boolean' || typeof value === 'number') {
        return String(value)
      }
      
      return '""'
    }).join(',')
  })

  return [header, ...rows].join('\n')
}

function formatAsJSON(
  notifications: UsageNotification[],
  includeFields?: Array<keyof UsageNotification>
): string {
  if (!includeFields) {
    return JSON.stringify(notifications, null, 2)
  }

  const filteredNotifications = notifications.map(notification => {
    return includeFields.reduce((acc, field) => {
      if (notification[field] !== undefined) {
        acc[field] = notification[field]
      }
      return acc
    }, {} as Partial<Record<keyof UsageNotification, any>>)
  })

  return JSON.stringify(filteredNotifications, null, 2)
}

async function downloadFile(content: string, fileFormat: 'csv' | 'json'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const timestamp = formatDate(new Date(), 'yyyy-MM-dd-HHmmss')
      const filename = `notifications-${timestamp}.${fileFormat}`
      const mimeType = fileFormat === 'csv' ? 'text/csv' : 'application/json'
      
      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      
      // Handle download completion or error
      link.onload = () => {
        URL.revokeObjectURL(url)
        resolve()
      }
      
      link.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new ExportError('Failed to download file', 'BROWSER_SUPPORT'))
      }
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      reject(new ExportError(
        'Failed to create download',
        'BROWSER_SUPPORT',
        { originalError: error }
      ))
    }
  })
}
