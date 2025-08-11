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
    if (hash.includes('facility-owner/facilities')) return 'facilities';
    if (hash.includes('facility-owner/courts')) return 'courts';
    if (hash.includes('facility-owner/bookings')) return 'bookings';
    if (hash.includes('facility-owner/time-slots')) return 'time-slots';
    if (hash.includes('facility-owner/profile')) return 'profile';
    return 'dashboard';
  };

  const currentSection = getCurrentSection();

  const renderContent = () => {
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
      {renderContent()}
    </FacilityOwnerLayout>
  );
};

export default FacilityOwnerDashboard;
