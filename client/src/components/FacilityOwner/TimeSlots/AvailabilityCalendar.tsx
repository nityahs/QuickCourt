import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, Block } from 'lucide-react';

interface TimeSlot {
  id: string;
  courtId: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBlocked: boolean;
  price: number;
}

const AvailabilityCalendar: React.FC = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    {
      id: '1',
      courtId: 'court1',
      courtName: 'Tennis Court 1',
      date: '2024-01-15',
      startTime: '09:00',
      endTime: '10:00',
      isAvailable: true,
      isBlocked: false,
      price: 45
    },
    {
      id: '2',
      courtId: 'court1',
      courtName: 'Tennis Court 1',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '11:00',
      isAvailable: false,
      isBlocked: false,
      price: 45
    }
  ]);

  const [selectedDate, setSelectedDate] = useState('2024-01-15');
  const [selectedCourt, setSelectedCourt] = useState('all');

  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 6; // 6 AM
    const endHour = 22; // 10 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const nextTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      slots.push({
        time,
        nextTime,
        isBooked: false,
        isBlocked: false
      });
    }
    
    return slots;
  };

  const timeSlotsForDay = generateTimeSlots();

  const getStatusColor = (isAvailable: boolean, isBlocked: boolean) => {
    if (isBlocked) return 'bg-red-500';
    if (isAvailable) return 'bg-green-500';
    return 'bg-gray-400';
  };

  const getStatusText = (isAvailable: boolean, isBlocked: boolean) => {
    if (isBlocked) return 'Blocked';
    if (isAvailable) return 'Available';
    return 'Booked';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Slots</h1>
          <p className="text-gray-600 mt-2">Manage court availability and time slots</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          <span>Block Time</span>
        </motion.button>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Court Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Court</label>
            <select
              value={selectedCourt}
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Courts</option>
              <option value="court1">Tennis Court 1</option>
              <option value="court2">Basketball Court</option>
              <option value="court3">Badminton Court</option>
            </select>
          </div>

          {/* Legend */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-sm text-gray-600">Booked</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Blocked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900">
            Availability for {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {timeSlotsForDay.map((slot, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="relative"
            >
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-green-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {slot.time} - {slot.nextTime}
                  </span>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(slot.isAvailable, slot.isBlocked)}`}></div>
                </div>
                
                <div className="text-xs text-gray-500 mb-3">
                  {getStatusText(slot.isAvailable, slot.isBlocked)}
                </div>
                
                <div className="flex space-x-2">
                  <button className="flex-1 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors">
                    Edit
                  </button>
                  <button className="flex-1 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">
                    Block
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Quick Block</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Block multiple time slots quickly for maintenance or special events
          </p>
          <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            Block Time Slots
          </button>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Bulk Edit</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Edit multiple time slots at once for pricing or availability changes
          </p>
          <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
            Bulk Edit
          </button>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Court Settings</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Configure default availability and pricing for each court
          </p>
          <button className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
            Configure
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
