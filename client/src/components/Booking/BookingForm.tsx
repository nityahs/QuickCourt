import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, CreditCard } from 'lucide-react';
import { Venue } from '../../types';
import http from '../../services/http';
import { useAuth } from '../../contexts/AuthContext';

interface BookingFormProps {
  venue: Venue;
  onBack: () => void;
  onBookingComplete: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ venue, onBack, onBookingComplete }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [duration, setDuration] = useState(1);
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [courts, setCourts] = useState<Array<{ _id: string; name: string; pricePerHour: number }>>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  // const [availableSlots, setAvailableSlots] = useState<Array<{ start: string; end: string; courtId: string }>>([]);
  const { user } = useAuth();
  
  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const totalPrice = (courts.find(c => c._id === selectedCourt)?.pricePerHour || venue.startingPrice) * duration;

  const validateBooking = () => {
    // Check if date is in the future
    const bookingDate = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (bookingDate < today) {
      setBookingError('Please select a future date');
      return false;
    }
    
    // Additional validations could be added here
    return true;
  };

  const handleBooking = async () => {
    setBookingError('');
    
    if (!validateBooking()) {
      return;
    }
    if (!user) {
      setBookingError('Please log in to book');
      return;
    }
    if (!selectedCourt) {
      setBookingError('Please select a court');
      return;
    }

    try {
      setIsSubmitting(true);
      const dateISO = selectedDate;
      const start = selectedTime;
      const endHour = Math.min(23, parseInt(selectedTime.slice(0,2),10) + duration);
      const end = `${String(endHour).padStart(2,'0')}:${selectedTime.slice(3,5)}`;

      // Attempt booking via API
  await http.post('/bookings', {
        facilityId: venue.id,
        courtId: selectedCourt,
        dateISO,
        start,
        end,
        price: totalPrice,
      });

  setIsSubmitting(false);
      setTimeout(() => onBookingComplete(), 1200);
    } catch (e:any) {
      setIsSubmitting(false);
      setBookingError(e?.response?.data?.error || 'Booking failed');
    }
  };

  // Load courts for facility
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
  const { data } = await http.get(`/courts/by-facility/${venue.id}`);
        if (!ignore) {
          setCourts(data);
          if (data.length) setSelectedCourt(data[0]._id);
        }
      } catch {}
    })();
    return () => { ignore = true; };
  }, [venue.id]);

  // Load available time slots for selected court + date
  useEffect(() => {
    let ignore = false;
    if (!selectedCourt || !selectedDate) return;
    (async () => {
      try {
  const { data } = await http.get(`/slots/${selectedCourt}`, { params: { date: selectedDate } });
        if (!ignore) {
          const avail = (data || []).filter((s:any) => !s.isBlocked && !s.isBooked);
          // map available slots if needed in future
          const times = Array.from(new Set(avail.map((s:any) => s.start))) as string[];
          times.sort();
          setTimeSlots(times as string[]);
          if (times.length) setSelectedTime(times[0] as string);
        }
      } catch {}
    })();
    return () => { ignore = true; };
  }, [selectedCourt, selectedDate]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        <div className="text-right">
          <span className="text-gray-600">Ritesh Jain</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Court Booking</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{venue.name}</h2>
              <div className="flex items-center text-gray-600">
                <span>{venue.address}</span>
                <div className="flex items-center ml-4">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1">{venue.rating} ({venue.reviewCount})</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Sport Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏸</span>
                  <span className="font-medium">{venue.sportTypes[0]}</span>
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setDuration(Math.max(1, duration - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="font-medium">{duration}h</span>
                  <button
                    onClick={() => setDuration(duration + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Court Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Court
                </label>
                <select
                  value={selectedCourt}
                  onChange={(e) => setSelectedCourt(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {courts.map(court => (
                    <option key={court._id} value={court._id}>{court.name}</option>
                  ))}
                </select>
              </div>

              {bookingError && (
                <div className="text-red-600 text-sm mb-2">{bookingError}</div>
              )}
              <button
                onClick={handleBooking}
                disabled={isSubmitting}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center"
              >
                <CreditCard className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Processing…' : `Continue to Payment - ₹${totalPrice}.00`}
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Availability</h3>
            <div className="text-sm text-gray-600 mb-4">
              The selected date must be today or later
            </div>
            
            {/* Mini Calendar */}
            <div className="space-y-2">
              {timeSlots.length === 0 && (
                <div className="text-sm text-gray-600">No available slots for selected date.</div>
              )}
              {timeSlots.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`px-3 py-1 rounded border mr-2 ${selectedTime===t ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-800 border-gray-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-2">Start time must be in the future</h4>
              <p className="text-sm text-gray-600">
                Unavailable time slots are disabled or shown as booked
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
  {showPricingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Badminton</h3>
              <button
                onClick={() => setShowPricingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Pricing is subjected to change and is controlled by venue
            </p>
            <div className="space-y-2 text-sm">
              <h4 className="font-medium">Badminton Standard Synthetic</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                </div>
                <div className="flex justify-between">
                  <span>INR 500.0 / hour</span>
                  <span>06:00 AM - 07:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span>INR 500.0 / hour</span>
                  <span>08:00 PM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday - Sunday</span>
                </div>
                <div className="flex justify-between">
                  <span>INR 500.0 / hour</span>
                  <span>06:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Holidays</span>
                </div>
                <div className="flex justify-between">
                  <span>INR 500.0 / hour</span>
                  <span>06:00 AM - 10:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingForm;