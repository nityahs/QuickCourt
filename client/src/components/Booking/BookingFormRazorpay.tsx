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

interface PaymentDetails {
  amount: number;
  currency: string;
  bookingId: string;
}

// Extend window interface for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

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
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [courts, setCourts] = useState<Array<{ _id: string; name: string; pricePerHour: number; sport?: string }>>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  // Payment-related state
  const [step, setStep] = useState<'booking' | 'payment' | 'confirmation'>('booking');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  
  const { user } = useAuth();
  
  // Set default date to tomorrow and initialize sport
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
    
    // Set default sport if available
    if (venue.sportTypes && venue.sportTypes.length > 0) {
      setSelectedSport(venue.sportTypes[0]);
    }
  }, [venue.sportTypes]);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
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
    if (!selectedSport) {
      setBookingError('Please select a sport');
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

      // Create booking request with pending status
      const bookingRequest = {
        facilityId: venue.id,
        courtId: selectedCourt,
        sport: selectedSport,
        dateISO,
        start,
        end,
        price: totalPrice,
        status: 'pending' // Will be updated after payment
      };

      // Create booking (pending payment)
      const response = await http.post('/bookings', bookingRequest);
      
      if (response.data) {
        setBookingData(response.data);
        setPaymentDetails({
          amount: totalPrice,
          currency: 'INR',
          bookingId: response.data._id || response.data.id
        });
        setStep('payment');
      } else {
        throw new Error('Failed to create booking');
      }
      
      setIsSubmitting(false);
    } catch (e: any) {
      setIsSubmitting(false);
      setBookingError(e?.response?.data?.error || 'Booking failed');
    }
  };

  // Payment handling functions
  const handleRazorpayPayment = async () => {
    try {
      setIsSubmitting(true);
      
      // Create order on server
      const orderResponse = await http.post('/payments/create-order', {
        amount: (paymentDetails?.amount || 0) * 100, // Convert to paise
        currency: 'INR',
        bookingId: paymentDetails?.bookingId
      });

      if (!orderResponse.data.success) {
        throw new Error('Failed to create payment order');
      }

      const order = orderResponse.data.data;
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_key',
        amount: order.amount,
        currency: order.currency,
        name: 'QuickCourt',
        description: `Court Booking Payment - ${paymentDetails?.bookingId}`,
        order_id: order.id,
        handler: async function (response: any) {
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: user?.fullName || '',
          email: user?.email || '',
          contact: ''
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setIsSubmitting(false);
            alert('Payment cancelled');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      alert('Payment initialization failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse: any) => {
    try {
      setIsSubmitting(true);
      
      // Verify payment on server and update booking
      const verifyResponse = await http.post('/payments/verify-payment', {
        bookingId: paymentDetails?.bookingId,
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        signature: paymentResponse.razorpay_signature
      });

      if (verifyResponse.data.success) {
        setStep('confirmation');
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function for sport emojis
  const getSportEmoji = (sport: string): string => {
    const sportEmojis: { [key: string]: string } = {
      'badminton': '🏸',
      'tennis': '🎾',
      'basketball': '🏀',
      'football': '⚽',
      'volleyball': '🏐',
      'cricket': '🏏',
      'table tennis': '🏓',
      'squash': '🎾',
      'swimming': '🏊',
      'gym': '🏋️',
      'boxing': '🥊',
      'golf': '⛳',
      'hockey': '🏒',
      'rugby': '🏉'
    };
    
    return sportEmojis[sport.toLowerCase()] || '🏃'; // Default to running emoji
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

  // Render functions for different steps
  const renderBookingStep = () => (
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
          <span className="text-gray-600">{user?.fullName || 'Guest'}</span>
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
                  <span className="ml-1">{venue.rating.toFixed(2)} ({venue.reviewCount})</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Sport Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sport
                </label>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {venue.sportTypes.map(sport => (
                    <option key={sport} value={sport}>
                      {getSportEmoji(sport)} {sport}
                    </option>
                  ))}
                </select>
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
                    min={new Date().toISOString().split('T')[0]}
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
                {courts.length > 0 ? (
                  <select
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {courts.map(court => (
                      <option key={court._id} value={court._id}>
                        {court.name} - ₹{court.pricePerHour}/hr
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="block w-full px-3 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    {selectedSport ? `No courts available for ${selectedSport}` : 'Please select a sport first'}
                  </div>
                )}
              </div>

              {bookingError && (
                <div className="text-red-600 text-sm mb-2">{bookingError}</div>
              )}

              <button
                onClick={handleBooking}
                disabled={isSubmitting || !selectedCourt || timeSlots.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center"
              >
                {isSubmitting ? (
                  'Creating Booking...'
                ) : (
                  <>
                    <CreditCard size={16} className="mr-2" />
                    Proceed to Payment - ₹{totalPrice}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Venue:</span>
                <span className="font-medium">{venue.name}</span>
              </div>
              {selectedSport && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Sport:</span>
                  <span className="font-medium">{getSportEmoji(selectedSport)} {selectedSport}</span>
                </div>
              )}
              {selectedDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
              )}
              {selectedTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-medium">{selectedTime} - {String(Math.min(23, parseInt(selectedTime.split(':')[0]) + duration)).padStart(2, '0')}:{selectedTime.split(':')[1]}</span>
                </div>
              )}
              {duration && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{duration} hour{duration > 1 ? 's' : ''}</span>
                </div>
              )}
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-blue-600">₹{totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Complete Payment</h2>
          <p className="text-gray-600 mt-2">Secure payment for your court booking</p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <div className="text-center">
            <p className="text-lg font-semibold text-blue-800">Amount to Pay</p>
            <p className="text-3xl font-bold text-blue-600">₹{paymentDetails?.amount}</p>
            <p className="text-sm text-gray-600 mt-2">Booking ID: {paymentDetails?.bookingId}</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Booking Details</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Venue:</span> {venue.name}</p>
              <p><span className="font-medium">Sport:</span> {selectedSport}</p>
              <p><span className="font-medium">Date:</span> {new Date(selectedDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Time:</span> {selectedTime} ({duration}h)</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleRazorpayPayment}
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-medium flex items-center justify-center space-x-2"
          >
            <span>💳</span>
            <span>{isSubmitting ? 'Processing...' : 'Pay with Razorpay'}</span>
          </button>

          <button
            onClick={() => setStep('booking')}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
          >
            Back to Booking
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              🔒 Secure payment powered by industry-leading encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-green-600 mb-6">
          <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎉 Booking Confirmed!</h2>
        <p className="text-gray-600 mb-8">Your court has been successfully booked and payment completed.</p>
        
        <div className="bg-green-50 p-6 rounded-lg mb-8 space-y-2">
          <p className="font-medium text-green-800">Booking Details:</p>
          <p className="text-sm text-green-700">ID: {bookingData?._id || bookingData?.id}</p>
          <p className="text-sm text-green-700">Venue: {venue.name}</p>
          <p className="text-sm text-green-700">Sport: {selectedSport}</p>
          <p className="text-sm text-green-700">Date: {new Date(selectedDate).toLocaleDateString()}</p>
          <p className="text-sm text-green-700">Time: {selectedTime} ({duration}h)</p>
          <p className="text-sm text-green-700">Amount Paid: ₹{paymentDetails?.amount}</p>
        </div>
        
        <button
          onClick={() => {
            onBookingComplete();
          }}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium"
        >
          Done
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {step === 'booking' && renderBookingStep()}
      {step === 'payment' && renderPaymentStep()}
      {step === 'confirmation' && renderConfirmationStep()}
    </div>
  );
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