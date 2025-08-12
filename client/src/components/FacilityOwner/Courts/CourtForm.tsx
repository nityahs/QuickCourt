import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { facilityOwnerAPI, facilityOwnerCourtAPI } from '../../../services/facilityOwner';

interface Facility {
  _id: string;
  name: string;
}

interface Court {
  _id?: string;
  name: string;
  sport: string;
  pricePerHour: number;
  facilityId: string;
  status?: string;
  operatingHours?: {
    start: string;
    end: string;
  };
}

interface CourtFormProps {
  court?: Court | null;
  onSave: (court: Court) => void;
  onCancel: () => void;
}

const CourtForm: React.FC<CourtFormProps> = ({ court, onSave, onCancel }) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Court>({
    name: '',
    sport: '',
    pricePerHour: 0,
    facilityId: '',
    status: 'active',
    operatingHours: {
      start: '06:00',
      end: '22:00'
    }
  });

  // Fetch facilities for dropdown
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await facilityOwnerAPI.getOwnerFacilities();
        // Filter to only show approved facilities
        const approvedFacilities = response.data.filter(facility => facility.status === 'approved');
        setFacilities(approvedFacilities);
        
        console.log('All facilities:', response.data);
        console.log('Approved facilities:', approvedFacilities);
        
        // Set default facility if available
        if (approvedFacilities.length > 0 && !formData.facilityId) {
          setFormData(prev => ({
            ...prev,
            facilityId: approvedFacilities[0]._id
          }));
        }
      } catch (err: any) {
        console.error('Error fetching facilities:', err);
        setError('Failed to load facilities');
      }
    };
    
    fetchFacilities();
  }, []);

  // Set form data if editing an existing court
  useEffect(() => {
    if (court) {
      setFormData({
        ...court,
        operatingHours: court.operatingHours || { start: '06:00', end: '22:00' }
      });
    }
  }, [court]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'start' || name === 'end') {
      setFormData({
        ...formData,
        operatingHours: {
          ...formData.operatingHours!,
          [name]: value
        }
      });
    } else if (name === 'pricePerHour') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.sport || !formData.facilityId) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Convert operatingHours from start/end to open/close format for server compatibility
      const dataToSend = {
        ...formData,
        operatingHours: formData.operatingHours ? {
          open: formData.operatingHours.start,
          close: formData.operatingHours.end
        } : undefined
      };
      
      let savedCourt;
      
      if (court?._id) {
        // Update existing court
        const response = await facilityOwnerCourtAPI.updateCourt(court._id, dataToSend);
        savedCourt = response.data;
      } else {
        // Create new court
        const response = await facilityOwnerCourtAPI.createCourt(dataToSend);
        savedCourt = response.data;
      }
      
      // Convert back from open/close to start/end format for client compatibility
      if (savedCourt.operatingHours) {
        savedCourt.operatingHours = {
          start: savedCourt.operatingHours.open || savedCourt.operatingHours.start,
          end: savedCourt.operatingHours.close || savedCourt.operatingHours.end
        };
      }
      
      onSave(savedCourt);
      
      // Force page refresh after successful court creation
      window.location.reload();
    } catch (err: any) {
      console.error('Error saving court:', err);
      // Check if we have data in the response despite the error
      if (err.response?.data?.data) {
        // Court was created successfully despite the error
        const savedCourt = err.response.data.data;
        
        // Convert back from open/close to start/end format for client compatibility
        if (savedCourt.operatingHours) {
          savedCourt.operatingHours = {
            start: savedCourt.operatingHours.open || savedCourt.operatingHours.start,
            end: savedCourt.operatingHours.close || savedCourt.operatingHours.end
          };
        }
        
        onSave(savedCourt);
        
        // Force page refresh after successful court creation even with error
        window.location.reload();
      } else {
        setError(err.response?.data?.error || 'Failed to save court');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {court?._id ? 'Edit Court' : 'Add New Court'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Court Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Court Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Sport Type */}
              <div>
                <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-1">
                  Sport Type *
                </label>
                <select
                  id="sport"
                  name="sport"
                  value={formData.sport}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Sport</option>
                  <option value="Tennis">Tennis</option>
                  <option value="Basketball">Basketball</option>
                  <option value="Football">Football</option>
                  <option value="Volleyball">Volleyball</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Swimming">Swimming</option>
                  <option value="Table Tennis">Table Tennis</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
        {/* Price Per Hour */}
              <div>
                <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700 mb-1">
          Price Per Hour (₹) *
                </label>
                <input
                  type="number"
                  id="pricePerHour"
                  name="pricePerHour"
                  value={formData.pricePerHour}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {/* Facility */}
              <div>
                <label htmlFor="facilityId" className="block text-sm font-medium text-gray-700 mb-1">
                  Facility *
                </label>
                {facilities.length === 0 ? (
                  <div>
                    <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200 mb-3">
                      No approved facilities available. Please create and get a facility approved before adding courts.
                    </div>
                    <a 
                      href="/facility-owner/facilities" 
                      className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Create New Facility
                    </a>
                  </div>
                ) : (
                  <select
                    id="facilityId"
                    name="facilityId"
                    value={formData.facilityId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Facility</option>
                    {facilities.map((facility) => (
                      <option key={facility._id} value={facility._id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {/* Operating Hours - Start */}
              <div>
                <label htmlFor="start" className="block text-sm font-medium text-gray-700 mb-1">
                  Opening Time
                </label>
                <input
                  type="time"
                  id="start"
                  name="start"
                  value={formData.operatingHours?.start}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Operating Hours - End */}
              <div>
                <label htmlFor="end" className="block text-sm font-medium text-gray-700 mb-1">
                  Closing Time
                </label>
                <input
                  type="time"
                  id="end"
                  name="end"
                  value={formData.operatingHours?.end}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Court</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CourtForm;