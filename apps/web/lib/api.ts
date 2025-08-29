import { RegisterData, LoginData, AuthResponse, User } from "@/types/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // Authentication APIs
  async register(data: RegisterData): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getProfile(token: string): Promise<User> {
    return this.request<User>("/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async verifyEmail(
    token: string
  ): Promise<{ message: string; verified: boolean }> {
    return this.request<{ message: string; verified: boolean }>(
      `/auth/verify-email?token=${token}`
    );
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }
}

export const apiService = new ApiService();
