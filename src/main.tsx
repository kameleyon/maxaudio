import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './contexts/ToastContext'
import { UsageNotificationProvider } from './contexts/UsageNotificationContext'
import App from './App'
import './index.css'

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key')
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      retry: 2,
      refetchOnWindowFocus: false
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#63248d',
          colorBackground: 'transparent',
          colorText: 'white',
          colorInputText: 'white',
          colorInputBackground: 'rgba(255, 255, 255, 0.1)',
        },
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/80',
          card: 'bg-transparent',
          headerTitle: 'text-white',
          headerSubtitle: 'text-white/80',
          socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
          dividerLine: 'bg-white/20',
          dividerText: 'text-white/60',
          formFieldLabel: 'text-white/80',
          formFieldInput: 'bg-white/10 border-white/20 text-white',
          footerActionLink: 'text-primary hover:text-primary/80'
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider>
            <ToastProvider>
              <UsageNotificationProvider>
                <App />
              </UsageNotificationProvider>
            </ToastProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ClerkProvider>
  </React.StrictMode>
)
