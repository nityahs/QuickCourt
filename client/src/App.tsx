import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import FacilityOwnerDashboard from './components/FacilityOwner/FacilityOwnerDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import { Venue } from './types';

type AppView = 'home' | 'venues' | 'venue-details' | 'booking' | 'bookings' | 'profile' | 'verify-otp' | 'facility-owner' | 'admin';

function AppContent() {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showFooter, setShowFooter] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const { user } = useAuth();

  // Handle scroll to show/hide footer
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show footer when user is near the bottom (within 100px)
      if (scrollTop + windowHeight >= documentHeight - 100) {
        setShowFooter(true);
      } else {
        setShowFooter(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        // Redirect admin users to home page, others can access bookings
        if (user?.role === 'admin') {
          setCurrentView('home');
          window.history.pushState({}, '', '/');
        } else {
          setCurrentView('bookings');
        }
      } else if (path === '/profile') {
        setCurrentView('profile');
      } else if (path === '/facility-owner') {
        console.log('Setting current view to facility-owner');
        setCurrentView('facility-owner');
      } else if (path === '/admin') {
        console.log('Setting current view to admin');
        setCurrentView('admin');
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
  
  // Remove the hash-based navigation useEffect and replace with OTP modal logic
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      console.log('Hash changed to:', hash);
      if (hash === 'verify-otp') {
        setShowOtpModal(true);
        setShowAuthModal(false);
      } else if (hash === 'login') {
        setAuthMode('login');
        setShowAuthModal(true);
      } else if (hash === 'signup') {
        setAuthMode('signup');
        setShowAuthModal(true);
      } else {
        setShowOtpModal(false);
      }
    };
    handleHashChange();
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
    // Close the OTP modal
    setShowOtpModal(false);
    // Clear the hash
    window.location.hash = '';
    // Redirect to home
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
      // Remove 'verify-otp' from main content, now handled as modal
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
        // Redirect admins to home page, show different content for facility owners vs regular users
        if (user?.role === 'admin') {
          // Redirect admin users to home page
          setCurrentView('home');
          window.history.pushState({}, '', '/');
          return null;
        } else if (user?.role === 'facility_owner') {
          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">All Bookings</h1>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600 mb-4">As a facility owner, you can manage all bookings through your dashboard.</p>
                <button
                  onClick={() => window.location.hash = 'facility-owner/bookings'}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          );
        } else {
          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600">Your bookings will appear here.</p>
              </div>
            </div>
          );
        }
      case 'profile':
        return (
          <UserProfile onBack={() => setCurrentView('home')} />
        );
      case 'facility-owner':
        // Check if user is logged in and has facility owner role
        if (!user || user.role !== 'facility_owner') {
          return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
                <p className="text-lg text-gray-600 mb-6">
                  You need to be logged in as a facility owner to access this dashboard.
                </p>
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login as Facility Owner
                </button>
              </div>
            </div>
          );
        }
        return <FacilityOwnerDashboard />;
      case 'admin':
        return <AdminDashboard />;
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
      <MobileMenu isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {renderContent()}
        </div>
      </main>
      
      <AuthModal
         isOpen={showAuthModal}
         onClose={() => {
           setShowAuthModal(false);
           if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
             window.history.pushState("", document.title, '/');
           }
         }}
         initialMode={authMode}
       />
      
      {showOtpModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-lg w-full">
            <OtpVerification
              onVerificationComplete={handleVerificationComplete}
              onBack={() => {
                setShowOtpModal(false);
                setAuthMode('signup');
                setShowAuthModal(true);
                window.location.hash = '';
              }}
            />
          </div>
        </div>
      )}
      
      <footer className={`bg-gray-800 text-white py-8 transition-all duration-500 ease-in-out ${
        showFooter ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
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
  // Place Router outside AuthProvider so AuthContext (which uses useNavigate) is within Router context
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;