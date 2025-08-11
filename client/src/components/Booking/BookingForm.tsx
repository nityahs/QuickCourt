import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ArrowLeft, CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { http } from '../../services/http';
import StripePaymentWrapper from '../Payment/StripePaymentForm';

interface Court {
  _id: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  courtType: string;
}

interface Venue {
  _id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  sportTypes: string[];
}

interface PaymentDetails {
  amount: number;
  clientSecret: string;
  paymentIntentId: string;
  bookingId: string;
}

interface BookingFormProps {
  venue: Venue;
  onBookingComplete: () => void;
  onBack: () => void;
}

// Initialize Stripe
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YourStripePublishableKey');

const BookingForm: React.FC<BookingFormProps> = ({ venue, onBookingComplete, onBack }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedCourt, setSelectedCourt] = useState('');
  const [selectedSport, setSelectedSport] = useState(venue.sportTypes[0]);
  const [duration, setDuration] = useState(1);
  const [courts, setCourts] = useState<Court[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  
  // Payment flow states
  const [step, setStep] = useState<'booking' | 'payment' | 'confirmation'>('booking');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);

  // Calculate total price
  const totalPrice = (() => {
    const court = courts.find(court => court._id === selectedCourt);
    return court ? court.pricePerHour * duration : 0;
  })();

  // Fetch courts when venue or sport changes
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await http.get(`/courts?facility=${venue._id}&sportType=${selectedSport}`);
        setCourts(response.data);
        if (response.data.length > 0) {
          setSelectedCourt(response.data[0]._id);
        } else {
          setSelectedCourt('');
        }
      } catch (error) {
        console.error('Failed to fetch courts:', error);
      }
    };

    if (venue._id && selectedSport) {
      fetchCourts();
    }
  }, [venue._id, selectedSport]);

  // Fetch available time slots
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        if (selectedCourt && selectedDate) {
          const response = await http.get(`/bookings/available-times?court=${selectedCourt}&date=${selectedDate}`);
          const times = response.data;
          if (!ignore) {
            setTimeSlots(times as string[]);
            if (times.length) setSelectedTime(times[0] as string);
          }
        }
      } catch (error) {
        console.error('Failed to fetch time slots:', error);
      }
    })();
    return () => { ignore = true; };
  }, [selectedCourt, selectedDate]);

  const handleBooking = async () => {
    if (!selectedCourt || !selectedDate || !selectedTime) {
      setBookingError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      const response = await http.post('/bookings/create-pending', {
        court: selectedCourt,
        date: selectedDate,
        startTime: selectedTime,
        duration,
        amount: totalPrice,
      });

      setBookingData(response.data.booking);
      setPaymentDetails({
        amount: totalPrice,
        clientSecret: response.data.clientSecret,
        paymentIntentId: response.data.paymentIntentId,
        bookingId: response.data.booking._id || response.data.booking.id,
      });
      
      setStep('payment');
    } catch (error: any) {
      console.error('Booking error:', error);
      setBookingError(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStripePayment = async (paymentIntentId: string) => {
    try {
      await handlePaymentSuccess(paymentIntentId);
    } catch (error: any) {
      console.error('Payment error:', error);
      setBookingError(error.message || 'Payment failed');
    }
  };


  const handlePaymentError = (error: string) => {
    setBookingError(error);
    setIsSubmitting(false);
  };

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
          setTimeSlots(times);
          // Only set selected time if there are available slots and current selection is not in the list
          if (times.length && !times.includes(selectedTime)) {
            setSelectedTime(times[0]);
          } else if (times.length === 0) {
            // Clear selected time if no slots available
            setSelectedTime('');
          }
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setTimeSlots([]);
      }
    })();
    return () => { ignore = true; };
  }, [selectedCourt, selectedDate, selectedTime]);


  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const response = await http.post('/bookings/verify-payment', {
        bookingId: paymentDetails?.bookingId,
        paymentIntentId: paymentIntentId,
      });

      if (response.data.success) {
        setBookingData(response.data.booking);
        setStep('confirmation');
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed. Please contact support.');
    }
  };

  const getSportEmoji = (sport: string) => {
    const emojiMap: { [key: string]: string } = {
      'Football': '⚽',
      'Basketball': '🏀',
      'Tennis': '🎾',
      'Cricket': '🏏',
      'Badminton': '🏸',
      'Volleyball': '🏐',
      'Table Tennis': '🏓',
      'Hockey': '🏒',
      'Swimming': '🏊',
      'Boxing': '🥊'
    };
    return emojiMap[sport] || '🏆';
  };

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
                    disabled={timeSlots.length === 0}
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
                  <>
                    <div className="block w-full px-3 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                      {selectedSport ? `No courts available for ${selectedSport}` : 'Please select a sport first'}
                    </div>
                    <p className="mt-1 text-sm text-red-600">No courts available for this venue</p>
                  </>
                )}
              </div>

              {bookingError && (
                <div className="text-red-600 text-sm mb-2 p-3 bg-red-50 rounded-md">
                  {bookingError}
                </div>
              )}

              <button
                onClick={handleBooking}

                disabled={isSubmitting || !selectedCourt || !selectedTime || timeSlots.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center"

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
          {paymentDetails && (
            <StripePaymentWrapper
              clientSecret={paymentDetails.clientSecret}
              amount={paymentDetails.amount}
              onSuccess={handleStripePayment}
              onError={handlePaymentError}
              isSubmitting={isSubmitting}
            />
          )}

          <button
            onClick={() => setStep('booking')}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
          >
            Back to Booking
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              🔒 Secure payment powered by Stripe
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
};

export default BookingForm;
