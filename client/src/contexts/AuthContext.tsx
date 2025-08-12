import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { authAPI } from '../services/auth';

const TOKEN_KEY = 'quickcourt_token';
const USER_ID_KEY = 'quickcourt_user_id';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Partial<User> & { password: string }) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  resendOtp: (email?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  verificationEmail: string;
  showOtpModal: boolean;
  setShowOtpModal: (show: boolean) => void;
  setVerificationEmail: (email: string) => void;
  setReturnPath: (path: string) => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationEmail, setVerificationEmail] = useState<string>('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [returnPath, setReturnPath] = useState<string>('/');
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          const userResponse = await authAPI.getProfile(token);
          const userData = userResponse.data;
          const clientUser: User = {
            id: userData._id,
            email: userData.email,
            fullName: userData.name,
            role: userData.role as User['role'],
            isVerified: userData.otpVerified,
            avatar: userData.avatar,
          };
          setUser(clientUser);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const { token } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      const userResponse = await authAPI.getProfile(token);
      const userData = userResponse.data;
      const clientUser: User = {
        id: userData._id,
        email: userData.email,
        fullName: userData.name,
        role: userData.role === 'owner' ? 'facility_owner' : (userData.role as User['role']),
        isVerified: userData.otpVerified,
        avatar: userData.avatar,
      };
      setUser(clientUser);
      
      // Redirect based on user role
      if (clientUser.role === 'facility_owner') {
        navigate('/facility-owner');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      const code = error?.response?.data?.code;
      const userId = error?.response?.data?.userId;
      if (code === 'OTP_REQUIRED' && userId) {
        localStorage.setItem(USER_ID_KEY, String(userId));
        setVerificationEmail(email);
        setShowOtpModal(true);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    try {
      // Store current path before showing OTP modal
      setReturnPath(window.location.pathname);
      
      const response = await authAPI.signup(
        userData.fullName!,
        userData.email!,
        userData.password,
        userData.role === 'facility_owner' ? 'owner' : userData.role || 'user'
      );
      const { userId } = response.data;
      localStorage.setItem(USER_ID_KEY, userId);
      setVerificationEmail(userData.email!);
      setShowOtpModal(true); 
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setVerificationEmail('');
    setShowOtpModal(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    navigate('/');
  };

  const verifyOtp = async (otp: string): Promise<void> => {
    setIsLoading(true);
    try {
      let userId = localStorage.getItem(USER_ID_KEY);
      if (!userId) {
        throw new Error('User ID not found for OTP verification.');
      }
      const response = await authAPI.verifyOtp(userId, otp);
      const { token } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      const userResponse = await authAPI.getProfile(token);
      const userData = userResponse.data;
      const verifiedUser: User = {
        id: userData._id,
        email: userData.email,
        fullName: userData.name,
        role: userData.role === 'owner' ? 'facility_owner' : (userData.role as User['role']),
        isVerified: true,
        avatar: userData.avatar,
      };
      setUser(verifiedUser);
      setShowOtpModal(false);
      
      // Redirect based on user role after OTP verification
      if (verifiedUser.role === 'facility_owner') {
        navigate('/facility-owner');
      } else {
        navigate(returnPath); // Navigate back to where user was before signup
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      throw new Error(error?.response?.data?.error || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email?: string): Promise<void> => {
    setIsLoading(true);
    try {
      const targetEmail = email || verificationEmail;
      if (!targetEmail) {
        throw new Error('No email provided for OTP resend');
      }
      const resp = await authAPI.resendOtp(targetEmail);
      const serverUserId = (resp as any)?.data?.userId;
      if (serverUserId) {
        localStorage.setItem(USER_ID_KEY, String(serverUserId));
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      throw new Error(error?.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update user data (for profile updates)
  const updateUser = (userData: Partial<User>) => {
    if (!user) return;
    
    setUser({
      ...user,
      ...userData
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        verifyOtp,
        resendOtp,
        logout,
        isLoading,
        verificationEmail,
        showOtpModal,
        setShowOtpModal,
        setVerificationEmail,
        setReturnPath,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};