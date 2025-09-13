"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, AuthResponse } from "@/types/auth";
import { apiService } from "@/lib/api-service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<AuthResponse>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (token) {
          const userData = await apiService.getProfile(token);
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const saveAuthData = (authData: AuthResponse) => {
    localStorage.setItem("accessToken", authData.accessToken);
    localStorage.setItem("refreshToken", authData.refreshToken);
    setUser(authData.user as User);
  };

  const login = async (email: string, password: string) => {
    try {
      const authData = await apiService.login({ email, password });
      saveAuthData(authData);
      return authData.user as User; // Cast to User type
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: any) => {
    try {
      const authData = await apiService.register(data);
      saveAuthData(authData);
      return authData;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    router.push("/login");
  };

  const refreshAuth = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      const authData = await apiService.refreshToken(refreshToken);
      saveAuthData(authData);
    } catch (error) {
      logout();
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
