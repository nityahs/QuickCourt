import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, MoreHorizontal, Calendar, Clock, DollarSign, User, MapPin, Building2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { facilityOwnerAPI, facilityOwnerBookingAPI } from '../../../services/facilityOwner';

interface Booking {
  _id: string;
  id?: string; // Some responses might use id instead of _id
  status: string;
  price: number;
  start: string;
  end: string;
  dateISO: string;
  createdAt: string;
  user: { 
    name: string; 
    email: string; 
    fullName?: string; // Add fullName property
  };
  court: { 
    name: string; 
    sport: string; 
    sportType?: string; // Add sportType property
  };
  facility: { name: string; };
}

const BookingOverview: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user?.id) {
        console.log('No user ID available, skipping booking fetch');
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching facilities for user ID:', user.id);
        // First get user's facilities
        const facilitiesResponse = await facilityOwnerAPI.getOwnerFacilities();
        console.log('Facilities response:', facilitiesResponse);
        
        const facilityIds = facilitiesResponse.data.map((f: any) => f._id || f.id);
        console.log('Extracted facility IDs:', facilityIds);
        
        if (facilityIds.length === 0) {
          console.log('No facilities found for this user, returning empty bookings');
          setBookings([]);
          setTotalBookings(0);
          setTotalPages(1);
          return;
        }

        // Then get bookings for those facilities
        const params: any = {
          page: currentPage,
          limit: 20,
          facilityIds: facilityIds // Pass facility IDs as part of params
        };
        
        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }

        console.log('Fetching bookings with params:', params);
        const bookingsResponse = await facilityOwnerBookingAPI.getOwnerBookings(params);
        // Log the response for debugging
        console.log('Bookings API response:', bookingsResponse);
        console.log('Response data type:', typeof bookingsResponse);
        console.log('Response structure:', Object.keys(bookingsResponse || {}));
        
        if (!bookingsResponse) {
          throw new Error('Empty response received from API');
        }
        
        // Handle different response structures
        const responseData = bookingsResponse.data || bookingsResponse;
        console.log('Response data after normalization:', typeof responseData, responseData);
        
        if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data)) {
          console.log('Processing nested data array response');
          const typedResponse = responseData as unknown as { data: Booking[]; total: number; totalPages: number };
          
          if (!Array.isArray(typedResponse.data)) {
            console.error('Expected data to be an array but got:', typeof typedResponse.data);
            throw new Error(`Invalid data format: expected array but got ${typeof typedResponse.data}`);
          }
          
          // Ensure all required properties exist before setting state
          const safeBookings = typedResponse.data.map((booking, index) => {
            // Log any problematic bookings
            if (!booking || typeof booking !== 'object') {
              console.error(`Invalid booking at index ${index}:`, booking);
              return {
                _id: `temp-${Math.random()}`,
                status: 'pending',
                price: 0,
                start: '00:00',
                end: '00:00',
                dateISO: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                user: { name: 'Unknown', email: 'unknown@example.com' },
                court: { name: 'Unknown Court', sport: 'Unknown' },
                facility: { name: 'Unknown Facility' }
              };
            }
            
            // Check for missing properties
            if (!booking.user) console.warn(`Booking ${booking._id || index} missing user property`);
            if (!booking.court) console.warn(`Booking ${booking._id || index} missing court property`);
            if (!booking.facility) console.warn(`Booking ${booking._id || index} missing facility property`);
            
            // Create a safe booking object with all required properties
            return {
              ...booking,
              _id: booking._id || booking.id || `temp-${Math.random()}`,
              status: booking.status || 'pending',
              price: booking.price || 0,
              start: booking.start || '00:00',
              end: booking.end || '00:00',
              dateISO: booking.dateISO || new Date().toISOString().split('T')[0],
              createdAt: booking.createdAt || new Date().toISOString(),
              user: booking.user ? {
                name: booking.user.name || booking.user.fullName || 'Unknown',
                email: booking.user.email || 'unknown@example.com'
              } : { name: 'Unknown', email: 'unknown@example.com' },
              court: booking.court ? {
                name: booking.court.name || 'Unknown Court',
                sport: booking.court.sport || booking.court.sportType || 'Unknown'
              } : { name: 'Unknown Court', sport: 'Unknown' },
              facility: booking.facility ? {
                name: booking.facility.name || 'Unknown Facility'
              } : { name: 'Unknown Facility' }
            };
          });
          
          console.log('Processed safe bookings:', safeBookings.length, 'items');
          setBookings(safeBookings);
          setTotalBookings(typedResponse.total || safeBookings.length);
          setTotalPages(typedResponse.totalPages || 1);
        } else if (Array.isArray(responseData)) {
          console.log('Processing direct array response');
          // Fallback if response is directly an array
          // Ensure all required properties exist with the same comprehensive approach
          const safeBookings = responseData.map((booking, index) => {
            // Log any problematic bookings
            if (!booking || typeof booking !== 'object') {
              console.error(`Invalid booking at index ${index}:`, booking);
              return {
                _id: `temp-${Math.random()}`,
                status: 'pending',
                price: 0,
                start: '00:00',
                end: '00:00',
                dateISO: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                user: { name: 'Unknown', email: 'unknown@example.com' },
                court: { name: 'Unknown Court', sport: 'Unknown' },
                facility: { name: 'Unknown Facility' }
              };
            }
            
            return {
              ...booking,
              _id: booking._id || booking.id || `temp-${Math.random()}`,
              status: booking.status || 'pending',
              price: booking.price || 0,
              start: booking.start || '00:00',
              end: booking.end || '00:00',
              dateISO: booking.dateISO || new Date().toISOString().split('T')[0],
              createdAt: booking.createdAt || new Date().toISOString(),
              user: booking.user ? {
                name: booking.user.name || booking.user.fullName || 'Unknown',
                email: booking.user.email || 'unknown@example.com'
              } : { name: 'Unknown', email: 'unknown@example.com' },
              court: booking.court ? {
                name: booking.court.name || 'Unknown Court',
                sport: booking.court.sport || booking.court.sportType || 'Unknown'
              } : { name: 'Unknown Court', sport: 'Unknown' },
              facility: booking.facility ? {
                name: booking.facility.name || 'Unknown Facility'
              } : { name: 'Unknown Facility' }
            };
          });
          
          console.log('Processed direct array bookings:', safeBookings.length, 'items');
          setBookings(safeBookings);
          setTotalBookings(responseData.length);
          setTotalPages(1);
        } else {
          // Default fallback
          console.warn('Unrecognized response format, defaulting to empty bookings');
          setBookings([]);
          setTotalBookings(0);
          setTotalPages(1);
        }
        
      } catch (err: any) {
        console.error('Error fetching bookings:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load bookings';
        console.error('Error details:', errorMessage);
        setError(errorMessage);
        // Set empty bookings array to prevent rendering issues
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user?.id, currentPage, statusFilter]);

  const filteredBookings = bookings.filter(booking => {
    // Safely access properties with fallbacks
    const userName = booking.user?.name || '';
    const courtName = booking.court?.name || '';
    const facilityName = booking.facility?.name || '';
    
    const matchesSearch = searchTerm === '' || 
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facilityName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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

  const formatDate = (dateString: string) => {
    try {
      // Check if dateString is valid
      if (!dateString || typeof dateString !== 'string') {
        return 'N/A';
      }
      
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'N/A';
      }
      
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const formatTime = (time: string) => {
    try {
      // Check if time is valid
      if (!time || typeof time !== 'string' || !time.includes(':')) {
        return 'N/A'; // Return placeholder for invalid time
      }
      
      const [hours, minutes] = time.split(':');
      
      // Validate hours and minutes
      const hour = parseInt(hours, 10);
      if (isNaN(hour) || hour < 0 || hour > 23) {
        return 'N/A';
      }
      
      // Ensure minutes is valid
      const mins = minutes || '00';
      if (mins.length !== 2 || isNaN(parseInt(mins, 10))) {
        return `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      }
      
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${mins} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'N/A';
    }
  };

  const calculateDuration = (start: string, end: string) => {
    try {
      // Ensure start and end are valid time strings
      if (!start || !end || typeof start !== 'string' || typeof end !== 'string') {
        return 1; // Default to 1 hour if invalid input
      }
      
      // Ensure proper time format (HH:MM)
      const startFormatted = start.includes(':') ? start : '00:00';
      const endFormatted = end.includes(':') ? end : '00:00';
      
      const startTime = new Date(`2000-01-01T${startFormatted}`);
      const endTime = new Date(`2000-01-01T${endFormatted}`);
      
      // Check if dates are valid
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return 1; // Default to 1 hour if invalid dates
      }
      
      const diffMs = endTime.getTime() - startTime.getTime();
      // Handle case where end time is before start time (next day)
      const adjustedDiffMs = diffMs < 0 ? diffMs + (24 * 60 * 60 * 1000) : diffMs;
      const diffHours = adjustedDiffMs / (1000 * 60 * 60);
      
      return diffHours > 0 ? diffHours : 1; // Ensure positive duration
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 1; // Default to 1 hour on error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Bookings</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Overview</h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor all bookings across your facilities
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="text-sm text-gray-500">
            Total: {totalBookings} bookings
          </span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by customer, court, or facility..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Court & Facility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No bookings found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, index) => (
                  <motion.tr
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {booking.court.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.court.sport} • {booking.facility.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(booking.dateISO)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(booking.start)} - {formatTime(booking.end)}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {calculateDuration(booking.start, booking.end)} hours
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          ₹{booking.price}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingOverview;
