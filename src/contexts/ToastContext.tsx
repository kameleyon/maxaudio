import React, { createContext, useContext, useState, useCallback } from 'react'
import { ToastContainer, type ToastType } from '../components/common/Toast'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType, duration: number = 5000) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const handleClose = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={handleClose} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Helper functions for common toast types
export function useToastHelpers() {
  const { showToast } = useToast()

  return {
    success: (message: string, duration?: number) => 
      showToast(message, 'success', duration),
    
    error: (message: string, duration?: number) => 
      showToast(message, 'error', duration),
    
    warning: (message: string, duration?: number) => 
      showToast(message, 'warning', duration),
    
    info: (message: string, duration?: number) => 
      showToast(message, 'info', duration)
  }
}
