import React from 'react';
import { motion } from 'framer-motion';
import KPICards from './KPICards';
import ChartsSection from './ChartsSection';
import RecentActivity from './RecentActivity';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-green-500/10 via-blue-500/10 to-green-500/10 rounded-2xl p-6 border border-green-200/50"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 text-lg">
          Here's what's happening with your sports facilities today.
        </p>
      </motion.div>

      {/* KPI Cards */}
      <KPICards />

      {/* Charts Section */}
      <ChartsSection />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
};

export default Dashboard;
