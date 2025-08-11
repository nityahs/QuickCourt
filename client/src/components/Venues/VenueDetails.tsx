import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Star, Wifi, Car, Coffee, Shield, Book, ChevronLeft, ChevronRight } from 'lucide-react';
import { Venue } from '../../types';

interface VenueDetailsProps {
  venue: Venue;
  onBack: () => void;
  onBookVenue: (venue: Venue) => void;
}

const VenueDetails: React.FC<VenueDetailsProps> = ({ venue, onBack, onBookVenue }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const amenityIcons: { [key: string]: React.ReactNode } = {
    'Parking': <Car size={16} />,
    'Restroom': <Shield size={16} />,
    'Refreshments': <Coffee size={16} />,
    'CCTV Surveillance': <Shield size={16} />,
    'Library': <Book size={16} />,
    'WiFi': <Wifi size={16} />,
    'AC': <Wifi size={16} />,
    'Floodlights': <Shield size={16} />,
    'Changing Room': <Shield size={16} />,
    'Sound System': <Wifi size={16} />
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % venue.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + venue.images.length) % venue.images.length);
  };

  const mockReviews = [
    {
      id: '1',
      userId: '1',
      venueId: venue.id,
      rating: 5,
      comment: 'Very nice, well maintained',
      createdAt: '2024-01-15',
      userName: 'Ritesh Jain'
    },
    {
      id: '2',
      userId: '2',
      venueId: venue.id,
      rating: 4,
      comment: 'Good facility with proper maintenance',
      createdAt: '2024-01-10',
      userName: 'Priya Sharma'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </button>
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">Login / Sign Up</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h1>
          <div className="flex items-center text-gray-600 mb-6">
            <MapPin size={16} className="mr-1" />
            <span>{venue.address}</span>
            <div className="flex items-center ml-4">
              <Star size={16} className="text-yellow-400 fill-current mr-1" />
              <span className="font-medium">{venue.rating}</span>
              <span className="ml-1">({venue.reviewCount})</span>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="relative mb-8">
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={venue.images[currentImageIndex] || 'https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=800'}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            </div>
            {venue.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
              Images / Videos
            </div>
          </div>

          {/* Sports Available */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sports Available</h2>
            <div className="grid grid-cols-3 gap-4">
              {venue.sportTypes.map((sport) => (
                <div key={sport} className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">🏸</span>
                  </div>
                  <span className="text-sm font-medium">{sport}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {venue.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2 text-green-600">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    {amenityIcons[amenity] || <Shield size={12} />}
                  </div>
                  <span className="text-sm">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* About Venue */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About Venue</h2>
            <div className="space-y-2 text-gray-600">
              <p>• Tournament Training Venue</p>
              <p>• For more than 2 players Rs. 50 extra per person</p>
              <p>• Equipment available on rent</p>
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Player Reviews & Ratings</h2>
            <div className="space-y-4">
              {mockReviews.map((review) => (
                <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{review.userName.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{review.userName}</span>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{review.createdAt}</span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-4">
              Load more reviews!
            </button>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
            <button
              onClick={() => onBookVenue(venue)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-medium mb-4"
            >
              Book This Venue
            </button>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Operating Hours</h3>
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-2" />
                  <span>{venue.operatingHours.start} - {venue.operatingHours.end}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Location Map</h3>
                <div className="bg-gray-100 h-32 rounded-md flex items-center justify-center">
                  <span className="text-gray-500">Map View</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetails;