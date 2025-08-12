import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Ban, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { facilityOwnerAPI } from '../../../services/facilityOwner';

interface TimeSlot {
  _id?: string;
  courtId: string;
  dateISO: string;
  start: string;
  end: string;
  isBlocked: boolean;
  isBooked: boolean;
  priceSnapshot: number;
}

interface Court {
  _id: string;
  name: string;
  sport: string;
  pricePerHour: number;
  facilityId: string;
}

const AvailabilityCalendar: React.FC = () => {
  useAuth();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCourt, setSelectedCourt] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    if (selectedCourt !== 'all' && selectedDate) {
      fetchAvailability();
    }
  }, [selectedCourt, selectedDate]);

  const fetchCourts = async () => {
    try {
      const response = await facilityOwnerAPI.getOwnerCourts();
      setCourts(response.data);
      if (response.data.length > 0) {
        setSelectedCourt(response.data[0]._id);
      }
    } catch (err: any) {
      console.error('Error fetching courts:', err);
      setError('Failed to load courts');
    }
  };

  const fetchAvailability = async () => {
    if (selectedCourt === 'all' || !selectedDate) return;

    try {
      setLoading(true);
      setError(null);
      const response: any = await facilityOwnerAPI.getAvailability(selectedCourt, selectedDate);
      // API returns { data: [...] } so unwrap; fall back if already array
      const raw = response?.data;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
      setTimeSlots(list as TimeSlot[]);
    } catch (err: any) {
      console.error('Error fetching availability:', err);
      setTimeSlots([]);
      setError('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    // Ensure we work with an array
    const source: TimeSlot[] = Array.isArray(timeSlots) ? timeSlots : [];
    const slots: TimeSlot[] = [];
    const startHour = 6; // 6 AM
    const endHour = 22; // 10 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const nextTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      // Find existing slot or create default
      const existingSlot = source.find(slot => slot.start === time);
      
      if (existingSlot) {
        slots.push(existingSlot);
      } else {
        slots.push({
          courtId: selectedCourt,
          dateISO: selectedDate,
          start: time,
          end: nextTime,
          isBlocked: false,
          isBooked: false,
          priceSnapshot: courts.find(c => c._id === selectedCourt)?.pricePerHour || 0
        });
      }
    }
    
    return slots;
  };

  const handleBlockSlot = async (slot: TimeSlot, block: boolean) => {
    try {
      const response = await facilityOwnerAPI.blockSlot({
        courtId: slot.courtId,
        dateISO: slot.dateISO,
        start: slot.start,
        end: slot.end,
        isBlocked: block
      });
      
      // Update the slot in state
      setTimeSlots(prev => Array.isArray(prev) ? prev.map(s => 
        s.start === slot.start && s.dateISO === slot.dateISO
          ? { ...s, isBlocked: block }
          : s
      ) : prev);
      
      // Show success message
      alert(response.message);
    } catch (err: any) {
      console.error('Error blocking slot:', err);
      alert(err.response?.data?.error || 'Failed to update time slot');
    }
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

  if (courts.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No courts available</h3>
        <p className="text-gray-600">You need to add courts to your facilities first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Slots</h1>
          <p className="text-gray-600 mt-2">Manage court availability and time slots</p>
        </div>
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
              {courts.map(court => (
                <option key={court._id} value={court._id}>
                  {court.name} ({court.sport})
                </option>
              ))}
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

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading availability...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={fetchAvailability}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Time Slots Grid */}
      {selectedCourt !== 'all' && !loading && !error && (
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
            <p className="text-sm text-gray-600 mt-1">
              Court: {courts.find(c => c._id === selectedCourt)?.name}
            </p>
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
                      {slot.start} - {slot.end}
                    </span>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(!slot.isBooked && !slot.isBlocked, slot.isBlocked)}`}></div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    {getStatusText(!slot.isBooked && !slot.isBlocked, slot.isBlocked)}
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-3">
                    ₹{slot.priceSnapshot}/hour
                  </div>
                  
                  <div className="flex space-x-2">
                    {slot.isBlocked ? (
                      <button 
                        onClick={() => handleBlockSlot(slot, false)}
                        className="flex-1 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>Unblock</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleBlockSlot(slot, true)}
                        className="flex-1 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Ban className="w-3 h-3" />
                        <span>Block</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {selectedCourt === 'all' && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Court</h3>
          <p className="text-gray-600">Choose a specific court to view and manage its time slots.</p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
