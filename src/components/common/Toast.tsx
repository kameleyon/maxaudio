import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, CheckCircle, XCircle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastProps {
  toast: Toast
  onClose: (id: string) => void
}

function ToastComponent({ toast, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        setIsExiting(true)
      }, toast.duration - 300) // Start exit animation before removal

      const removeTimer = setTimeout(() => {
        onClose(toast.id)
      }, toast.duration)

      return () => {
        clearTimeout(timer)
        clearTimeout(removeTimer)
      }
    }
  }, [toast, onClose])

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/20'
      case 'error':
        return 'bg-red-500/10 border-red-500/20'
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20'
      default:
        return 'bg-blue-500/10 border-blue-500/20'
    }
  }

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${getBgColor()} ${
        isExiting ? 'animate-slide-out' : 'animate-slide-in'
      }`}
    >
      {getIcon()}
      <p className="text-sm text-white/90 flex-1">{toast.message}</p>
      <button
        onClick={() => setIsExiting(true)}
        className="p-1 hover:bg-white/10 rounded-full transition-colors"
      >
        <X className="w-4 h-4 text-white/40" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>,
    document.body
  )
}

// Add animation keyframes to your global CSS
const styles = `
@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
}

.animate-slide-out {
  animation: slide-out 0.3s ease-in forwards;
}
`

// Create a style element and append it to the document head
const styleSheet = document.createElement('style')
styleSheet.textContent = styles
document.head.appendChild(styleSheet)
