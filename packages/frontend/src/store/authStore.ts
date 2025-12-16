import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  [key: string]: unknown;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken?: string) => void;
  setToken: (token: string) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  clearTokens: () => void;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      setTokens: (accessToken: string, refreshToken?: string) => {
        const currentState = get();
        set({
          accessToken,
          refreshToken: refreshToken || currentState.refreshToken,
          isAuthenticated: !!accessToken, // Only set as authenticated if we have a token
        });
      },

      setToken: (token: string) =>
        set({
          accessToken: token,
          isAuthenticated: !!token, // Only set as authenticated if we have a token
        }),

      setUser: (user: User | null) => set({ user }),

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
        
        // Clear localStorage manually to ensure cleanup
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('auth-storage');
          } catch (error) {
            console.error('Failed to clear auth storage:', error);
          }
        }
      },

      clearTokens: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null, // Also clear user when clearing tokens
          isAuthenticated: false,
        }),

      isSuperAdmin: () => {
        const { user } = get();
        return user?.role === "super_admin";
      },

      isAdmin: () => {
        const { user } = get();
        return user?.role === "admin" || user?.role === "super_admin";
      },
    }),
    {
      name: "auth-storage", // Key name in localStorage
      version: 1, // Add version for migration support
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Add storage error handling
      onRehydrateStorage: () => (state) => {
        // Validate state integrity after rehydration
        if (state) {
          // If we have a token but isAuthenticated is false, or vice versa, fix it
          if (state.accessToken && !state.isAuthenticated) {
            state.isAuthenticated = true;
          } else if (!state.accessToken && state.isAuthenticated) {
            state.isAuthenticated = false;
            state.user = null;
          }
        }
      },
    }
  )
);
