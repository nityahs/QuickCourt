import React, { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import VenueCard from './VenueCard';
import { Venue } from '../../types';

interface VenuesListProps {
  onViewVenue: (venue: Venue) => void;
}

const VenuesList: React.FC<VenuesListProps> = ({ onViewVenue }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock venues data
  const mockVenues: Venue[] = [
    {
      id: '1',
      name: 'SBR Badminton',
      description: 'Premium badminton facility with professional courts',
      address: 'Koramangala, Bangalore',
      location: 'Koramangala, Bangalore',
      sportTypes: ['Badminton'],
      startingPrice: 200,
      rating: 4.5,
      reviewCount: 6,
      images: ['https://images.pexels.com/photos/1103829/pexels-photo-1103829.jpeg?auto=compress&cs=tinysrgb&w=500'],
      amenities: ['Parking', 'Restroom', 'Refreshments', 'CCTV Surveillance', 'Library'],
      operatingHours: { start: '06:00', end: '23:00' },
      courts: [],
      ownerId: '1',
      isApproved: true
    },
    {
      id: '2',
      name: 'Elite Sports Complex',
      description: 'Multi-sport facility with modern amenities',
      address: 'Indiranagar, Bangalore',
      location: 'Indiranagar, Bangalore',
      sportTypes: ['Tennis', 'Badminton', 'Squash'],
      startingPrice: 300,
      rating: 4.3,
      reviewCount: 12,
      images: ['https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=500'],
      amenities: ['Parking', 'Restroom', 'Refreshments', 'AC'],
      operatingHours: { start: '05:00', end: '22:00' },
      courts: [],
      ownerId: '2',
      isApproved: true
    },
    {
      id: '3',
      name: 'Champions Football Turf',
      description: 'Professional football turf with floodlights',
      address: 'Whitefield, Bangalore',
      location: 'Whitefield, Bangalore',
      sportTypes: ['Football'],
      startingPrice: 800,
      rating: 4.7,
      reviewCount: 25,
      images: ['https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=500'],
      amenities: ['Parking', 'Restroom', 'Floodlights', 'Changing Room'],
      operatingHours: { start: '06:00', end: '24:00' },
      courts: [],
      ownerId: '3',
      isApproved: true
    },
    {
      id: '4',
      name: 'Ace Basketball Court',
      description: 'Indoor basketball court with professional setup',
      address: 'HSR Layout, Bangalore',
      location: 'HSR Layout, Bangalore',
      sportTypes: ['Basketball'],
      startingPrice: 400,
      rating: 4.2,
      reviewCount: 8,
      images: ['https://images.pexels.com/photos/358042/pexels-photo-358042.jpeg?auto=compress&cs=tinysrgb&w=500'],
      amenities: ['Parking', 'Restroom', 'AC', 'Sound System'],
      operatingHours: { start: '07:00', end: '22:00' },
      courts: [],
      ownerId: '4',
      isApproved: true
    }
  ];

  const sports = ['Badminton', 'Tennis', 'Football', 'Basketball', 'Cricket', 'Swimming'];
  const priceRanges = [
    { label: 'Under ₹300', value: '0-300' },
    { label: '₹300 - ₹600', value: '300-600' },
    { label: '₹600 - ₹1000', value: '600-1000' },
    { label: 'Above ₹1000', value: '1000+' }
  ];

  const filteredVenues = mockVenues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         venue.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = !selectedSport || venue.sportTypes.includes(selectedSport);
    
    let matchesPrice = true;
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(p => p === '+' ? Infinity : parseInt(p));
      matchesPrice = venue.startingPrice >= min && (max === Infinity || venue.startingPrice <= max);
    }

    return matchesSearch && matchesSport && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Filter size={20} />
              </button>
            </div>

            <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by venue name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search venues..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by sport type
                </label>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Sports</option>
                  {sports.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price range per hour
                </label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Prices</option>
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose venue type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Indoor</span>
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                    />
                    <span className="ml-2 text-sm text-gray-700">Outdoor</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                      />
                      <span className="ml-2 text-sm text-gray-700">{rating} Stars & up</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => {
                  // Reset to first page when applying filters
                  // This would be connected to pagination state in a real app
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md text-sm font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Venues Grid */}
        <div className="lg:w-3/4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Sports Venues in Bangalore
            </h2>
            <p className="text-gray-600">
              {filteredVenues.length} venues found
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVenues.map(venue => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onViewDetails={onViewVenue}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button className="px-3 py-2 text-gray-500 hover:text-gray-700">
                Previous
              </button>
              {[1, 2, 3, 4, 5].map(page => (
                <button
                  key={page}
                  className={`px-3 py-2 rounded-md ${
                    page === 1
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="px-3 py-2 text-gray-500 hover:text-gray-700">
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenuesList;