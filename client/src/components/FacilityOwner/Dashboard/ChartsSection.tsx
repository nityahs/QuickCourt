import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Calendar, TrendingUp, DollarSign, Clock } from 'lucide-react';

// Sample data for charts
const bookingTrendsData = [
  { day: 'Mon', bookings: 45, revenue: 1200 },
  { day: 'Tue', bookings: 52, revenue: 1350 },
  { day: 'Wed', bookings: 38, revenue: 980 },
  { day: 'Thu', bookings: 61, revenue: 1580 },
  { day: 'Fri', bookings: 78, revenue: 2100 },
  { day: 'Sat', bookings: 89, revenue: 2400 },
  { day: 'Sun', bookings: 67, revenue: 1800 },
];

const earningsBySportData = [
  { name: 'Tennis', value: 4500, color: '#10b981' },
  { name: 'Basketball', value: 3200, color: '#3b82f6' },
  { name: 'Football', value: 2800, color: '#f59e0b' },
  { name: 'Badminton', value: 1950, color: '#8b5cf6' },
];

const monthlyRevenueData = [
  { month: 'Jan', revenue: 8500, bookings: 320 },
  { month: 'Feb', revenue: 9200, bookings: 350 },
  { month: 'Mar', revenue: 8800, bookings: 310 },
  { month: 'Apr', revenue: 10500, bookings: 380 },
  { month: 'May', revenue: 11200, bookings: 420 },
  { month: 'Jun', revenue: 12450, bookings: 450 },
];

const peakHoursData = [
  { hour: '6AM', monday: 15, tuesday: 12, wednesday: 18, thursday: 14, friday: 20, saturday: 25, sunday: 22 },
  { hour: '8AM', monday: 25, tuesday: 28, wednesday: 30, thursday: 26, friday: 35, saturday: 40, sunday: 38 },
  { hour: '10AM', monday: 35, tuesday: 38, wednesday: 42, thursday: 36, friday: 45, saturday: 50, sunday: 48 },
  { hour: '12PM', monday: 20, tuesday: 22, wednesday: 25, thursday: 21, friday: 30, saturday: 35, sunday: 32 },
  { hour: '2PM', monday: 30, tuesday: 32, wednesday: 35, thursday: 31, friday: 40, saturday: 45, sunday: 42 },
  { hour: '4PM', monday: 45, tuesday: 48, wednesday: 52, thursday: 46, friday: 55, saturday: 60, sunday: 58 },
  { hour: '6PM', monday: 55, tuesday: 58, wednesday: 62, thursday: 56, friday: 65, saturday: 70, sunday: 68 },
  { hour: '8PM', monday: 40, tuesday: 42, wednesday: 45, thursday: 41, friday: 50, saturday: 55, sunday: 52 },
];

const ChartCard: React.FC<{
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  delay: number;
}> = ({ title, icon: Icon, children, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg"
  >
    <div className="flex items-center space-x-3 mb-6">
      <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const ChartsSection: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
        <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
          {(['week', 'month', 'year'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends Line Chart */}
        <ChartCard title="Booking Trends" icon={TrendingUp} delay={0.1}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={bookingTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="bookings" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Earnings by Sport Pie Chart */}
        <ChartCard title="Earnings by Sport" icon={DollarSign} delay={0.2}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={earningsBySportData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {earningsBySportData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly Revenue Bar Chart */}
        <ChartCard title="Monthly Revenue" icon={Calendar} delay={0.3}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Peak Hours Area Chart */}
        <ChartCard title="Peak Booking Hours" icon={Clock} delay={0.4}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="hour" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="friday" 
                stackId="1" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="saturday" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default ChartsSection;
