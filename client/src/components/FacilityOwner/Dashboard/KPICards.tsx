import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Wallet, 
  Users, 
  TrendingUp,
  Building2,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface KPICardsProps {
  kpis: {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    completedBookings: number;
    totalEarnings: number;
    activeCourts: number;
    totalFacilities: number;
  };
}

const KPICards: React.FC<KPICardsProps> = ({ kpis }) => {
  const cards = [
    {
      title: 'Total Bookings',
      value: kpis.totalBookings,
      icon: Calendar,
      color: 'blue'
    },
    {
      title: 'Total Earnings',
      value: `₹${kpis.totalEarnings.toLocaleString()}`,
      icon: Wallet,
      color: 'green'
    },
    {
      title: 'Active Courts',
      value: kpis.activeCourts,
      icon: MapPin,
      color: 'purple'
    },
    {
      title: 'Total Facilities',
      value: kpis.totalFacilities,
      icon: Building2,
      color: 'orange'
    },
    {
      title: 'Confirmed Bookings',
      value: kpis.confirmedBookings,
      icon: CheckCircle,
      color: 'emerald'
    },
    {
      title: 'Completed Bookings',
      value: kpis.completedBookings,
      icon: TrendingUp,
      color: 'indigo'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
      blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
      green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
      purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
      orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' },
      emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: 'text-emerald-500' },
      indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: 'text-indigo-500' }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const colorClasses = getColorClasses(card.color);
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className={`${colorClasses.bg} rounded-2xl p-6 border border-gray-200/50`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${colorClasses.bg} border border-gray-200/50`}>
                <Icon className={`w-6 h-6 ${colorClasses.icon}`} />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {card.title}
            </h3>
            
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              className={`text-3xl font-bold ${colorClasses.text}`}
            >
              {card.value}
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default KPICards;
