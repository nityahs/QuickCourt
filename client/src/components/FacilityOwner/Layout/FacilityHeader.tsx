import React from 'react';
import { motion } from 'framer-motion';
import { Menu, Bell, User, ChevronRight } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface FacilityHeaderProps {
  onMenuToggle: () => void;
}

const getPageTitle = (page: string): string => {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    facilities: 'Facilities',
    courts: 'Courts',
    bookings: 'Bookings',
    'time-slots': 'Time Slots',
    profile: 'Profile'
  };
  return titles[page] || 'Dashboard';
};

const getBreadcrumbs = (page: string): Array<{ label: string; path?: string }> => {
  const breadcrumbs: Record<string, Array<{ label: string; path?: string }>> = {
    dashboard: [{ label: 'Dashboard' }],
    facilities: [
      { label: 'Dashboard', path: '/facility-owner' },
      { label: 'Facilities' }
    ],
    courts: [
      { label: 'Dashboard', path: '/facility-owner' },
      { label: 'Courts' }
    ],
    bookings: [
      { label: 'Dashboard', path: '/facility-owner' },
      { label: 'Bookings' }
    ],
    'time-slots': [
      { label: 'Dashboard', path: '/facility-owner' },
      { label: 'Time Slots' }
    ],
    profile: [
      { label: 'Dashboard', path: '/facility-owner' },
      { label: 'Profile' }
    ]
  };
  return breadcrumbs[page] || [{ label: 'Dashboard' }];
};

const FacilityHeader: React.FC<FacilityHeaderProps> = ({ onMenuToggle }) => {
  const { user } = useAuth();
  
  // Get current page from URL path
  const getCurrentPage = () => {
    const path = window.location.pathname;
    if (path === '/facility-owner') return 'dashboard';
    if (path.startsWith('/facility-owner/')) {
      return path.replace('/facility-owner/', '');
    }
    return 'dashboard';
  };

  const currentPage = getCurrentPage();
  const pageTitle = getPageTitle(currentPage);
  const breadcrumbs = getBreadcrumbs(currentPage);

  const handleBreadcrumbClick = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <header className="backdrop-blur-xl border-b shadow-sm" style={{ backgroundColor: 'var(--header-bg, rgba(255, 255, 255, 0.8))', borderColor: 'var(--border-color, rgba(229, 231, 235, 0.5))' }}>
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Left side - Menu button and breadcrumbs */}
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={onMenuToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--bg-secondary, #f9fafb)', color: 'var(--text-secondary, #4b5563)' }}
            aria-label="Toggle sidebar menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </motion.button>
          
          <div className="hidden sm:flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center space-x-2">
                {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                {crumb.path ? (
                  <a
                    href={crumb.path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleBreadcrumbClick(crumb.path!);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary, #111827)' }}>{crumb.label}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Notifications and user */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--bg-secondary, #f9fafb)', color: 'var(--text-secondary, #4b5563)' }}
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </motion.button>

          {/* User profile */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3 p-2 rounded-lg transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--bg-secondary, #f9fafb)' }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.fullName} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary, #111827)' }}>{user?.fullName}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary, #4b5563)' }}>Facility Owner</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Page title for mobile */}
      <div className="sm:hidden px-4 pb-4">
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary, #111827)' }}>{pageTitle}</h1>
      </div>
    </header>
  );
};

export default FacilityHeader;
