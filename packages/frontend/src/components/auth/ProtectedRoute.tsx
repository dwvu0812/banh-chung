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
  fallback = <div className="flex items-center justify-center min-h-screen">Loading...</div>,
  redirectTo = '/login',
  requireAuth = true,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isLoading) {
        if (requireAuth && !isAuthenticated) {
          router.push(redirectTo);
        } else {
          setIsChecking(false);
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  // Show loading state while checking authentication
  if (isLoading || isChecking) {
    return <>{fallback}</>;
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
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
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      if (!isLoading) {
        if (isAuthenticated) {
          router.push(redirectTo);
        } else {
          setIsChecking(false);
        }
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, redirectTo, router]);

  // Show loading state while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  // If user is authenticated, don't render children
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;