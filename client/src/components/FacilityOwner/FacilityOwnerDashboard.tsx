import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import FacilityOwnerLayout from './Layout/FacilityOwnerLayout';
import Dashboard from './Dashboard/Dashboard';
import FacilityList from './Facilities/FacilityList';
import CourtManagement from './Courts/CourtManagement';
import BookingOverview from './Bookings/BookingOverview';
import AvailabilityCalendar from './TimeSlots/AvailabilityCalendar';
import UserProfile from './Profile/UserProfile';

const FacilityOwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Get the current section from the URL hash
  const getCurrentSection = () => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'facility-owner') return 'dashboard';
    if (hash.startsWith('facility-owner/')) {
      return hash.replace('facility-owner/', '');
    }
    return 'dashboard';
  };

  const currentSection = getCurrentSection();

  // Debug section for testing
  const renderDebugInfo = () => {
    // Check if we're in development mode by looking for common development indicators
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Info</h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p><strong>Current User:</strong> {user?.fullName} ({user?.email})</p>
            <p><strong>User Role:</strong> {user?.role}</p>
            <p><strong>Current Section:</strong> {currentSection}</p>
            <p><strong>URL Hash:</strong> {window.location.hash}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'facilities':
        return <FacilityList />;
      case 'courts':
        return <CourtManagement />;
      case 'bookings':
        return <BookingOverview />;
      case 'time-slots':
        return <AvailabilityCalendar />;
      case 'profile':
        return <UserProfile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <FacilityOwnerLayout>
      {renderDebugInfo()}
      {renderSection()}
    </FacilityOwnerLayout>
  );
};

export default FacilityOwnerDashboard;
