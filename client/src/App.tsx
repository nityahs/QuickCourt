import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SearchProvider } from './contexts/SearchContext';
import { SocketProvider } from './contexts/SocketContext';
import Header from './components/Layout/Header';
import MobileMenu from './components/Layout/MobileMenu';
import AuthModal from './components/Auth/AuthModal';
import OtpVerification from './components/Auth/OtpVerification';
import OfferNotifications from './components/Offers/OfferNotifications';
import AppRoutes from './routes'; 

// Simple Error Boundary to prevent complete white screen
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }>{
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('App ErrorBoundary caught an error', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p className="text-gray-600 mb-6">The page crashed. Try refreshing or going back home.</p>
          <div className="space-x-3">
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded">Reload</button>
            <button onClick={() => (window.location.href = '/')} className="px-4 py-2 border rounded">Home</button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-6 max-w-xl text-left text-xs bg-gray-100 p-4 rounded overflow-auto">{String(this.state.error?.stack || this.state.error)}</pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

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
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
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
              onVerificationComplete={() => {
                setShowOtpModal(false);
                setShowAuthModal(false);
              }}
              onBack={() => {
                setShowOtpModal(false);
                setAuthMode('signup');
                setShowAuthModal(true);
              }}
            />
          </div>
        </div>
      )}
      <OfferNotifications />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <SearchProvider>
            <AppContent />
          </SearchProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;