import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Import components
import HeroSection from './components/Home/HeroSection';
import PopularSports from './components/Home/PopularSports';
import VenuesList from './components/Venues/VenuesList';
import VenueDetails from './components/Venues/VenueDetails';
import BookingForm from './components/Booking/BookingForm';
import UserProfile from './components/User/UserProfile';
import FacilityOwnerDashboard from './components/FacilityOwner/FacilityOwnerDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import { Venue } from './types';

// Home Page Component
const HomePage = () => {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  
  const handleViewVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    // Navigate to venue details - for now we'll handle this in the parent component
    console.log('Navigate to venue:', venue);
  };

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
};

// Bookings Page Component
const BookingsPage = () => {
  const { user } = useAuth();
  
  if (user?.role === 'admin') {
    return <Navigate to="/" replace />;
  }
  
  if (user?.role === 'facility_owner') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Bookings</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 mb-4">As a facility owner, you can manage all bookings through your dashboard.</p>
          <button
            onClick={() => window.location.hash = 'facility-owner'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Your bookings will appear here.</p>
      </div>
    </div>
  );
};

// Venues Page Component
const VenuesPage = () => {
  const handleViewVenue = (venue: Venue) => {
    console.log('Navigate to venue:', venue);
  };
  
  return <VenuesList onViewVenue={handleViewVenue} />;
};

// Profile Page Component
const ProfilePage = () => {
  return (
    <UserProfile onBack={() => window.history.back()} />
  );
};

// Facility Owner Page Component
const FacilityOwnerPage = () => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'facility_owner') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-lg text-gray-600 mb-6">
            You need to be logged in as a facility owner to access this dashboard.
          </p>
          <button
            onClick={() => window.location.hash = 'login'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login as Facility Owner
          </button>
        </div>
      </div>
    );
  }
  
  return <FacilityOwnerDashboard />;
};

// Main AppRoutes Component
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/venues" element={<VenuesPage />} />
      <Route path="/bookings" element={<BookingsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/facility-owner" element={<FacilityOwnerPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
