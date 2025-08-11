import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authAPI, UserResponse } from '../services/auth';

// Token storage key
const TOKEN_KEY = 'quickcourt_token';
const USER_ID_KEY = 'quickcourt_user_id';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: Partial<User> & { password: string }) => Promise<User>;
  verifyOtp: (otp: string) => Promise<void>;
  resendOtp: (email?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  verificationEmail: string;
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

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check for stored token
        const token = localStorage.getItem(TOKEN_KEY);
        
        if (token) {
          // Get user profile from server
          const userResponse = await authAPI.getProfile(token);
          const userData = userResponse.data;
          
          // Convert server user model to client user model
          const user: User = {
            id: userData._id,
            email: userData.email,
            fullName: userData.name,
            role: userData.role as User['role'],
            isVerified: userData.otpVerified,
            avatar: userData.avatar
          };
          
          setUser(user);
          localStorage.setItem('quickcourt_user', JSON.stringify(user));
        } else {
          // Fallback to stored user if no token (for backward compatibility)
          const storedUser = localStorage.getItem('quickcourt_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Clear potentially invalid data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('quickcourt_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call the login API
      const response = await authAPI.login(email, password);
      const { token } = response.data;
      
      // Store the token
      localStorage.setItem(TOKEN_KEY, token);
      
      // Get user profile
      const userResponse = await authAPI.getProfile(token);
      const userData = userResponse.data;
      
      // Convert server user model to client user model
      const user: User = {
        id: userData._id,
        email: userData.email,
        fullName: userData.name,
        role: userData.role === 'owner' ? 'facility_owner' : userData.role as User['role'],
        isVerified: userData.otpVerified,
        avatar: userData.avatar
      };
      
      setUser(user);
      localStorage.setItem('quickcourt_user', JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    try {
      // Call the signup API
      const response = await authAPI.signup(
        userData.fullName!, 
        userData.email!, 
        userData.password, 
        userData.role === 'facility_owner' ? 'owner' : (userData.role || 'user')
      );
      
      // Store the userId for OTP verification
      const { userId } = response.data;
      localStorage.setItem(USER_ID_KEY, userId);
      
      // Create a temporary user object
      const newUser: User = {
        id: userId,
        email: userData.email!,
        fullName: userData.fullName!,
        role: userData.role || 'user',
        isVerified: false,
        avatar: userData.avatar
      };
      
      setUser(newUser);
      localStorage.setItem('quickcourt_user', JSON.stringify(newUser));
      
      // Store the email for verification purposes
      setVerificationEmail(userData.email!);
      
      // Return the user for further processing
      return newUser;
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quickcourt_user');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
  };

  const verifyOtp = async (otp: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Get the userId from storage
      const userId = localStorage.getItem(USER_ID_KEY);
      
      if (!userId) {
        throw new Error('User ID not found');
      }
      
      // Call the verify OTP API
      const response = await authAPI.verifyOtp(userId, otp);
      const { token } = response.data;
      
      // Store the token
      localStorage.setItem(TOKEN_KEY, token);
      
      // Get user profile
      const userResponse = await authAPI.getProfile(token);
      const userData = userResponse.data;
      
      // Convert server user model to client user model
      const verifiedUser: User = {
        id: userData._id,
        email: userData.email,
        fullName: userData.name,
        role: userData.role === 'owner' ? 'facility_owner' : userData.role as User['role'],
        isVerified: true,
        avatar: userData.avatar
      };
      
      setUser(verifiedUser);
      localStorage.setItem('quickcourt_user', JSON.stringify(verifiedUser));
    } catch (error) {
      console.error('OTP verification error:', error);
      throw new Error('OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resendOtp = async (email?: string): Promise<void> => {
    setIsLoading(true);
    try {
      // In a real implementation, we would have an API endpoint to resend OTP
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const targetEmail = email || verificationEmail || user?.email;
      if (!targetEmail) {
        throw new Error('No email provided for OTP resend');
      }
      
      // Store the email for verification purposes
      setVerificationEmail(targetEmail);
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw new Error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      verifyOtp,
      resendOtp,
      logout,
      isLoading,
      verificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};