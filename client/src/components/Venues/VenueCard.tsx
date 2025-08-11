import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { Venue } from '../../types';

interface VenueCardProps {
  venue: Venue;
  onViewDetails: (venue: Venue) => void;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onViewDetails }) => {
  const PLACEHOLDER = 'https://via.placeholder.com/800x450?text=No+Image';
  const primaryImage = (venue.images && venue.images.length > 0 ? venue.images[0] : PLACEHOLDER);
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        <img
          src={primaryImage}
          alt={venue.name}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-md shadow-sm">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{venue.rating}</span>
            <span className="text-sm text-gray-500">({venue.reviewCount})</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{venue.name}</h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{venue.location}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {venue.sportTypes.slice(0, 3).map((sport) => (
            <span
              key={sport}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {sport}
            </span>
          ))}
          {venue.sportTypes.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{venue.sportTypes.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            ₹{venue.startingPrice}/hr
          </div>
          <button
            onClick={() => onViewDetails(venue)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;