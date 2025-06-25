import api from "./api";
import { useAuthStore } from "@/store/authStore";
import type { User } from "@/store/authStore";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post("/auth/login", credentials);
      const { accessToken, refreshToken, user } = response.data;

      // Store tokens and user data
      const authStore = useAuthStore.getState();
      authStore.setTokens(accessToken, refreshToken);
      authStore.setUser(user);

      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  /**
   * Logout user and clear all stored data
   */
  static async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate refresh token on server
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage
      const authStore = useAuthStore.getState();
      authStore.logout();

      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(): Promise<string> {
    try {
      const response = await api.post(
        "/auth/refresh",
        {},
        {
          withCredentials: true, // Include refresh token cookie
        }
      );

      const { accessToken } = response.data;

      // Update access token in store
      const authStore = useAuthStore.getState();
      authStore.setToken(accessToken);

      return accessToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      // If refresh fails, logout user
      this.logout();
      throw error;
    }
  }

  /**
   * Register new user
   */
  static async register(userData: {
    email: string;
    password: string;
    name: string;
    [key: string]: unknown;
  }): Promise<LoginResponse> {
    try {
      const response = await api.post("/auth/register", userData);
      const { accessToken, refreshToken, user } = response.data;

      // Store tokens and user data
      const authStore = useAuthStore.getState();
      authStore.setTokens(accessToken, refreshToken);
      authStore.setUser(user);

      return response.data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get("/auth/me");
      const user = response.data;

      // Update user data in store
      const authStore = useAuthStore.getState();
      authStore.setUser(user);

      return user;
    } catch (error) {
      console.error("Failed to get current user:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put("/auth/profile", userData);
      const user = response.data;

      // Update user data in store
      const authStore = useAuthStore.getState();
      authStore.setUser(user);

      return user;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    try {
      await api.put("/auth/change-password", passwordData);
    } catch (error) {
      console.error("Failed to change password:", error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<void> {
    try {
      await api.post("/auth/forgot-password", { email });
    } catch (error) {
      console.error("Failed to request password reset:", error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    try {
      await api.post("/auth/reset-password", {
        token,
        password: newPassword,
      });
    } catch (error) {
      console.error("Failed to reset password:", error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const authStore = useAuthStore.getState();
    return authStore.isAuthenticated && !!authStore.accessToken;
  }

  /**
   * Get current access token
   */
  static getAccessToken(): string | null {
    const authStore = useAuthStore.getState();
    return authStore.accessToken;
  }

  /**
   * Get current user
   */
  static getCurrentUserFromStore(): User | null {
    const authStore = useAuthStore.getState();
    return authStore.user;
  }
}

export default AuthService;
