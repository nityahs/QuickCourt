import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import FacilityOwnerLayout from './Layout/FacilityOwnerLayout';
import Dashboard from './Dashboard/Dashboard';
import FacilityList from './Facilities/FacilityList';
import CourtManagement from './Courts/CourtManagement';
import BookingOverview from './Bookings/BookingOverview';
import AvailabilityCalendar from './TimeSlots/AvailabilityCalendar';
import UserProfile from './Profile/UserProfile';

const FacilityOwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the current section from the URL path
  const getCurrentSection = () => {
    const path = location.pathname;
    console.log('Current path:', path); // Debug log
    if (path === '/facility-owner' || path === '/facility-owner/') return 'dashboard';
    if (path.includes('/facility-owner/facilities')) return 'facilities';
    if (path.includes('/facility-owner/courts')) return 'courts';
    if (path.includes('/facility-owner/bookings')) return 'bookings';
    if (path.includes('/facility-owner/time-slots')) return 'time-slots';
    if (path.includes('/facility-owner/profile')) return 'profile';
    return 'dashboard';
  };

  const currentSection = getCurrentSection();
  console.log('Current section:', currentSection);
  
  // Ensure dashboard is shown by default
  useEffect(() => {
    console.log('FacilityOwnerDashboard mounted, path:', location.pathname);
    // Fix for trailing slash issue
    if (location.pathname === '/facility-owner/') {
      navigate('/facility-owner');
    }
  }, [location.pathname, navigate]);
  
  // Debug log for rendering
  console.log('FacilityOwnerDashboard rendering, user:', user?.id);

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
