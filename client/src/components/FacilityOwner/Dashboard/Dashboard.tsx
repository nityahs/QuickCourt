import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import KPICards from './KPICards';
import ChartsSection from './ChartsSection';
import RecentActivity from './RecentActivity';
import { facilityOwnerAPI, FacilityOwnerStats } from '../../../services/facilityOwner';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<FacilityOwnerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) {
        console.log('No user ID available');
        return;
      }
      
      console.log('Fetching dashboard data for user:', user.id);
      try {
        setLoading(true);
        setError(null);
        const response = await facilityOwnerAPI.getDashboardStats(user.id);
        console.log('Dashboard data received:', response);
        setStats(response);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.response?.data?.error || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  // Add debug log for component rendering
  console.log('Dashboard component rendering, stats:', stats ? 'available' : 'null');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome back, {user?.fullName}!
        </h1>
        <p className="text-xl text-gray-600">
          Here's what's happening with your sports facilities today
        </p>
      </motion.div>

      {/* KPI Cards */}
      <KPICards kpis={stats.kpis} />

      {/* Charts Section */}
      <ChartsSection charts={stats.charts} />

      {/* Recent Activity */}
      <RecentActivity activities={stats.recentActivity} />
    </div>
  );
};

export default Dashboard;
