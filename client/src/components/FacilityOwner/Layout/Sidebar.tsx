import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  User, 
  LogOut,
  X,
  Menu
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/facility-owner' },
  { id: 'facilities', label: 'Facilities', icon: Building2, path: '/facility-owner/facilities' },
  { id: 'courts', label: 'Courts', icon: MapPin, path: '/facility-owner/courts' },
  { id: 'bookings', label: 'Bookings', icon: Calendar, path: '/facility-owner/bookings' },
  { id: 'time-slots', label: 'Time Slots', icon: Clock, path: '/facility-owner/time-slots' },
  { id: 'profile', label: 'Profile', icon: User, path: '/facility-owner/profile' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onToggle(); // Close mobile menu
  };

  // Get current page from path
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/facility-owner') return 'dashboard';
    if (path.startsWith('/facility-owner/')) {
      return path.replace('/facility-owner/', '');
    }
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 left-0 z-50 w-64 backdrop-blur-xl shadow-xl`}
        style={{ backgroundColor: 'var(--header-bg, rgba(255, 255, 255, 0.8))', borderRight: '1px solid var(--border-color, rgba(229, 231, 235, 0.5))' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border-color, rgba(229, 231, 235, 0.5))' }}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">QC</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                QuickCourt
              </h1>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--bg-secondary, #f9fafb)', color: 'var(--text-secondary, #4b5563)' }}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <motion.div
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200`}
                  style={{
                    backgroundColor: isActive ? 'var(--gradient-start, rgba(16,185,129,0.10))' : 'transparent',
                    color: isActive ? 'var(--accent-primary, #10b981)' : 'var(--text-secondary, #4b5563)',
                    border: isActive ? `1px solid var(--border-color, rgba(229, 231, 235, 0.5))` : 'none'
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: isActive ? 'var(--accent-primary, #10b981)' : 'var(--text-secondary, #4b5563)' }} />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4" style={{ borderTop: '1px solid var(--border-color, rgba(229, 231, 235, 0.5))' }}>
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200"
              style={{ color: 'var(--text-secondary, #4b5563)', backgroundColor: 'var(--bg-secondary, #f9fafb)' }}
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;
