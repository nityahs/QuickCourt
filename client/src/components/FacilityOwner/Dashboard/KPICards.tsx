import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Building2, 
  DollarSign, 
  Users,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  color: string;
  delay: number;
}

const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendValue, 
  color,
  delay 
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {getTrendIcon()}
      </div>
      
      <div className="mb-2">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <motion.p 
          className="text-3xl font-bold text-gray-900"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: delay + 0.2 }}
        >
          {value}
        </motion.p>
      </div>
      
      <div className={`flex items-center text-sm ${getTrendColor()}`}>
        {getTrendIcon()}
        <span className="ml-1 font-medium">{trendValue}</span>
        <span className="ml-1">from last month</span>
      </div>
    </motion.div>
  );
};

const KPICards: React.FC = () => {
  const kpiData = [
    {
      title: 'Total Bookings',
      value: '1,247',
      icon: Calendar,
      trend: 'up' as const,
      trendValue: '+12.5%',
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      delay: 0.1
    },
    {
      title: 'Active Courts',
      value: '8',
      icon: Building2,
      trend: 'neutral' as const,
      trendValue: '0%',
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      delay: 0.2
    },
    {
      title: 'Monthly Earnings',
      value: '$12,450',
      icon: DollarSign,
      trend: 'up' as const,
      trendValue: '+8.3%',
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      delay: 0.3
    },
    {
      title: 'Court Occupancy',
      value: '78%',
      icon: Users,
      trend: 'up' as const,
      trendValue: '+5.2%',
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      delay: 0.4
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  );
};

export default KPICards;
