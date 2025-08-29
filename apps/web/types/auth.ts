export interface RegisterData {
  email: string;
  password: string;
  fullname: string;
  publicName?: string;
  jobTitle?: string;
  organization?: string;
  location?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    fullname: string | null;
    publicName?: string | null;
    avatarUrl?: string | null;
    emailVerify: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  fullname: string | null;
  publicName?: string | null;
  jobTitle?: string | null;
  organization?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  emailVerify: boolean;
  language: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}
