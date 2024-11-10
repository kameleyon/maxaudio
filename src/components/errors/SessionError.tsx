import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, RefreshCw, ShieldAlert } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';

interface SessionErrorProps {
  type: 'expired' | 'invalid' | 'unauthorized';
  onRetry?: () => void;
}

export function SessionError({ type, onRetry }: SessionErrorProps) {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  const getErrorContent = () => {
    switch (type) {
      case 'expired':
        return {
          icon: <RefreshCw className="w-8 h-8 text-yellow-500" />,
          title: 'Session Expired',
          message: 'Your session has expired. Please sign in again to continue.',
          primaryAction: {
            label: 'Sign In Again',
            onClick: async () => {
              await signOut();
              navigate('/');
            }
          },
          secondaryAction: onRetry ? {
            label: 'Try to Refresh',
            onClick: onRetry
          } : undefined
        };

      case 'invalid':
        return {
          icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
          title: 'Invalid Session',
          message: 'Your session appears to be invalid. Please sign in again for security.',
          primaryAction: {
            label: 'Sign In',
            onClick: async () => {
              await signOut();
              navigate('/');
            }
          }
        };

      case 'unauthorized':
        return {
          icon: <LogOut className="w-8 h-8 text-red-500" />,
          title: 'Access Denied',
          message: 'You are not authorized to access this feature. Please sign in with an appropriate account.',
          primaryAction: {
            label: 'Sign In',
            onClick: () => navigate('/')
          }
        };
    }
  };

  const content = getErrorContent();

  return (
    <div className="p-6 bg-[#1a1a2e] rounded-lg border border-white/10">
      <div className="flex items-start gap-4">
        {content.icon}
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{content.title}</h3>
          <p className="mt-1 text-white/60">{content.message}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-4">
        {content.secondaryAction && (
          <button
            onClick={content.secondaryAction.onClick}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            {content.secondaryAction.label}
          </button>
        )}
        <button
          onClick={content.primaryAction.onClick}
          className="px-4 py-2 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors"
        >
          {content.primaryAction.label}
        </button>
      </div>
    </div>
  );
}

// Hook for handling session errors
export function useSessionErrorHandler() {
  const isSessionError = (error: any) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;
    
    return (
      status === 401 || 
      status === 403 ||
      code === 'UNAUTHORIZED' ||
      code === 'SESSION_EXPIRED' ||
      code === 'INVALID_SESSION'
    );
  };

  const getSessionErrorType = (error: any): 'expired' | 'invalid' | 'unauthorized' => {
    const code = error.response?.data?.code;
    
    if (code === 'SESSION_EXPIRED') return 'expired';
    if (code === 'INVALID_SESSION') return 'invalid';
    return 'unauthorized';
  };

  return {
    isSessionError,
    getSessionErrorType
  };
}
