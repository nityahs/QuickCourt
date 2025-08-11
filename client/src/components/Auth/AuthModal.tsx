import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

// Debug log
const DEBUG = true;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Update mode when initialMode prop changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
    if (DEBUG) {
      console.log('AuthModal props:', { isOpen, initialMode });
    }
    
    // Close modal if hash is set to verify-otp
    if (window.location.hash === '#verify-otp') {
      onClose();
    }
  }, [initialMode, isOpen, onClose]);

  // Custom mode setter that also updates URL hash
  const handleSetMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    window.location.hash = newMode;
    if (DEBUG) {
      console.log('Mode changed to:', newMode);
    }
  };

  if (!isOpen) {
    if (DEBUG) {
      console.log('AuthModal not rendering because isOpen is false');
    }
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <X size={24} />
            </button>
          </div>

          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {mode === 'login' ? (
              <LoginForm
                onSwitchToSignup={() => handleSetMode('signup')}
                onClose={onClose}
              />
            ) : (
              <SignupForm
                onSwitchToLogin={() => handleSetMode('login')}
                onClose={onClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;