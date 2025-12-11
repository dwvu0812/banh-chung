import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { AuthService } from '@/lib/auth';
import type { User } from '@/store/authStore';

// Helper function to extract error message from unknown error
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || defaultMessage;
  }
  return defaultMessage;
};

/**
 * Custom hook for authentication state management
 * Provides easy access to auth state and methods
 */
export const useAuth = () => {
  const {
    accessToken,
    refreshToken,
    user,
    isAuthenticated,
    setTokens,
    setToken,
    setUser,
    logout,
    clearTokens,
  } = useAuthStore();

  // Track if we're still initializing (waiting for Zustand persist to hydrate)
  const [isHydrated, setIsHydrated] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Wait for Zustand persist to hydrate the store
  useEffect(() => {
    // Small delay to ensure Zustand persist has finished hydrating
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Initialize auth state after hydration
  useEffect(() => {
    if (!isHydrated) return;

    const initializeAuth = async () => {
      // If we have a token but no user data, try to fetch current user
      if (accessToken && !user && isAuthenticated) {
        setIsValidating(true);
        try {
          await AuthService.getCurrentUser();
        } catch (error) {
          console.error('Failed to validate user session:', error);
          
          // Check if it's a network error vs auth error
          if (error && typeof error === 'object' && 'response' in error) {
            const response = (error as { response?: { status?: number } }).response;
            
            // Only logout if it's definitely an auth error (401, 403)
            if (response?.status === 401 || response?.status === 403) {
              console.warn('Session expired, logging out...');
              clearTokens();
            } else {
              // For other errors (network, 500, etc.), keep the session
              console.warn('Network or server error, keeping session active');
            }
          } else {
            // For unknown errors, keep the session to avoid unexpected logouts
            console.warn('Unknown error during auth validation, keeping session active');
          }
        } finally {
          setIsValidating(false);
        }
      }
    };

    initializeAuth();
  }, [isHydrated, accessToken, user, isAuthenticated, clearTokens]);

  /**
   * Login wrapper with error handling
   */
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const result = await AuthService.login(credentials);
      return { success: true, data: result };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error, 'Login failed'),
      };
    }
  };

  /**
   * Register wrapper with error handling
   */
  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    [key: string]: unknown;
  }) => {
    try {
      const result = await AuthService.register(userData);
      return { success: true, data: result };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error, 'Registration failed'),
      };
    }
  };

  /**
   * Logout wrapper
   */
  const handleLogout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Force local logout even if API call fails
      logout();
    }
  };

  /**
   * Update profile wrapper
   */
  const updateProfile = async (userData: Partial<User>) => {
    try {
      const result = await AuthService.updateProfile(userData);
      return { success: true, data: result };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error, 'Profile update failed'),
      };
    }
  };

  /**
   * Change password wrapper
   */
  const changePassword = async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    try {
      await AuthService.changePassword(passwordData);
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error, 'Password change failed'),
      };
    }
  };

  /**
   * Request password reset wrapper
   */
  const requestPasswordReset = async (email: string) => {
    try {
      await AuthService.requestPasswordReset(email);
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error, 'Password reset request failed'),
      };
    }
  };

  /**
   * Reset password wrapper
   */
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await AuthService.resetPassword(token, newPassword);
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: getErrorMessage(error, 'Password reset failed'),
      };
    }
  };

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    // Improved loading logic: loading if we're not hydrated yet, or if we're validating auth
    isLoading: !isHydrated || isValidating || (!isAuthenticated && accessToken),
    
    // Actions
    login,
    register,
    logout: handleLogout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    
    // Direct store actions (for advanced usage)
    setTokens,
    setToken,
    setUser,
    clearTokens,
  };
};

export default useAuth;