import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ErrorDisplay, type ErrorDetails } from '../errors/ErrorDisplay';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<ErrorDetails | null>(null);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        // Make API call to verify admin status
        const response = await fetch('/api/auth/me', {
          headers: {
            'x-user-email': 'kameleyon@outlook.com' // Set your email in the header
          }
        });

        if (!response.ok) {
          throw new Error('Failed to verify admin status');
        }

        const data = await response.json();
        if (data.role !== 'admin') {
          throw new Error('Unauthorized: Admin role required');
        }

        setIsVerified(true);
        setErrorState(null);
      } catch (err) {
        setErrorState({
          error: err instanceof Error ? err.message : 'Failed to verify admin access',
          code: 'UNAUTHORIZED',
          details: 'Please contact your administrator for assistance.'
        });
        setIsVerified(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminAccess();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (errorState) {
    return <ErrorDisplay error={errorState} />;
  }

  if (!isVerified) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
