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

const extractErrorMessage = (error: any): string => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'An unexpected error occurred'
  );
};

export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  try {
    const response = await api.post<SignUpResponse>("/auth/signup", data);
    return response.data;
  } catch (error: any) {
    const message = extractErrorMessage(error);
    const field = error?.response?.data?.field ?? null;
    const err: any = new Error(message);
    err.field = field;
    throw err;
  }
};

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
};

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
  try {
    const response = await api.post<VerifyOtpResponse>("/auth/verify-otp", { otp, userId });
    return response.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
};

export const resendOtp = async (userId: string): Promise<any> => {
  try {
    const response = await api.post("/auth/resend-otp", { userId });
    return response.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
};

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const resetPassword = async ({ token, newPassword }: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
  try {
    const response = await api.post<ResetPasswordResponse>(`/auth/reset-password?token=${token}`, {
      newPassword,
    });
    return response.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
};

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
  try {
    const response = await api.post<RefreshTokenResponse>("/auth/refresh", data);
    return response.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>("/auth/forgot-password", { email });
    return response.data;
  } catch (error: any) {
    throw new Error(extractErrorMessage(error));
  }
};

export const logout = async (): Promise<{ message: string }> => {
  try {
    const response = await api.post<{ message: string }>("/auth/logout");
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    return response.data;
  } catch (error: any) {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    throw new Error(extractErrorMessage(error));
  }
};
