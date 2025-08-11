import React, { useState, useEffect } from 'react';
import { facilitiesAPI } from '../../services/facilities';
import { Filter, Search } from 'lucide-react';
import VenueCard from './VenueCard';
import { Venue } from '../../types';

interface VenuesListProps {
  onViewVenue: (venue: Venue) => void;
}

const VenuesList: React.FC<VenuesListProps> = ({ onViewVenue }) => {
  const qs = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const initialSport = qs.get('sport') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState(initialSport);
  const [priceRange, setPriceRange] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [total, setTotal] = useState(0);

  // Keep URL in sync when selectedSport changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedSport) params.set('sport', selectedSport);
    else params.delete('sport');
    const newUrl = `${window.location.pathname}?${params.toString()}`.replace(/\?$/, '');
    window.history.replaceState({}, '', newUrl);
  }, [selectedSport]);

  useEffect(() => {
    setLoading(true);
    const params: any = { page, limit };
    if (selectedSport) params.sport = selectedSport;
    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (priceRange) {
      const [minStr, maxStr] = priceRange.split('-');
      const minPrice = parseInt(minStr) || 0;
      const maxPrice = priceRange.endsWith('+') ? undefined : parseInt(maxStr);
      params.minPrice = minPrice;
      if (maxPrice !== undefined && !Number.isNaN(maxPrice)) params.maxPrice = maxPrice;
    }

    facilitiesAPI.getAll(params)
      .then((res: any) => {
        // Map backend Facility to Venue type if needed
        const PLACEHOLDER = 'https://via.placeholder.com/800x450?text=No+Image';
        setVenues(res.data.data.map((f: any) => ({
          id: f._id,
          name: f.name,
          description: f.description,
          address: f.address,
          location: f.address,
          sportTypes: f.sports,
          startingPrice: f.startingPricePerHour,
          rating: f.ratingAvg,
          reviewCount: f.ratingCount,
          images: Array.isArray(f.photos) && f.photos.length > 0
            ? f.photos.filter((p: any) => typeof p === 'string' && p.length > 0)
            : [PLACEHOLDER],
          amenities: f.amenities,
          operatingHours: { start: '06:00', end: '23:00' },
          courts: [],
          ownerId: f.ownerId,
          isApproved: f.status === 'approved',
        })));
        setTotal(res.data.total || 0);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load venues');
        setLoading(false);
      });
  }, [page, selectedSport, priceRange, searchTerm]);

  // Reset to first page when filters change
  useEffect(() => { setPage(1); }, [selectedSport, priceRange, searchTerm]);

  const sports = ['Badminton', 'Tennis', 'Football', 'Basketball', 'Cricket', 'Swimming'];
  const priceRanges = [
    { label: 'Under ₹300', value: '0-300' },
    { label: '₹300 - ₹600', value: '300-600' },
    { label: '₹600 - ₹1000', value: '600-1000' },
    { label: 'Above ₹1000', value: '1000+' }
  ];

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  const pageNumbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);

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
                  // placeholder Apply Filters button
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md text-sm font-semibold shadow-sporty"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Venues Grid */}
        <div className="lg:w-3/4">
          {loading && <p className="text-gray-600">Loading venues...</p>}
          {error && <p className="text-red-600">{error}</p>}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Sports Venues in Bangalore
            </h2>
            <p className="text-gray-600">{total} venues found</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {venues.map(venue => (
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
              <button
                className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </button>
              {pageNumbers.map(pn => (
                <button
                  key={pn}
                  className={`px-3 py-2 rounded-md ${
                    pn === page
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setPage(pn)}
                >
                  {pn}
                </button>
              ))}
              <button
                className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
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