import React from 'react';
import { Wifi, WifiOff, Server, ServerCrash, Clock } from 'lucide-react';

interface NetworkErrorProps {
  type: 'connection' | 'server' | 'timeout';
  onRetry?: () => void;
  details?: string;
}

export function NetworkError({ type, onRetry, details }: NetworkErrorProps) {
  const getErrorContent = () => {
    switch (type) {
      case 'connection':
        return {
          icon: <WifiOff className="w-8 h-8 text-red-500" />,
          title: 'Connection Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          suggestion: 'Make sure you have a stable internet connection and try again.'
        };

      case 'server':
        return {
          icon: <ServerCrash className="w-8 h-8 text-red-500" />,
          title: 'Server Error',
          message: 'Our servers are experiencing issues.',
          suggestion: 'We\'re working on fixing this. Please try again in a few minutes.'
        };

      case 'timeout':
        return {
          icon: <Clock className="w-8 h-8 text-yellow-500" />,
          title: 'Request Timeout',
          message: 'The request took too long to complete.',
          suggestion: 'This might be due to slow internet or high server load. Please try again.'
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
          {details && (
            <p className="mt-2 text-sm text-white/40">{details}</p>
          )}
          <p className="mt-4 text-sm text-white/60">{content.suggestion}</p>
        </div>
      </div>

      {/* Connection Status */}
      {type === 'connection' && (
        <div className="mt-4 p-4 bg-white/5 rounded-lg flex items-center gap-3">
          <Wifi className={`w-5 h-5 ${navigator.onLine ? 'text-green-500' : 'text-red-500'}`} />
          <span className="text-sm">
            {navigator.onLine ? 'Internet connection available' : 'No internet connection'}
          </span>
        </div>
      )}

      {/* Server Status */}
      {type === 'server' && (
        <div className="mt-4 p-4 bg-white/5 rounded-lg flex items-center gap-3">
          <Server className="w-5 h-5 text-yellow-500" />
          <span className="text-sm">Server status: Experiencing issues</span>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-[#63248d] hover:bg-[#63248d]/80 rounded-lg transition-colors flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

// Hook for handling network errors
export function useNetworkErrorHandler() {
  const isNetworkError = (error: any) => {
    return (
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.message === 'Network Error' ||
      error.response?.status === 503 ||
      error.response?.status === 504
    );
  };

  const getNetworkErrorType = (error: any): 'connection' | 'server' | 'timeout' => {
    if (error.code === 'ECONNABORTED' || error.response?.status === 504) {
      return 'timeout';
    }
    if (error.response?.status === 503 || error.response?.status >= 500) {
      return 'server';
    }
    return 'connection';
  };

  const getNetworkErrorDetails = (error: any): string => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message && error.message !== 'Network Error') {
      return error.message;
    }
    return '';
  };

  return {
    isNetworkError,
    getNetworkErrorType,
    getNetworkErrorDetails
  };
}

// Network status monitor component
export function NetworkStatusMonitor({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <NetworkError type="connection" />;
  }

  return <>{children}</>;
}
