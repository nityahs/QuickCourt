import React from 'react';
import { motion } from 'framer-motion';
import { Eye, MoreHorizontal, Calendar, Clock, DollarSign, Users, MapPin, Building2 } from 'lucide-react';

interface RecentActivityProps {
  activities: Array<{
    _id: string;
    status: string;
    price: number;
    start: string;
    end: string;
    dateISO: string;
    createdAt: string;
    user: {
      name: string;
    };
    court: {
      name: string;
    };
    facility: {
      name: string;
    };
  }>;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'cancelled':
        return '❌';
      case 'completed':
        return '✅';
      default:
        return '📋';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Activity</h3>
          <p className="text-gray-600">When bookings are made, they will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200/50 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
        <button className="text-blue-600 hover:text-blue-700 font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {/* Activity Info */}
            <div className="flex items-center space-x-4">
              <div className="text-2xl">
                {getStatusIcon(activity.status)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    {activity.status === 'confirmed' ? 'New Booking' : 
                     activity.status === 'cancelled' ? 'Booking Cancelled' :
                     activity.status === 'completed' ? 'Booking Completed' : 'Activity'}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">
                    {activity.court.name} - {formatTime(activity.end)} - {formatTime(activity.start)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{activity.user.name}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{activity.court.name}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Building2 className="w-4 h-4" />
                    <span>{activity.facility.name}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Status and Actions */}
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
              </span>
              
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {formatTimeAgo(activity.createdAt)}
                </div>
                <div className="text-lg font-semibold text-green-600">
                  ₹{activity.price}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
