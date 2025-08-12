import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { facilitiesAPI } from './services/facilities';
import { bookingsAPI, UserBooking } from './services/bookings';
import { Plus, Edit } from 'lucide-react';

// Import components
import HeroSection from './components/Home/HeroSection';
import PopularSports from './components/Home/PopularSports';
import VenuesList from './components/Venues/VenuesList';
import VenueDetails from './components/Venues/VenueDetails';
import BookingForm from './components/Booking/BookingForm';
import UserProfile from './components/User/UserProfile';
import FacilityOwnerDashboard from './components/FacilityOwner/FacilityOwnerDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import TestLauncher from './components/Test/TestLauncher';
import AvailabilityCalendar from './components/FacilityOwner/TimeSlots/AvailabilityCalendar';
import FacilityOwnerLayout from './components/FacilityOwner/Layout/FacilityOwnerLayout';
import FacilityList from './components/FacilityOwner/Facilities/FacilityList';
import BookingOverview from './components/FacilityOwner/Bookings/BookingOverview';
import CourtManagement from './components/FacilityOwner/Courts/CourtManagement';
import AdminFacilitiesPage from './components/Admin/AdminFacilitiesPage';
import PendingFacilitiesPage from './components/Admin/PendingFacilitiesPage';
import AdminAuthFix from './components/Admin/AdminAuthFix';
import { Venue, Court } from './types';

// Transform server facility data to frontend venue format
interface ServerFacility {
  _id: string;
  name?: string;
  description?: string;
  address?: string;
  geolocation?: { lat: number; lng: number };
  sports?: string[];
  startingPricePerHour?: number;
  ratingAvg?: number;
  ratingCount?: number;
  photos?: string[];
  amenities?: string[];
  courts?: Array<{ _id: string; name?: string; sport?: string; pricePerHour?: number }>;
  ownerId?: string;
  status?: string;
}

const transformFacilityToVenue = (facility: ServerFacility): Venue => {
  // Map courts from facility if available
  const mappedCourts: Court[] = facility.courts ? facility.courts.map((court) => ({
    id: court._id || '',
    name: court.name || '',
    sportType: court.sport || '',
    pricePerHour: court.pricePerHour || 0,
    venueId: facility._id || ''
  })) : [];

  return {
    id: facility._id || '',
    _id: facility._id,
    name: facility.name || '',
    description: facility.description || '',
    address: facility.address || '',
    location: facility.address || '', // Use address as location fallback
    geolocation: facility.geolocation ? {
      lat: facility.geolocation.lat,
      lng: facility.geolocation.lng
    } : undefined,
    sportTypes: facility.sports || [],
    startingPrice: facility.startingPricePerHour || 0,
    rating: facility.ratingAvg || 0,
    reviewCount: facility.ratingCount || 0,
    images: facility.photos || [],
    amenities: facility.amenities || [],
    operatingHours: {
      start: '09:00',
      end: '21:00'
    },
    courts: mappedCourts,
    ownerId: facility.ownerId || '',
    isApproved: facility.status === 'approved'
  };
};

// Home Page Component
const HomePage = () => {
  const navigate = useNavigate();
  
  const handleViewVenue = (venue: Venue) => {
    navigate(`/venue/${venue.id}`);
  };

  return (
    <>
      <HeroSection />
      <PopularSports />
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Venues</h2>
            <p className="text-lg text-gray-600">Book your favorite sports venues</p>
          </div>
          <VenuesList onViewVenue={handleViewVenue} />
        </div>
      </div>
    </>
  );
};

// Bookings Page Component
const BookingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState<UserBooking[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'user') return;
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await bookingsAPI.getMyBookings();
        if (!ignore) setBookings(data);
      } catch (e: any) {
        if (!ignore) setError(e?.response?.data?.error || 'Failed to fetch bookings');
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [user?.id]);

  if (user?.role === 'admin') return <Navigate to="/" replace />;
  if (user?.role === 'facility_owner') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Bookings</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 mb-4">As a facility owner, you can manage all bookings through your dashboard.</p>
          <button onClick={() => navigate('/facility-owner')} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        {loading && <p className="text-gray-600">Loading your bookings...</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {!loading && !error && bookings.length === 0 && (
          <p className="text-gray-600">You have no bookings yet.</p>
        )}
        <ul className="divide-y divide-gray-200">
          {bookings.map(b => (
            <li key={b._id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">{b.dateISO} {b.start}-{b.end}</p>
                <p className="text-xs text-gray-500">Status: {b.status}</p>
              </div>
              <div className="mt-2 sm:mt-0 text-sm font-semibold text-blue-600">₹{b.price}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Venues Page Component
const VenuesPage = () => {
  const navigate = useNavigate();
  
  const handleViewVenue = (venue: Venue) => {
    navigate(`/venue/${venue.id}`);
  };
  
  return <VenuesList onViewVenue={handleViewVenue} />;
};

// Venue Details Page Component
const VenueDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use the global transformFacilityToVenue function instead of redefining it
  // This removes the duplicate definition that was causing type conflicts

  useEffect(() => {
    const fetchVenue = async () => {
      if (!id) {
        setError('No venue ID provided');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching venue with ID:', id);
        const response = await facilitiesAPI.getById(id);
        console.log('Raw API response:', response.data);
        
        const transformedVenue = transformFacilityToVenue(response.data);
        console.log('Transformed venue:', transformedVenue);
        
        setVenue(transformedVenue);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching venue:', error);
        setError('Failed to load venue details');
        setLoading(false);
      }
    };

    fetchVenue();
  }, [id]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleBookVenue = (venueToBook: Venue) => {
    // Navigate to booking page
    console.log('Navigating to booking for venue:', venueToBook.id);
    navigate(`/booking/${venueToBook.id}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Venue Not Found'}
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {error || "The venue you're looking for doesn't exist."}
          </p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <VenueDetails venue={venue} onBack={handleBack} onBookVenue={handleBookVenue} />;
};

// Profile Page Component
const ProfilePage = () => {
  return (
    <UserProfile onBack={() => window.history.back()} />
  );
};

// Main AppRoutes Component - Maps to all server API endpoints
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/venues" element={<VenuesPage />} />
      <Route path="/venue/:id" element={<VenueDetailsPage />} />
      <Route path="/test" element={<TestLauncher />} />
      
      {/* Auth-required Routes */}
      <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
      <Route path="/booking/:venueId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      
      {/* Role-specific Routes */}
      <Route path="/facility-owner/*" element={
        <ProtectedRoute requiredRole="facility_owner">
          <FacilityOwnerRoutes />
        </ProtectedRoute>
      } />
      <Route path="/admin/*" element={<ProtectedRoute requiredRole="admin"><AdminRoutes /></ProtectedRoute>} />
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Protected Route Wrapper
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'facility_owner' | 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login
    window.location.hash = 'login';
    return <Navigate to="/" replace />;
  }

  console.log('ProtectedRoute - User role:', user.role, 'Required role:', requiredRole);
  
  // Special handling for facility_owner role
  let hasAccess = true;
  
  if (requiredRole) {
    if (requiredRole === 'facility_owner') {
      // Allow access if user is a facility_owner
      hasAccess = user.role === 'facility_owner';
    } else {
      // For other roles, require exact match
      hasAccess = user.role === requiredRole;
    }
  }
  
  if (requiredRole && !hasAccess) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-lg text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Facility Owner Sub-Routes (maps to facility owner API endpoints)
const FacilityOwnerRoutes = () => {
  console.log('Rendering FacilityOwnerRoutes');
  return (
    <Routes>
      <Route index element={<FacilityOwnerDashboard />} />
      <Route path="/" element={<FacilityOwnerDashboard />} />
      <Route path="/facilities" element={<OwnerFacilitiesPage />} />
      <Route path="/facilities/new" element={<CreateFacilityPage />} />
      <Route path="/facilities/:id" element={<EditFacilityPage />} />
      <Route path="/bookings" element={<OwnerBookingsPage />} />
      <Route path="/courts" element={<OwnerCourtsPage />} />
      <Route path="/courts/new" element={<CreateCourtPage />} />
      <Route path="/courts/:id" element={<EditCourtPage />} />
      <Route path="/time-slots" element={<OwnerTimeSlotsPage />} />
      <Route path="/profile" element={<OwnerProfilePage />} />
    </Routes>
  );
};

// Admin Sub-Routes (maps to admin API endpoints)
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/facilities" element={<AdminFacilitiesPage />} />
      <Route path="/facilities/pending" element={<PendingFacilitiesPage />} />
      <Route path="/auth-fix" element={<AdminAuthFix />} />
      <Route path="/users" element={<UserManagementPage />} />
      <Route path="/bookings" element={<AdminBookingsPage />} />
      <Route path="/stats" element={<AdminStatsPage />} />
    </Routes>
  );
};

// Booking Page Component (maps to /api/bookings endpoints)
const BookingPage = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      if (!venueId) return;
      try {
        const response = await facilitiesAPI.getById(venueId);
        const transformedVenue = transformFacilityToVenue(response.data);
        setVenue(transformedVenue);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching venue for booking:', error);
        setLoading(false);
      }
    };
    fetchVenue();
  }, [venueId]);

  const handleBookingComplete = () => {
    navigate('/bookings');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading booking form...</p>
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Venue Not Found</h1>
          <button
            onClick={() => navigate('/venues')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Venues
          </button>
        </div>
      </div>
    );
  }

  return (
    <BookingForm 
      venue={venue} 
      onBack={() => navigate(`/venue/${venue.id}`)}
      onBookingComplete={handleBookingComplete}
    />
  );
};

// Placeholder components for future implementation
const OwnerFacilitiesPage = () => (
  <FacilityOwnerLayout>
    <FacilityList />
  </FacilityOwnerLayout>
);

const CreateFacilityPage = () => (
  <FacilityOwnerLayout>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Facility</h1>
          <p className="text-gray-600 mt-2">Add a new sports facility to your portfolio</p>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-8 text-center">
        <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Facility - Coming Soon</h2>
        <p className="text-gray-600 mb-6">We're working on this feature. Check back soon!</p>
      </div>
    </div>
  </FacilityOwnerLayout>
);

const EditFacilityPage = () => (
  <FacilityOwnerLayout>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Facility</h1>
          <p className="text-gray-600 mt-2">Update your facility information</p>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-8 text-center">
        <Edit className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Facility - Coming Soon</h2>
        <p className="text-gray-600 mb-6">We're working on this feature. Check back soon!</p>
      </div>
    </div>
  </FacilityOwnerLayout>
);

const OwnerBookingsPage = () => (
  <FacilityOwnerLayout>
    <BookingOverview />
  </FacilityOwnerLayout>
);

const OwnerCourtsPage = () => (
  <FacilityOwnerLayout>
    <CourtManagement />
  </FacilityOwnerLayout>
);

const CreateCourtPage = () => (
  <FacilityOwnerLayout>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Court</h1>
          <p className="text-gray-600 mt-2">Add a new court to your facility</p>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-8 text-center">
        <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Court - Coming Soon</h2>
        <p className="text-gray-600 mb-6">We're working on this feature. Check back soon!</p>
      </div>
    </div>
  </FacilityOwnerLayout>
);

const EditCourtPage = () => (
  <FacilityOwnerLayout>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Court</h1>
          <p className="text-gray-600 mt-2">Update your court information</p>
        </div>
      </div>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg p-8 text-center">
        <Edit className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Court - Coming Soon</h2>
        <p className="text-gray-600 mb-6">We're working on this feature. Check back soon!</p>
      </div>
    </div>
  </FacilityOwnerLayout>
);
const OwnerTimeSlotsPage = () => <AvailabilityCalendar />;
const OwnerProfilePage = () => <UserProfile onBack={() => window.history.back()} />;
const UserManagementPage = () => <div className="p-8"><h1 className="text-2xl font-bold">User Management - Coming Soon</h1></div>;
const AdminBookingsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Admin Bookings - Coming Soon</h1></div>;
const AdminStatsPage = () => <div className="p-8"><h1 className="text-2xl font-bold">Admin Stats - Coming Soon</h1></div>;

export default AppRoutes;