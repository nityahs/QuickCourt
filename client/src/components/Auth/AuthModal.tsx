import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSwitchMode?: (mode: 'login' | 'signup') => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login', onSwitchMode }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Update mode when initialMode prop changes
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [initialMode, isOpen, onClose]);

  // Custom mode setter
  const handleSetMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    if (onSwitchMode) {
      onSwitchMode(newMode);
    }
  };

  // Close on ESC
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
    } else {
      document.removeEventListener('keydown', handleKey);
    }
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, handleKey]);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 240, damping: 22 } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-8 text-center">
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              onClick={onClose}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal */}
            <motion.div
              role="dialog"
              aria-modal="true"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              className="relative inline-block align-bottom sm:align-middle w-full max-w-lg text-left rounded-2xl shadow-2xl border border-white/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg ring-1 ring-black/5 overflow-hidden" >
              {/* Accent top bar */}
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-blue-500 to-fuchsia-500" />
              <button
                onClick={onClose}
                aria-label="Close authentication modal"
                className="absolute top-3 right-3 p-2 rounded-full bg-white/60 dark:bg-slate-700/60 hover:bg-white/90 dark:hover:bg-slate-700 transition shadow focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <X size={18} className="text-gray-600 dark:text-gray-300" />
              </button>
              <div className="px-6 py-6 md:py-7">
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
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;