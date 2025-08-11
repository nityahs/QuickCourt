import React from 'react';
import { Home, MapPin, Calendar, User, Settings } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const menuItems = [
    { 
      icon: Home, 
      label: 'Home', 
      href: '/',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new Event('popstate'));
        onClose();
      } 
    },
    { 
      icon: MapPin, 
      label: 'Find Venues', 
      href: '/venues',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        window.history.pushState({}, '', '/venues');
        window.dispatchEvent(new Event('popstate'));
        onClose();
      } 
    },
    { 
      icon: Calendar, 
      label: 'My Bookings', 
      href: '/bookings',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        window.history.pushState({}, '', '/bookings');
        window.dispatchEvent(new Event('popstate'));
        onClose();
      } 
    },
    { 
      icon: User, 
      label: 'Profile', 
      href: '/profile',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        window.history.pushState({}, '', '/profile');
        window.dispatchEvent(new Event('popstate'));
        onClose();
      } 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      href: '/settings',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        window.history.pushState({}, '', '/settings');
        window.dispatchEvent(new Event('popstate'));
        onClose();
      } 
    },
  ];

  return (
    <div className="md:hidden">
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl animate-slide-in-left">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={item.onClick}
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="p-4 border-t">
            <p className="text-sm text-gray-500">
              Book venues easily with QuickCourt
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;