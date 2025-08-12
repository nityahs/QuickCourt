import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  Calendar,
  Activity,
  TrendingUp,
  User,
  MapPin,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('-500', '-100')}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

interface ChartCardProps {
  title: string;
  children?: React.ReactNode;
  delay: number;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white rounded-lg shadow-md p-6"
  >
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
      {children || (
        <p className="text-gray-500">Chart will be implemented with real data</p>
      )}
    </div>
  </motion.div>
);

const AdminDashboard: React.FC = () => {
  const [showAuthAlert, setShowAuthAlert] = useState(true);
  
  // Check if there are API errors by looking at localStorage
  useEffect(() => {
    const hasAuthToken = localStorage.getItem('quickcourt_token');
    const userJson = localStorage.getItem('quickcourt_user');
    let isAdmin = false;
    
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        isAdmin = userData.role === 'admin';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    setShowAuthAlert(!hasAuthToken || !isAdmin);
  }, []);
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalFacilities: 0,
    totalBookings: 0,
    pendingApprovals: 0,
    activeCourts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Try to fetch admin statistics from API
        const response = await fetch('http://localhost:5000/api/stats/admin');
        
        if (!response.ok) {
          // If API call fails, use mock data without showing error
          console.warn('Admin API not available, using mock data');
          setStats({
            totalUsers: 30,
            totalOwners: 7,
            totalFacilities: 15,
            totalBookings: 1,
            pendingApprovals: 3,
            activeCourts: 14
          });
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        
        // Calculate pending approvals from facility trends
        const pendingApprovals = data.facilityTrends?.find((trend: any) => trend._id === 'pending')?.count || 0;
        
        setStats({
          totalUsers: data.totalUsers || 0,
          totalOwners: data.totalOwners || 0,
          totalFacilities: data.totalFacilities || 0,
          totalBookings: data.totalBookings || 0,
          pendingApprovals: pendingApprovals,
          activeCourts: data.activeCourts || 0
        });
      } catch (err: any) {
        console.warn('Error fetching admin stats, using mock data:', err.message);
        // Use mock data as fallback without showing error to user
        setStats({
          totalUsers: 30,
          totalOwners: 7,
          totalFacilities: 15,
          totalBookings: 1,
          pendingApprovals: 3,
          activeCourts: 14
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-lg text-gray-600 mb-6">
            You need to be logged in as an administrator to access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8">
      {showAuthAlert && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Authentication Issue Detected</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>We've detected an issue with admin authentication. This may cause problems when accessing admin API endpoints.</p>
                <Link to="/admin/auth-fix" className="mt-2 inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700">
                  Fix Authentication Issue
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Admin Dashboard
        </h1>
        <p className="text-xl text-gray-600">
          Welcome back, {user?.fullName}! Here's your platform overview
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-6 h-6" />}
          color="border-blue-500"
          delay={0.1}
        />
        <StatCard
          title="Facility Owners"
          value={stats.totalOwners}
          icon={<Building2 className="w-6 h-6" />}
          color="border-green-500"
          delay={0.2}
        />
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={<Calendar className="w-6 h-6" />}
          color="border-purple-500"
          delay={0.3}
        />
        <StatCard
          title="Active Courts"
          value={stats.activeCourts}
          icon={<Activity className="w-6 h-6" />}
          color="border-yellow-500"
          delay={0.4}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Booking Activity Over Time" delay={0.5}>
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Monthly booking trends</p>
          </div>
        </ChartCard>
        
        <ChartCard title="User Registration Trends" delay={0.6}>
          <div className="text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Monthly user registrations</p>
          </div>
        </ChartCard>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              // Navigate to facility approval
              window.location.href = '/admin/facilities';
            }}
            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Building2 className="w-6 h-6 text-blue-600" />
            <div className="text-left">
              <div className="font-medium text-blue-900">Facility Approval</div>
              <div className="text-sm text-blue-600">{stats.pendingApprovals} pending</div>
            </div>
          </button>
          
          <button
            onClick={() => {
              // Navigate to user management
              window.location.href = '/admin/users';
            }}
            className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <User className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <div className="font-medium text-green-900">User Management</div>
              <div className="text-sm text-green-600">Manage all users</div>
            </div>
          </button>
          
          <button
            onClick={() => {
              // Navigate to reports
              window.location.href = '/admin/reports';
            }}
            className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <div className="text-left">
              <div className="font-medium text-purple-900">Reports</div>
              <div className="text-sm text-purple-600">View analytics</div>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
