import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

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
    // Check for stored user session
    const storedUser = localStorage.getItem('quickcourt_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data
      const mockUser: User = {
        id: '1',
        email,
        fullName: 'John Doe',
        role: 'user',
        isVerified: true,
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
      };
      
      setUser(mockUser);
      localStorage.setItem('quickcourt_user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email!,
        fullName: userData.fullName!,
        role: userData.role || 'user',
        isVerified: false,
        avatar: userData.avatar
      };
      
      setUser(newUser);
      localStorage.setItem('quickcourt_user', JSON.stringify(newUser));
      
      // Return the user for further processing
      return newUser;
    } catch (error) {
      throw new Error('Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('quickcourt_user');
  };

  const verifyOtp = async (otp: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would validate the OTP with the backend
      if (user) {
        const verifiedUser: User = {
          ...user,
          isVerified: true
        };
        
        setUser(verifiedUser);
        localStorage.setItem('quickcourt_user', JSON.stringify(verifiedUser));
      }
    } catch (error) {
      throw new Error('OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const resendOtp = async (email?: string): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would trigger the backend to send a new OTP
      // For now, we just simulate success
      const targetEmail = email || verificationEmail || user?.email;
      if (!targetEmail) {
        throw new Error('No email provided for OTP resend');
      }
      
      // Store the email for verification purposes
      setVerificationEmail(targetEmail);
    } catch (error) {
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