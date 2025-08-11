import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ChartsSectionProps {
  charts: {
    monthlyRevenue: Array<{
      _id: string;
      revenue: number;
      count: number;
    }>;
    dailyBookings: Array<{
      _id: string;
      count: number;
      revenue: number;
    }>;
    peakHours: Array<{
      _id: string;
      count: number;
    }>;
    sportDistribution: Array<{
      _id: string;
      count: number;
    }>;
  };
}

const ChartsSection: React.FC<ChartsSectionProps> = ({ charts }) => {
  const [timeRange, setTimeRange] = useState('30d');

  // Transform data for charts
  const monthlyRevenueData = charts.monthlyRevenue.map(item => ({
    month: item._id,
    revenue: item.revenue,
    bookings: item.count
  }));

  const dailyBookingsData = charts.dailyBookings.map(item => ({
    date: item._id,
    bookings: item.count,
    revenue: item.revenue
  }));

  const peakHoursData = charts.peakHours.map(item => ({
    hour: `${item._id}:00`,
    bookings: item.count
  }));

  const sportDistributionData = charts.sportDistribution.map(item => ({
    sport: item._id,
    courts: item.count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
        <div className="flex space-x-2">
          {['7d', '30d', '90d', '6m'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Daily Bookings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Bookings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyBookingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="bookings" 
                stackId="1"
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Peak Hours Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sport Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sport Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sportDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ sport, percent }) => `${sport} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="courts"
              >
                {sportDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Courts']} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default ChartsSection;
