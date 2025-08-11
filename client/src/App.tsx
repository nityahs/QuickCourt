import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import MobileMenu from './components/Layout/MobileMenu';
import AuthModal from './components/Auth/AuthModal';
import OtpVerification from './components/Auth/OtpVerification';
import HeroSection from './components/Home/HeroSection';
import PopularSports from './components/Home/PopularSports';
import VenuesList from './components/Venues/VenuesList';
import VenueDetails from './components/Venues/VenueDetails';
import BookingForm from './components/Booking/BookingForm';
import UserProfile from './components/User/UserProfile';
import { Venue } from './types';

type AppView = 'home' | 'venues' | 'venue-details' | 'booking' | 'bookings' | 'profile' | 'verify-otp';

function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { user } = useAuth();

  // Handle path-based navigation
  useEffect(() => {
    const handlePathChange = () => {
      const path = window.location.pathname;
      console.log('Path changed to:', path);
      
      if (path === '/login') {
        console.log('Setting auth mode to login and showing modal');
        setAuthMode('login');
        setShowAuthModal(true);
      } else if (path === '/signup') {
        console.log('Setting auth mode to signup and showing modal');
        setAuthMode('signup');
        setShowAuthModal(true);
      } else if (path === '/verify-otp') {
        setCurrentView('verify-otp');
        setShowAuthModal(false);
      } else if (path === '/venues') {
        setCurrentView('venues');
      } else if (path === '/bookings') {
        setCurrentView('bookings');
      } else if (path === '/profile') {
        setCurrentView('profile');
      } else if (path === '/') {
        setCurrentView('home');
      }
    };

    // Check path on initial load
    handlePathChange();

    // Listen for popstate events (browser back/forward buttons)
    window.addEventListener('popstate', handlePathChange);
    
    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);
  
  // Remove the hash-based navigation useEffect
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      console.log('Hash changed to:', hash);
      
      if (hash === 'login') {
        console.log('Setting auth mode to login and showing modal');
        setAuthMode('login');
        setShowAuthModal(true);
      } else if (hash === 'signup') {
        console.log('Setting auth mode to signup and showing modal');
        setAuthMode('signup');
        setShowAuthModal(true);
      } else if (hash === 'verify-otp') {
        setCurrentView('verify-otp');
        setShowAuthModal(false);
      } else if (hash === 'venues') {
        setCurrentView('venues');
      } else if (hash === 'bookings') {
        setCurrentView('bookings');
      } else if (hash === 'profile') {
        setCurrentView('profile');
      }
    };

    // Check hash on initial load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  // Debug log to check if the modal should be shown
  useEffect(() => {
    console.log('Auth modal state:', { showAuthModal, authMode });
  }, [showAuthModal, authMode]);

  const handleViewVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    setCurrentView('venue-details');
  };

  const handleBookVenue = (venue: Venue) => {
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setSelectedVenue(venue);
    setCurrentView('booking');
  };

  const handleBookingComplete = () => {
    setCurrentView('bookings');
  };

  const handleVerificationComplete = () => {
    // Update user verification status and redirect to home
    if (user) {
      // In a real app, this would be handled by the API
      const updatedUser = { ...user, isVerified: true };
      localStorage.setItem('quickcourt_user', JSON.stringify(updatedUser));
    }
    setCurrentView('home');
    window.history.pushState({}, '', '/');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <>
            <HeroSection />
            <PopularSports />
            <div className="py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Venues</h2>
                  <p className="text-lg text-gray-600">Book your favorite sports venues</p>
                </div>
                <VenuesList onViewVenue={handleViewVenue} />
              </div>
            </div>
          </>
        );
      case 'verify-otp':
        return (
          <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
            <OtpVerification 
              onVerificationComplete={handleVerificationComplete}
              onBack={() => {
                setAuthMode('signup');
                setShowAuthModal(true);
                setCurrentView('home');
                window.location.hash = 'signup';
              }}
            />
          </div>
        );
      case 'venues':
        return <VenuesList onViewVenue={handleViewVenue} />;
      case 'venue-details':
        return selectedVenue ? (
          <VenueDetails
            venue={selectedVenue}
            onBack={() => setCurrentView('venues')}
            onBookVenue={handleBookVenue}
          />
        ) : null;
      case 'booking':
        return selectedVenue ? (
          <BookingForm
            venue={selectedVenue}
            onBack={() => setCurrentView('venue-details')}
            onBookingComplete={handleBookingComplete}
          />
        ) : null;
      case 'bookings':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-600">Your bookings will appear here.</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <UserProfile onBack={() => setCurrentView('home')} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onMenuToggle={() => setShowMobileMenu(!showMobileMenu)}
        showMobileMenu={showMobileMenu}
      />
      
      <MobileMenu
        isOpen={showMobileMenu}
        onClose={() => setShowMobileMenu(false)}
      />

      <main>
        {renderContent()}
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          console.log('Closing auth modal');
          setShowAuthModal(false);
          // Remove the path when closing the modal
          if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
            window.history.pushState("", document.title, '/');
          }
        }}
        initialMode={authMode}
      />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">QUICKCOURT</h3>
            <p className="text-gray-400">Book sports venues easily</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;