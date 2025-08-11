import React, { useState } from 'react';
import { Calendar, Clock, ArrowLeft, CreditCard } from 'lucide-react';
import StripePaymentWrapper from '../Payment/StripePaymentForm';
import { mockVenues, mockCourts, mockTimeSlots, mockUser } from '../../utils/mockData';

interface TestModeBookingProps {
  onBack: () => void;
  onComplete: () => void;
}

interface PaymentDetails {
  amount: number;
  clientSecret: string;
  paymentIntentId: string;
  bookingId: string;
}

const TestModeBooking: React.FC<TestModeBookingProps> = ({ onBack, onComplete }) => {
  // Use mock data
  const venue = mockVenues[0];
  const courts = mockCourts.filter(court => court.facilityId === venue._id);
  
  // State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(mockTimeSlots[0]);
  const [selectedCourt, setSelectedCourt] = useState(courts[0]._id);
  const [selectedSport, setSelectedSport] = useState(venue.sportTypes[0]);
  const [duration, setDuration] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  
  // Payment flow states
  const [step, setStep] = useState<'booking' | 'payment' | 'confirmation'>('booking');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);

  // Calculate total price
  const selectedCourtData = courts.find(court => court._id === selectedCourt);
  const totalPrice = selectedCourtData ? selectedCourtData.pricePerHour * duration : 0;

  // Filter courts by selected sport
  const filteredCourts = courts.filter(court => court.sportType === selectedSport);

  const handleBooking = async () => {
    if (!selectedCourt || !selectedDate || !selectedTime) {
      setBookingError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      // Mock API call - create a fake pending booking
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

      const mockBookingResponse = {
        booking: {
          _id: `mock-booking-${Date.now()}`,
          courtId: selectedCourt,
          dateISO: selectedDate,
          start: selectedTime,
          end: `${String(parseInt(selectedTime.split(':')[0]) + duration).padStart(2, '0')}:00`,
          price: totalPrice,
          status: 'pending'
        },
        clientSecret: `pi_mock_${Date.now()}_secret`,
        paymentIntentId: `pi_mock_${Date.now()}`,
      };

      setBookingData(mockBookingResponse.booking);
      setPaymentDetails({
        amount: totalPrice,
        clientSecret: mockBookingResponse.clientSecret,
        paymentIntentId: mockBookingResponse.paymentIntentId,
        bookingId: mockBookingResponse.booking._id,
      });
      
      setStep('payment');
    } catch (error: any) {
      console.error('Mock booking error:', error);
      setBookingError('Failed to create booking (mock error)');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStripePayment = async (_paymentIntentId: string) => {
    try {
      // Mock payment verification
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay

      const mockVerificationResponse = {
        success: true,
        booking: {
          ...bookingData,
          status: 'confirmed',
          confirmedAt: new Date()
        }
      };

      setBookingData(mockVerificationResponse.booking);
      setStep('confirmation');
    } catch (error) {
      console.error('Mock payment verification error:', error);
      alert('Payment verification failed (mock error)');
    }
  };

  const handlePaymentError = (error: string) => {
    setBookingError(error);
    setIsSubmitting(false);
  };

  const getSportEmoji = (sport: string) => {
    const emojiMap: { [key: string]: string } = {
      'Football': '⚽',
      'Basketball': '🏀',
      'Tennis': '🎾',
      'Cricket': '🏏',
      'Badminton': '🏸',
      'Volleyball': '🏐',
      'Table Tennis': '🏓'
    };
    return emojiMap[sport] || '🏆';
  };

  const renderBookingStep = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Test Mode Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-yellow-600 text-2xl">🧪</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Test Mode Active</h3>
            <p className="text-sm text-yellow-700">
              Using mock data for Stripe payment testing. No real bookings will be created.
            </p>
          </div>
        </div>
      </div>

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
          <span className="text-gray-600">{mockUser.fullName}</span>
        </div>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Court Booking (Test Mode)</h1>

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
                  onChange={(e) => {
                    setSelectedSport(e.target.value);
                    // Reset court selection when sport changes
                    const newCourts = courts.filter(court => court.sportType === e.target.value);
                    if (newCourts.length > 0) {
                      setSelectedCourt(newCourts[0]._id);
                    }
                  }}
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
                    {mockTimeSlots.map(time => (
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
                {filteredCourts.length > 0 ? (
                  <select
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {filteredCourts.map(court => (
                      <option key={court._id} value={court._id}>
                        {court.name} - ₹{court.pricePerHour}/hr
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="block w-full px-3 py-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
                    No courts available for {selectedSport}
                  </div>
                )}
              </div>

              {bookingError && (
                <div className="text-red-600 text-sm mb-2">{bookingError}</div>
              )}

              <button
                onClick={handleBooking}
                disabled={isSubmitting || filteredCourts.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-4 rounded-md font-medium flex items-center justify-center"
              >
                {isSubmitting ? (
                  'Creating Test Booking...'
                ) : (
                  <>
                    <CreditCard size={16} className="mr-2" />
                    Test Stripe Payment - ₹{totalPrice}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Booking Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Venue:</span>
                <span className="font-medium">{venue.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sport:</span>
                <span className="font-medium">{getSportEmoji(selectedSport)} {selectedSport}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{selectedTime} - {String(Math.min(23, parseInt(selectedTime.split(':')[0]) + duration)).padStart(2, '0')}:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-medium">{duration} hour{duration > 1 ? 's' : ''}</span>
              </div>
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
        {/* Test Mode Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">🧪</span>
            <span className="text-sm text-blue-800 font-medium">
              Test Mode: Use card 4242 4242 4242 4242
            </span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-gray-800">Complete Test Payment</h2>
          <p className="text-gray-600 mt-2">Testing Stripe payment integration</p>
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <div className="text-center">
            <p className="text-lg font-semibold text-blue-800">Amount to Pay</p>
            <p className="text-3xl font-bold text-blue-600">₹{paymentDetails?.amount}</p>
            <p className="text-sm text-gray-600 mt-2">Test Booking ID: {paymentDetails?.bookingId}</p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Test Booking Details</h4>
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

          {/* Manual Test Payment Button - bypass for testing */}
          <button
            onClick={() => {
              setIsSubmitting(true);
              setTimeout(() => {
                handleStripePayment('mock_payment_intent_test');
                setIsSubmitting(false);
              }, 2000);
            }}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing Test Payment...' : '🧪 Simulate Successful Payment (Bypass Stripe)'}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              🔒 Secure payment powered by Stripe (Test Mode)
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
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">🎉 Test Payment Successful!</h2>
        <p className="text-gray-600 mb-8">Your Stripe integration is working correctly!</p>
        
        <div className="bg-green-50 p-6 rounded-lg mb-8 space-y-2">
          <p className="font-medium text-green-800">Test Booking Details:</p>
          <p className="text-sm text-green-700">ID: {bookingData?._id}</p>
          <p className="text-sm text-green-700">Venue: {venue.name}</p>
          <p className="text-sm text-green-700">Sport: {selectedSport}</p>
          <p className="text-sm text-green-700">Date: {new Date(selectedDate).toLocaleDateString()}</p>
          <p className="text-sm text-green-700">Time: {selectedTime} ({duration}h)</p>
          <p className="text-sm text-green-700">Amount Paid: ₹{paymentDetails?.amount}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This was a test transaction. No real booking was created.
          </p>
        </div>
        
        <button
          onClick={onComplete}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium"
        >
          Complete Test
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

export default TestModeBooking;
