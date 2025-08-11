import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import MobileMenu from './components/Layout/MobileMenu';
import AuthModal from './components/Auth/AuthModal';
import OtpVerification from './components/Auth/OtpVerification';
import AppRoutes from './routes'; 

function AppContent() {
  const { showOtpModal, setShowOtpModal } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'login') {
        setAuthMode('login');
        setShowAuthModal(true);
      } else if (hash === 'signup') {
        setAuthMode('signup');
        setShowAuthModal(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); 
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
        showMobileMenu={showMobileMenu}
        onLogin={() => { setAuthMode('login'); setShowAuthModal(true); }}
        onSignup={() => { setAuthMode('signup'); setShowAuthModal(true); }}
      />
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      />
      <main>
        <AppRoutes />
      </main>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onSwitchMode={setAuthMode}
      />
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <OtpVerification
              onVerificationComplete={() => setShowOtpModal(false)}
              onBack={() => {
                setShowOtpModal(false);
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;