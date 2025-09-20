import { RegisterData, LoginData, AuthResponse, User } from "@/types/auth";
import { apiRequest } from "./api-request";

// Legacy Auth API Service (keeping for backward compatibility)
class ApiService {
  // Authentication APIs
  async register(data: RegisterData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: data,
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: data,
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
  }

  async getProfile(token: string): Promise<User> {
    return apiRequest<User>("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async verifyEmail(
    token: string
  ): Promise<{ message: string; verified: boolean }> {
    return apiRequest<{ message: string; verified: boolean }>(
      `/auth/verify-email?token=${encodeURIComponent(token)}`
    );
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>("/auth/resend-verification", {
      method: "POST",
      body: { email },
    });
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  }

  async resetPassword(
    token: string,
    password: string
  ): Promise<{ message: string }> {
    return apiRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: { token, password },
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return apiRequest<{ message: string }>("/auth/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    });
  }

  // Profile APIs
  async getProfile(): Promise<User> {
    return apiRequest<User>("/users/profile");
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return apiRequest<User>("/users/profile", {
      method: "PUT",
      body: data,
    });
  }
}

export const apiService = new ApiService();
