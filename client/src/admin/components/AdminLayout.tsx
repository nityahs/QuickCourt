import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { name: 'dashboard', path: '/admin' },
    { name: 'facility approval', path: '/admin/facilities' },
    { name: 'user management', path: '/admin/users' },
    { name: 'profile', path: '/admin/profile' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white">
        <div className="p-4 font-bold text-xl">QuickCourt Admin</div>
        <nav className="mt-8">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <a
                  href={item.path}
                  className={`block py-3 px-4 ${currentPage === item.name.toLowerCase() ? 'bg-indigo-900' : 'hover:bg-indigo-700'}`}
                >
                  {item.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="block w-full text-left py-3 px-4 hover:bg-indigo-700"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold">{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</h1>
            <div className="flex items-center space-x-2">
              <span>{user?.fullName}</span>
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <span className="text-white">{user?.fullName.charAt(0)}</span>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;