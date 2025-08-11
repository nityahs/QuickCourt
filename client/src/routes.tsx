import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { facilitiesAPI } from './services/facilities';

// Import components
import HeroSection from './components/Home/HeroSection';
import PopularSports from './components/Home/PopularSports';
import VenuesList from './components/Venues/VenuesList';
import VenueDetails from './components/Venues/VenueDetails';
import BookingForm from './components/Booking/BookingForm';
import UserProfile from './components/User/UserProfile';
import FacilityOwnerDashboard from './components/FacilityOwner/FacilityOwnerDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import { Venue } from './types';

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
  
  if (user?.role === 'admin') {
    return <Navigate to="/" replace />;
  }
  
  if (user?.role === 'facility_owner') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">All Bookings</h1>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600 mb-4">As a facility owner, you can manage all bookings through your dashboard.</p>
          <button
            onClick={() => window.location.hash = 'facility-owner'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Your bookings will appear here.</p>
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

  // Transform server facility data to frontend venue format
  const transformFacilityToVenue = (facility: any): Venue => {
    return {
      id: facility._id,
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
      courts: [], // This would need to be fetched separately or included in the facility model
      ownerId: facility.ownerId || '',
      isApproved: facility.status === 'approved'
    };
  };

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
    // For now, just log the booking attempt
    console.log('Would book venue:', venueToBook);
    // In a real implementation, this would navigate to a booking page
    // navigate(`/booking/${venueToBook.id}`);
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

// Facility Owner Page Component
const FacilityOwnerPage = () => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'facility_owner') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-lg text-gray-600 mb-6">
            You need to be logged in as a facility owner to access this dashboard.
          </p>
          <button
            onClick={() => window.location.hash = 'login'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login as Facility Owner
          </button>
        </div>
      </div>
    );
  }
  
  return <FacilityOwnerDashboard />;
};

// Main AppRoutes Component
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/venues" element={<VenuesPage />} />
      <Route path="/venue/:id" element={<VenueDetailsPage />} />
      <Route path="/bookings" element={<BookingsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/facility-owner" element={<FacilityOwnerPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
