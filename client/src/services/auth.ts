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
  
  signup: (name: string, email: string, password: string, role: string) => {
    console.log('[authAPI] Sending signup request:', { fullName: name, email, role, hasPassword: !!password });
    return api.post<SignupResponse>('/auth/signup', { fullName: name, email, password, role })
      .catch(error => {
        console.error('[authAPI] Signup request failed:', error.response?.data);
        throw error;
      });
  },
  
  verifyOtp: (userId: string, otp: string) => 
    api.post<VerifyOtpResponse>('/auth/verify-otp', { userId, otp }),
  
  getProfile: (token: string) => 
    api.get<UserResponse>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }),
    
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
    
  updateProfile: (profileData: { name?: string; fullName?: string; avatar?: string }) =>
    api.put<UserResponse>('/auth/profile', profileData),
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