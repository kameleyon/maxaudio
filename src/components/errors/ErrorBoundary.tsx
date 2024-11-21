import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorDisplay } from './ErrorDisplay';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Convert generic error to our error format
      const errorDetails = {
        error: this.state.error?.message || 'An unexpected error occurred',
        details: 'The application encountered an error and could not continue.',
        code: 'UNEXPECTED_ERROR'
      };

      return (
        <div className="p-4">
          <ErrorDisplay
            error={errorDetails}
            onRetry={this.handleRetry}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for handling API errors
export function useErrorHandler() {
  const handleError = (error: any) => {
    // Extract error details from API response
    const errorDetails = {
      error: error.response?.data?.error || error.message || 'An error occurred',
      details: error.response?.data?.details,
      code: error.response?.data?.code,
      limit: error.response?.data?.limit,
      current: error.response?.data?.current,
      remaining: error.response?.data?.remaining,
      resetIn: error.response?.data?.resetIn,
      upgradeOptions: error.response?.data?.upgradeOptions
    };

    // Return formatted error that can be passed to ErrorDisplay
    return errorDetails;
  };

  return { handleError };
}

// Utility for handling async errors
export async function withErrorHandling<T>(
  promise: Promise<T>,
  errorHandler: (error: any) => void
): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    errorHandler(error);
    return null;
  }
}
