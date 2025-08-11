import React, { useState } from 'react';
import { User, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { validatePassword } from '../../utils/validation';
import { Booking } from '../../types';

interface UserProfileProps {
  onBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const { user, isLoading } = useAuth();
  
  // Set default tab based on user role
  const defaultTab = user?.role === 'facility_owner' ? 'profile' : 'bookings';
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>(defaultTab);
  const [formData, setFormData] = useState({
    fullName: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Mock bookings data
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      userId: user?.id || '',
      venueId: 'v1',
      courtId: 'c1',
      date: '2023-06-15',
      startTime: '14:00',
      duration: 2,
      totalPrice: 50,
      status: 'confirmed',
      createdAt: '2023-06-10T10:30:00Z'
    },
    {
      id: '2',
      userId: user?.id || '',
      venueId: 'v2',
      courtId: 'c2',
      date: '2023-06-20',
      startTime: '16:00',
      duration: 1,
      totalPrice: 30,
      status: 'confirmed',
      createdAt: '2023-06-12T14:45:00Z'
    },
    {
      id: '3',
      userId: user?.id || '',
      venueId: 'v1',
      courtId: 'c3',
      date: '2023-05-25',
      startTime: '10:00',
      duration: 2,
      totalPrice: 45,
      status: 'completed',
      createdAt: '2023-05-20T09:15:00Z'
    },
    {
      id: '4',
      userId: user?.id || '',
      venueId: 'v3',
      courtId: 'c4',
      date: '2023-05-18',
      startTime: '18:00',
      duration: 1.5,
      totalPrice: 40,
      status: 'cancelled',
      createdAt: '2023-05-15T16:20:00Z'
    }
  ]);

  // Mock venue data
  const venueNames: Record<string, string> = {
    'v1': 'Downtown Sports Center',
    'v2': 'Riverside Tennis Club',
    'v3': 'Central Basketball Arena'
  };

  // Mock court data
  const courtDetails: Record<string, { name: string, sport: string }> = {
    'c1': { name: 'Court 1', sport: 'Tennis' },
    'c2': { name: 'Court 2', sport: 'Badminton' },
    'c3': { name: 'Court 3', sport: 'Tennis' },
    'c4': { name: 'Court 4', sport: 'Basketball' }
  };

  React.useEffect(() => {
    // Initialize form with user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check password requirements as user types
    if (name === 'newPassword') {
      const errors: string[] = [];
      
      if (value.length < 8) {
        errors.push('At least 8 characters');
      }
      
      if (!/[A-Z]/.test(value)) {
        errors.push('At least one uppercase letter');
      }
      
      if (!/[0-9]/.test(value)) {
        errors.push('At least one number');
      }
      
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
        errors.push('At least one special character');
      }
      
      setPasswordErrors(errors);
    }
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate full name
    if (formData.fullName.trim().length < 3) {
      setError('Full name must be at least 3 characters');
      return;
    }

    // If changing password
    if (formData.newPassword) {
      // Validate current password (in a real app, this would be checked against the stored password)
      if (!formData.currentPassword) {
        setError('Please enter your current password');
        return;
      }

      // Validate new password
      const passwordValidation = validatePassword(formData.newPassword);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message || 'Password does not meet requirements');
        return;
      }

      // Confirm passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
    }

    // Simulate API call to update profile
    setTimeout(() => {
      // Update user data in a real app
      setSuccess('Profile updated successfully');
    }, 1000);
  };

  const handleCancelBooking = (bookingId: string) => {
    // Simulate API call to cancel booking
    setBookings(prevBookings =>
      prevBookings.map(booking =>
        booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
      )
    );
  };

  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Back to Home
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {/* Only show bookings tab for regular users */}
          {user?.role !== 'facility_owner' && (
            <button
              onClick={() => setActiveTab('bookings')}
              className={`${activeTab === 'bookings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              My Bookings
            </button>
          )}
          <button
            onClick={() => setActiveTab('profile')}
            className={`${activeTab === 'profile'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Edit Profile
          </button>
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'bookings' ? (
        <div>
          {/* Show different content for facility owners vs regular users */}
          {user?.role === 'facility_owner' ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">All Bookings</h2>
              <p className="text-gray-600 mb-4">As a facility owner, you can manage all bookings through your dashboard.</p>
              <button
                onClick={() => window.location.hash = 'facility-owner/bookings'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">My Bookings</h2>
              
              {bookings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <p className="text-gray-600">You don't have any bookings yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {venueNames[booking.venueId]}
                          </h3>
                          <p className="text-gray-600">
                            {courtDetails[booking.courtId]?.sport} - {courtDetails[booking.courtId]?.name}
                          </p>
                          <p className="text-gray-600">
                            {formatDate(booking.date)} at {formatTime(booking.startTime)}
                          </p>
                          <p className="text-gray-600">
                            Duration: {booking.duration} {booking.duration === 1 ? 'hour' : 'hours'}
                          </p>
                          <p className="text-gray-600">
                            Total: ${booking.totalPrice.toFixed(2)}
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          
                          {booking.status === 'confirmed' && isUpcoming(booking.date) && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Edit Profile</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                <p className="text-sm text-gray-600 mb-4">Leave blank if you don't want to change your password</p>
              </div>

              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-10 py-3 border ${passwordErrors.length > 0 && formData.newPassword ? 'border-yellow-400' : 'border-gray-300'} rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordErrors.length > 0 && formData.newPassword && (
                  <div className="mt-2 text-sm text-yellow-600">
                    <p className="font-medium">Password must contain:</p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      {passwordErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              {success && (
                <div className="text-green-600 text-sm">{success}</div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;