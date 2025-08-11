import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import api from '../../services/facilities';
import { Venue } from '../../types';

interface PendingFacility extends Venue {
  ownerName?: string;
}

const FacilityApproval: React.FC = () => {
  const [pendingFacilities, setPendingFacilities] = useState<PendingFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<PendingFacility | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    const fetchPendingFacilities = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/facilities/pending');
        setPendingFacilities(response.data);
      } catch (error) {
        console.error('Error fetching pending facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingFacilities();
  }, []);

  const handleViewDetails = (facility: PendingFacility) => {
    setSelectedFacility(facility);
    setShowModal(true);
  };

  const handleApprove = async (facilityId: string) => {
    try {
      await api.put(`/admin/facilities/${facilityId}/approve`);
      setPendingFacilities(pendingFacilities.filter(f => f.id !== facilityId));
      setShowModal(false);
    } catch (error) {
      console.error('Error approving facility:', error);
    }
  };

  const handleReject = async (facilityId: string) => {
    try {
      await api.put(`/admin/facilities/${facilityId}/reject`, { reason: rejectReason });
      setPendingFacilities(pendingFacilities.filter(f => f.id !== facilityId));
      setShowRejectModal(false);
      setShowModal(false);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting facility:', error);
    }
  };

  const openRejectModal = () => {
    setShowRejectModal(true);
  };

  return (
    <AdminLayout currentPage="facility approval">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Pending Facility Approvals</h2>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingFacilities.length} Pending
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
        ) : pendingFacilities.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No pending facilities to approve</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facility Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sport Types
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingFacilities.map((facility) => (
                  <tr key={facility.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{facility.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{facility.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {facility.sportTypes.map((sport, index) => (
                          <span key={index} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {sport}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{facility.ownerName || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(facility)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleApprove(facility.id)}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedFacility(facility);
                          openRejectModal();
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Facility Details Modal */}
        {showModal && selectedFacility && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">{selectedFacility.name}</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-1">Description</h4>
                      <p className="text-gray-600">{selectedFacility.description}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-1">Address</h4>
                      <p className="text-gray-600">{selectedFacility.address}</p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-1">Sport Types</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedFacility.sportTypes.map((sport, index) => (
                          <span key={index} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {sport}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-1">Amenities</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedFacility.amenities.map((amenity, index) => (
                          <span key={index} className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-1">Operating Hours</h4>
                      <p className="text-gray-600">
                        {selectedFacility.operatingHours.start} - {selectedFacility.operatingHours.end}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-1">Starting Price</h4>
                      <p className="text-gray-600">₹{selectedFacility.startingPrice}/hour</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Facility Images</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedFacility.images.map((image, index) => (
                        <div key={index} className="rounded-lg overflow-hidden h-40 bg-gray-200">
                          <img src={image} alt={`Facility ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    <h4 className="font-semibold text-gray-700 mt-4 mb-2">Courts</h4>
                    <div className="space-y-2">
                      {selectedFacility.courts.map((court) => (
                        <div key={court.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between">
                            <span className="font-medium">{court.name}</span>
                            <span className="text-gray-600">₹{court.pricePerHour}/hour</span>
                          </div>
                          <div className="text-sm text-gray-500">{court.sportType}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={openRejectModal}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(selectedFacility.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Reason Modal */}
        {showRejectModal && selectedFacility && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold mb-4">Reject Facility</h3>
              <p className="mb-4 text-gray-600">Please provide a reason for rejecting this facility:</p>
              
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
                placeholder="Enter rejection reason..."
              />
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(selectedFacility.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={!rejectReason.trim()}
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default FacilityApproval;