import axios from 'axios';
import api from './facilities';

// Token storage key
const TOKEN_KEY = 'quickcourt_token';

export interface LoginResponse {
  token: string;
}

export interface SignupResponse {
  message: string;
  userId: string;
}

export interface VerifyOtpResponse {
  token: string;
}

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  otpVerified: boolean;
  reliabilityScore: number;
  cancellations: number;
  createdAt: string;
}

export const authAPI = {
  login: (email: string, password: string) => 
    api.post<LoginResponse>('/auth/login', { email, password }),
  
  signup: (name: string, email: string, password: string, role: string) => 
    api.post<SignupResponse>('/auth/signup', { name, email, password, role }),
  
  verifyOtp: (userId: string, otp: string) => 
    api.post<VerifyOtpResponse>('/auth/verify-otp', { userId, otp }),
  
  getProfile: (token: string) => 
    api.get<UserResponse>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
};

// Add a request interceptor to include the token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);