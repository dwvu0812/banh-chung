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

      setTokens: (accessToken: string, refreshToken?: string) =>
        set({
          accessToken,
          refreshToken: refreshToken || get().refreshToken,
          isAuthenticated: true,
        }),

      setToken: (token: string) =>
        set({
          accessToken: token,
          isAuthenticated: true,
        }),

      setUser: (user: User | null) => set({ user }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        }),

      clearTokens: () =>
        set({
          accessToken: null,
          refreshToken: null,
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
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
