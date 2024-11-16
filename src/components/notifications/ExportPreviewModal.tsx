import { X, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { UsageNotification } from '../../services/notification.service'
import { format } from 'date-fns'

interface ExportPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  notifications: UsageNotification[]
  format: 'csv' | 'json'
  timeRange: 'all' | 'month' | 'week'
}

const PREVIEW_ROWS = 5

export function ExportPreviewModal({
  isOpen,
  onClose,
  notifications,
  format,
  timeRange
}: ExportPreviewModalProps) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // Get sample data
  const sampleData = notifications.slice(0, PREVIEW_ROWS)

  // Format preview content
  const getPreviewContent = () => {
    if (format === 'json') {
      return JSON.stringify(sampleData, null, 2)
    }

    // CSV format
    const columns = [
      'timestamp',
      'type',
      'category',
      'message',
      'read',
      'readTimestamp',
      'percentage',
      'persistent'
    ]

    const header = columns.join(',')
    const rows = sampleData.map(notification => {
      return columns.map(col => {
        const value = notification[col as keyof UsageNotification]
        
        if (col === 'timestamp' || col === 'readTimestamp') {
          return value ? `"${format(value as number, 'yyyy-MM-dd HH:mm:ss')}"` : '""'
        }
        
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`
        }
        
        if (value === null || value === undefined) {
          return '""'
        }
        
        return `"${String(value)}"`
      }).join(',')
    })

    return [header, ...rows].join('\n')
  }

  const previewContent = getPreviewContent()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatFileSize = (size: number): string => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] rounded-lg border border-white/10 w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold">
            Export Preview ({format.toUpperCase()})
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="relative">
            <pre className="bg-black/20 rounded-lg p-4 overflow-x-auto text-sm font-mono text-white/80 max-h-96">
              {previewContent}
            </pre>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-white/60" />
                  <span className="text-xs text-white/60">Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Preview info */}
          <div className="mt-4 text-sm text-white/60">
            <p>Showing first {PREVIEW_ROWS} rows of {notifications.length} total records.</p>
            {timeRange !== 'all' && (
              <p className="mt-1">
                Filtered to {timeRange === 'month' ? 'last month' : 'last week'}.
              </p>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/60">Size:</span>
              <span className="text-sm">{formatFileSize(previewContent.length * 2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
