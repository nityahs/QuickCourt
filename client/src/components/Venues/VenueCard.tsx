import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { Venue } from '../../types';
import { motion } from 'framer-motion';

interface VenueCardProps {
  venue: Venue;
  onViewDetails: (venue: Venue) => void;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onViewDetails }) => {
  const PLACEHOLDER = 'https://via.placeholder.com/800x450?text=No+Image';
  const primaryImage = (venue.images && venue.images.length > 0 ? venue.images[0] : PLACEHOLDER);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -6 }}
      className="rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border" 
      style={{ backgroundColor: 'var(--card-bg, white)', borderColor: 'var(--card-border, #e5e7eb)' }}
    >
      <div className="relative h-48">
        <img
          src={primaryImage}
          alt={venue.name}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
          className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-4 right-4 px-2 py-1 rounded-md shadow-sm" style={{ backgroundColor: 'var(--card-bg, white)', color: 'var(--text-primary, #111827)' }}>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary, #111827)' }}>{venue.rating.toFixed(2)}</span>
            <span className="text-sm" style={{ color: 'var(--text-secondary, #4b5563)' }}>({venue.reviewCount})</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary, #111827)' }}>{venue.name}</h3>
        
        <div className="flex items-center mb-2" style={{ color: 'var(--text-secondary, #4b5563)' }}>
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{venue.location}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {venue.sportTypes.slice(0, 3).map((sport) => (
            <span
              key={sport}
              className="px-2 py-1 text-xs rounded-full"
              style={{ backgroundColor: 'var(--accent-primary, #10b981)', color: 'var(--button-text, white)', opacity: '0.8' }}
            >
              {sport}
            </span>
          ))}
          {venue.sportTypes.length > 3 && (
            <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--badge-bg, #f3f4f6)', color: 'var(--badge-text, #4b5563)' }}>
              +{venue.sportTypes.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold" style={{ color: 'var(--text-primary, #111827)' }}>
            ₹{venue.startingPrice}/hr
          </div>
          <button
            onClick={() => onViewDetails(venue)}
            className="px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 shadow-sporty"
            style={{ 
              backgroundColor: 'var(--button-primary-bg, #10b981)', 
              color: 'var(--button-text, white)' 
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default VenueCard;