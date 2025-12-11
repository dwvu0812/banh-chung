'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Higher-order component for protecting routes
 * Redirects unauthenticated users to login page
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback = (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border border-primary border-t-transparent mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  ),
  redirectTo = '/login',
  requireAuth = true,
}) => {
  const { isAuthenticated, isLoading, accessToken } = useAuth();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      // Only proceed with auth check when not loading
      if (!isLoading) {
        setHasChecked(true);
        
        if (requireAuth) {
          // Check both isAuthenticated and accessToken for double verification
          const isActuallyAuthenticated = isAuthenticated && accessToken;
          
          if (!isActuallyAuthenticated) {
            // Delay redirect slightly to avoid flash
            setTimeout(() => {
              setShouldRedirect(true);
            }, 100);
          }
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, requireAuth, accessToken]);

  // Handle redirect after state is confirmed
  useEffect(() => {
    if (shouldRedirect) {
      router.push(redirectTo);
    }
  }, [shouldRedirect, router, redirectTo]);

  // Show loading state while checking authentication or during redirect
  if (isLoading || !hasChecked || shouldRedirect) {
    return <>{fallback}</>;
  }

  // Final check: if auth is required but user is not authenticated, don't render
  if (requireAuth && (!isAuthenticated || !accessToken)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Component for routes that should only be accessible to unauthenticated users
 * (e.g., login, register pages)
 */
export const GuestRoute: React.FC<{
  children: React.ReactNode;
  redirectTo?: string;
}> = ({ children, redirectTo = '/dashboard' }) => {
  const { isAuthenticated, isLoading, accessToken } = useAuth();
  const router = useRouter();
  const [hasChecked, setHasChecked] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (!isLoading) {
        setHasChecked(true);
        
        // Check both isAuthenticated and accessToken
        const isActuallyAuthenticated = isAuthenticated && accessToken;
        
        if (isActuallyAuthenticated) {
          // Delay redirect slightly to avoid flash
          setTimeout(() => {
            setShouldRedirect(true);
          }, 100);
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, accessToken]);

  // Handle redirect after state is confirmed
  useEffect(() => {
    if (shouldRedirect) {
      router.push(redirectTo);
    }
  }, [shouldRedirect, router, redirectTo]);

  // Show loading state while checking authentication or during redirect
  if (isLoading || !hasChecked || shouldRedirect) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, don't render children
  if (isAuthenticated && accessToken) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;