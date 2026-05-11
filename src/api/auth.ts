import type { User } from "../types/user.type";
import api from "../config/api";

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpResponse {
  userId: string;
  message: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  const response = await api.post<SignUpResponse>("/auth/signup", data);

  if (response.status !== 201) {
    throw new Error("Failed to sign up");
  }

  return response.data;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", data);

  if (response.status !== 200) {
    throw new Error("Failed to log in");
  }

  return response.data;
}

export interface VerifyOtpRequest {
  otp: string;
  userId: string;
}

export interface VerifyOtpResponse {
  success?: boolean;
  message?: string;
  userId?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
  statusCode?: number;
  [key: string]: any;
}

export const verifyOtp = async ({ otp, userId }: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  const response = await api.post<VerifyOtpResponse>("/auth/verify-otp", { otp, userId });

  if (response.status !== 200) {
    throw new Error("Failed to verify OTP");
  }

  return response.data;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const resetPassword = async ({ token, newPassword }: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  const response = await api.post<ResetPasswordResponse>("/auth/reset-password", {
    newPassword: { token, newPassword },
  });

  if (response.status !== 200) {
    throw new Error("Failed to reset password");
  }

  return response.data;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const refreshToken = async (
  data: RefreshTokenRequest,
): Promise<RefreshTokenResponse> => {
  const response = await api.post<RefreshTokenResponse>("/auth/refresh", data);

  if (response.status !== 200) {
    throw new Error("Failed to refresh tokens");
  }

  return response.data;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>("/auth/forgot-password", { email });

  if (response.status !== 200) {
    throw new Error("Failed to send reset password email");
  }

  return response.data;
};

export const logout = async (): Promise<{ message: string }> => {
  const response = await api.post<{ message: string }>("/auth/logout");

  if (response.status !== 200) {
    throw new Error("Failed to logout");
  }

  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');

  return response.data;
};