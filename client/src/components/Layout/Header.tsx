import React, { useState } from 'react';
import { Menu, X, User, LogOut, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuToggle?: () => void;
  showMobileMenu?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, showMobileMenu }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="backdrop-blur bg-white/70 border-b border-white/60 sticky top-0 z-50">
      <div className="relative">
        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-emerald-400/50 via-sky-400/50 to-blue-400/50" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-white/60"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex-shrink-0 ml-2 md:ml-0">
              <h1 className="text-2xl font-extrabold tracking-tight"><span className="text-gray-900">QUICK</span><span className="text-gradient">COURT</span></h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {[
              { label: 'Home', path: '/' },
              { label: 'Venues', path: '/venues' },
              { label: 'My Bookings', path: '/bookings' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.path}
                className="group relative px-3 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600"
                onClick={(e) => {
                  e.preventDefault();
                  window.history.pushState({}, '', item.path);
                  window.dispatchEvent(new Event('popstate'));
                }}
              >
                {item.label}
                <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-gradient-to-r from-emerald-400 to-sky-400 scale-x-0 group-hover:scale-x-100 transition-transform" />
              </a>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search venues..."
                className="block w-full pl-10 pr-3 py-2 rounded-md bg-white/70 border border-white/60 shadow-inner placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User size={16} />
                    </div>
                  )}
                  <span className="hidden md:block text-sm font-medium">{user.fullName}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowUserMenu(false);
                        window.history.pushState({}, '', '/profile');
                        window.dispatchEvent(new Event('popstate'));
                      }}
                    >
                      Profile
                    </a>
                    <a
                      href="/bookings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowUserMenu(false);
                        window.history.pushState({}, '', '/bookings');
                        window.dispatchEvent(new Event('popstate'));
                      }}
                    >
                      My Bookings
                    </a>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut size={16} className="inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a
                  href="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/login');
                    window.dispatchEvent(new Event('popstate'));
                  }}
                >
                  Login
                </a>
                <a
                  href="/signup"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-semibold shadow-sporty"
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/signup');
                    window.dispatchEvent(new Event('popstate'));
                  }}
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search venues..."
            className="block w-full pl-10 pr-3 py-2 rounded-md bg-white/70 border border-white/60 shadow-inner placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;