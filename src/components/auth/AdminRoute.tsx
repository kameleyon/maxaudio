import { useUser, useSession } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ErrorDisplay, type ErrorDetails } from '../errors/ErrorDisplay';

interface AdminRouteProps {
  children: React.ReactNode;
  requiredAccessLevel?: AdminAccessLevel;
}

type AdminAccessLevel = 'basic' | 'moderate' | 'full';

interface AdminMetadata {
  role?: string;
  accessLevel?: AdminAccessLevel;
  teamId?: string;
  permissions?: string[];
}

const ACCESS_LEVELS: { [K in AdminAccessLevel]: number } = {
  basic: 0,
  moderate: 1,
  full: 2
};

export function AdminRoute({ children, requiredAccessLevel = 'basic' }: AdminRouteProps) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { session } = useSession();
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorState, setErrorState] = useState<ErrorDetails | null>(null);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (!isSignedIn || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const metadata = user.publicMetadata as AdminMetadata;

        // 1. Verify admin role
        if (metadata?.role !== 'admin') {
          throw new Error('Unauthorized: Admin role required');
        }

        // 2. Verify access level
        const userAccessLevel = metadata?.accessLevel || 'basic';
        if (ACCESS_LEVELS[userAccessLevel] < ACCESS_LEVELS[requiredAccessLevel]) {
          throw new Error(`Insufficient access level: ${requiredAccessLevel} required`);
        }

        // 3. Verify team membership
        if (!metadata?.teamId) {
          throw new Error('No team association found');
        }

        // 4. Verify specific permissions if needed
        const userPermissions = metadata?.permissions || [];
        if (!Array.isArray(userPermissions) || !userPermissions.includes('admin:access')) {
          throw new Error('Missing required permissions');
        }

        // Optional: Make an API call to verify admin status on the backend
        if (session) {
          const token = await session.getToken();
          const response = await fetch('/api/verify-admin', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to verify admin status');
          }
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

    if (isLoaded) {
      verifyAdminAccess();
    }
  }, [isLoaded, isSignedIn, user, requiredAccessLevel, session]);

  if (!isLoaded || isLoading) {
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
