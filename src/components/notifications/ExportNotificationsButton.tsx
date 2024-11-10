import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown, FileJson, FileSpreadsheet, Clock, Loader2, HardDrive, Eye } from 'lucide-react'
import { exportNotifications, ExportError } from '../../utils/notificationExport'
import type { UsageNotification } from '../../services/notification.service'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { useToastHelpers } from '../../contexts/ToastContext'
import { estimateExportSize, formatFileSize } from '../../utils/fileSize'
import { ExportPreviewModal } from './ExportPreviewModal'

interface ExportNotificationsButtonProps {
  notifications: UsageNotification[]
}

interface ExportOption {
  format: 'csv' | 'json'
  timeRange: 'all' | 'month' | 'week'
  label: string
  icon: JSX.Element
  shortcut?: {
    key: string
    ctrl?: boolean
    alt?: boolean
    shift?: boolean
  }
}

const EXPORT_COLUMNS = [
  'timestamp',
  'type',
  'category',
  'message',
  'read',
  'readTimestamp',
  'percentage',
  'persistent'
] as string[]

export function ExportNotificationsButton({ notifications }: ExportNotificationsButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [previewConfig, setPreviewConfig] = useState<{
    isOpen: boolean
    format: 'csv' | 'json'
    timeRange: 'all' | 'month' | 'week'
  }>({
    isOpen: false,
    format: 'csv',
    timeRange: 'all'
  })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const toast = useToastHelpers()

  // Calculate file sizes for each export option
  const exportSizes = useRef<Record<string, number>>({})
  useEffect(() => {
    const sizes: Record<string, number> = {}
    
    exportOptions.forEach(option => {
      // Filter notifications based on time range
      const now = Date.now()
      const msInDay = 24 * 60 * 60 * 1000
      let filteredNotifications = [...notifications]

      if (option.timeRange === 'week') {
        filteredNotifications = notifications.filter(n => now - n.timestamp < 7 * msInDay)
      } else if (option.timeRange === 'month') {
        filteredNotifications = notifications.filter(n => now - n.timestamp < 30 * msInDay)
      }

      // Estimate size
      const size = estimateExportSize(
        filteredNotifications,
        option.format,
        EXPORT_COLUMNS
      )

      sizes[`${option.format}-${option.timeRange}`] = size
    })

    exportSizes.current = sizes
  }, [notifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getExportErrorMessage = (error: ExportError): string => {
    switch (error.code) {
      case 'FILE_SIZE_LIMIT':
        return 'The export file is too large. Try exporting a smaller date range.'
      case 'BROWSER_SUPPORT':
        return 'Your browser does not support file downloads. Please try a different browser.'
      case 'NETWORK':
        return 'Network error occurred while exporting. Please check your connection and try again.'
      default:
        return error.message || 'An unexpected error occurred during export.'
    }
  }

  const handleExport = async (format: 'csv' | 'json', timeRange: 'all' | 'month' | 'week' = 'all') => {
    try {
      setIsExporting(true)
      setExportProgress(0)

      await exportNotifications(notifications, {
        format,
        timeRange,
        onProgress: (progress) => {
          setExportProgress(progress)
        }
      })

      setIsOpen(false)
      toast.success(`Successfully exported notifications as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export failed:', error)
      if (error instanceof ExportError) {
        toast.error(getExportErrorMessage(error))
      } else {
        toast.error('Failed to export notifications. Please try again.')
      }
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  const handlePreview = (format: 'csv' | 'json', timeRange: 'all' | 'month' | 'week' = 'all') => {
    setPreviewConfig({
      isOpen: true,
      format,
      timeRange
    })
    setIsOpen(false)
  }

  const exportOptions: ExportOption[] = [
    {
      format: 'csv',
      timeRange: 'all',
      label: 'Export all as CSV',
      icon: <FileSpreadsheet className="w-4 h-4" />,
      shortcut: { key: 'e', ctrl: true }
    },
    {
      format: 'json',
      timeRange: 'all',
      label: 'Export all as JSON',
      icon: <FileJson className="w-4 h-4" />,
      shortcut: { key: 'j', ctrl: true }
    },
    {
      format: 'csv',
      timeRange: 'month',
      label: 'Export last month as CSV',
      icon: <Clock className="w-4 h-4" />,
      shortcut: { key: 'm', ctrl: true }
    },
    {
      format: 'csv',
      timeRange: 'week',
      label: 'Export last week as CSV',
      icon: <Clock className="w-4 h-4" />,
      shortcut: { key: 'w', ctrl: true }
    }
  ]

  // Register keyboard shortcuts
  useKeyboardShortcuts(
    exportOptions
      .filter(option => option.shortcut)
      .map(option => ({
        ...option.shortcut!,
        handler: () => handleExport(option.format, option.timeRange),
        description: option.label
      }))
  )

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => !isExporting && setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isExporting}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            isExporting
              ? 'bg-blue-400/20 text-blue-400 cursor-wait'
              : isOpen
                ? 'bg-blue-400/20 text-blue-400'
                : isHovered
                  ? 'bg-white/10 text-blue-400'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
          } border border-white/10`}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="text-blue-400">Exporting... {exportProgress}%</span>
            </>
          ) : (
            <>
              <Download className={`w-4 h-4 transition-colors ${
                isOpen || isHovered ? 'text-blue-400' : 'text-white/60'
              }`} />
              Export
              <ChevronDown className={`w-4 h-4 transition-all ${
                isOpen ? 'rotate-180 text-blue-400' : isHovered ? 'text-blue-400' : 'text-white/60'
              }`} />
            </>
          )}
        </button>

        {/* Progress Bar */}
        {isExporting && (
          <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-white/10 overflow-hidden rounded-full">
            <div
              className="h-full bg-blue-400 transition-all duration-300 ease-out"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        )}

        {isOpen && !isExporting && (
          <div className="absolute right-0 mt-2 w-80 bg-[#1a1a2e] rounded-lg shadow-lg border border-white/10 py-1 z-50">
            {exportOptions.map((option, index) => {
              const size = exportSizes.current[`${option.format}-${option.timeRange}`]
              const isLarge = size > 10 * 1024 * 1024 // 10MB warning threshold
              
              return (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-blue-400/10 transition-colors text-white/80 hover:text-blue-400 group"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{option.label}</span>
                        {option.shortcut && (
                          <span className="text-xs text-white/40 group-hover:text-blue-400">
                            {[
                              option.shortcut.ctrl && 'Ctrl',
                              option.shortcut.alt && 'Alt',
                              option.shortcut.shift && 'Shift',
                              option.shortcut.key.toUpperCase()
                            ].filter(Boolean).join('+')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        <HardDrive className="w-3 h-3" />
                        <span className={isLarge ? 'text-yellow-400' : 'text-white/40'}>
                          {formatFileSize(size)}
                        </span>
                        {isLarge && (
                          <span className="text-yellow-400">
                            (Large file)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleExport(option.format, option.timeRange)}
                      className="flex-1 px-3 py-1 bg-blue-400/10 hover:bg-blue-400/20 rounded text-xs text-blue-400 transition-colors"
                    >
                      Export
                    </button>
                    <button
                      onClick={() => handlePreview(option.format, option.timeRange)}
                      className="flex items-center gap-1 px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-white/60 hover:text-white/80 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <ExportPreviewModal
        isOpen={previewConfig.isOpen}
        onClose={() => setPreviewConfig(prev => ({ ...prev, isOpen: false }))}
        notifications={notifications}
        format={previewConfig.format}
        timeRange={previewConfig.timeRange}
      />
    </>
  )
}
