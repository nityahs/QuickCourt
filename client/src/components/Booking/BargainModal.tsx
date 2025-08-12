import React, { useState, useEffect } from 'react';
import { Slider } from 'lucide-react';
import http from '../../services/http';

interface BargainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offeredPrice: number) => void;
  originalPrice: number;
  facilityId: string;
  courtId: string;
  dateISO: string;
  start: string;
  end: string;
}

interface PriceStatistics {
  count: number;
  averageDiscount: number;
  minDiscount: number;
  maxDiscount: number;
  acceptedPrices: Array<{
    originalPrice: number;
    acceptedPrice: number;
    discountPercentage: number;
  }>;
}

const BargainModal: React.FC<BargainModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  originalPrice,
  facilityId,
  courtId,
  dateISO,
  start,
  end
}) => {
  const [offeredPrice, setOfferedPrice] = useState(originalPrice);
  const [priceStats, setPriceStats] = useState<PriceStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Minimum price (50% of original price)
  const minPrice = Math.floor(originalPrice * 0.5);
  
  // Calculate discount percentage
  const discountPercentage = Math.round(((originalPrice - offeredPrice) / originalPrice) * 100);
  
  // Fetch price statistics for this facility
  useEffect(() => {
    const fetchPriceStats = async () => {
      if (!facilityId || !isOpen) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const response = await http.get(`/offers/stats/${facilityId}`);
        setPriceStats(response.data);
      } catch (error) {
        console.error('Error fetching price statistics:', error);
        setError('Failed to load price statistics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPriceStats();
  }, [facilityId, isOpen]);
  
  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOfferedPrice(Number(e.target.value));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(offeredPrice);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bargain Price</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Original Price:</span>
              <span className="font-semibold">₹{originalPrice}</span>
            </div>
            
            <div className="flex justify-between mb-4">
              <span className="text-blue-600">Your Offer:</span>
              <span className="font-semibold text-blue-600">₹{offeredPrice} ({discountPercentage}% off)</span>
            </div>
            
            <div className="mb-6">
              <input
                type="range"
                min={minPrice}
                max={originalPrice}
                value={offeredPrice}
                onChange={handleSliderChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>₹{minPrice}</span>
                <span>₹{originalPrice}</span>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading price statistics...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 text-sm mb-4">{error}</div>
          ) : priceStats && priceStats.count > 0 ? (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-blue-800 mb-2">Accepted Price Statistics</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Average Discount:</span> <span className="font-medium">{priceStats.averageDiscount.toFixed(1)}%</span></p>
                <p><span className="text-gray-600">Discount Range:</span> <span className="font-medium">{priceStats.minDiscount.toFixed(1)}% - {priceStats.maxDiscount.toFixed(1)}%</span></p>
                <p><span className="text-gray-600">Successful Bargains:</span> <span className="font-medium">{priceStats.count}</span></p>
              </div>
              
              {priceStats.acceptedPrices.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-blue-700 mb-1">Recent accepted prices:</p>
                  <div className="flex flex-wrap gap-1">
                    {priceStats.acceptedPrices.slice(0, 5).map((price, index) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        ₹{price.acceptedPrice} ({price.discountPercentage.toFixed(1)}% off)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg mb-4 text-sm text-gray-600">
              <p>No bargaining history available for this facility.</p>
              <p className="mt-1">Be the first to negotiate a better price!</p>
            </div>
          )}
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Submit Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BargainModal;