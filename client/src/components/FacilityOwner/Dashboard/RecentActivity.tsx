import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, MapPin, Eye, MoreHorizontal } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'booking' | 'cancellation' | 'completion' | 'maintenance';
  title: string;
  description: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  user: string;
  court: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'booking':
      return <Calendar className="w-4 h-4" />;
    case 'cancellation':
      return <Clock className="w-4 h-4" />;
    case 'completion':
      return <User className="w-4 h-4" />;
    case 'maintenance':
      return <MapPin className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'booking':
      return 'bg-green-500';
    case 'cancellation':
      return 'bg-red-500';
    case 'completion':
      return 'bg-blue-500';
    case 'maintenance':
      return 'bg-orange-500';
    default:
      return 'bg-gray-500';
  }
};

const RecentActivity: React.FC = () => {
  const recentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'booking',
      title: 'New Booking',
      description: 'Tennis Court 1 - 2 hours',
      time: '2 minutes ago',
      status: 'confirmed',
      user: 'John Smith',
      court: 'Tennis Court 1'
    },
    {
      id: '2',
      type: 'completion',
      title: 'Booking Completed',
      description: 'Basketball Court - 1.5 hours',
      time: '15 minutes ago',
      status: 'completed',
      user: 'Sarah Johnson',
      court: 'Basketball Court'
    },
    {
      id: '3',
      type: 'cancellation',
      title: 'Booking Cancelled',
      description: 'Football Field - 3 hours',
      time: '1 hour ago',
      status: 'cancelled',
      user: 'Mike Wilson',
      court: 'Football Field'
    },
    {
      id: '4',
      type: 'maintenance',
      title: 'Maintenance Scheduled',
      description: 'Badminton Court - Cleaning',
      time: '2 hours ago',
      status: 'pending',
      user: 'System',
      court: 'Badminton Court'
    },
    {
      id: '5',
      type: 'booking',
      title: 'New Booking',
      description: 'Tennis Court 2 - 1 hour',
      time: '3 hours ago',
      status: 'confirmed',
      user: 'Emily Davis',
      court: 'Tennis Court 2'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg"
    >
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <button className="text-sm text-green-600 hover:text-green-700 font-medium">
            View All
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Court
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200/50">
            {recentActivities.map((activity, index) => (
              <motion.tr
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeColor(activity.type)}`}>
                      {getTypeIcon(activity.type)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{activity.title}</div>
                      <div className="text-sm text-gray-500">{activity.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{activity.user}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{activity.court}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(activity.status)}`}>
                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {activity.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button className="text-green-600 hover:text-green-900 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default RecentActivity;
