import http from './http';

export const adminAPI = {
  // Get admin dashboard statistics
  getStats: () => http.get('/stats/admin'),
  
  // Get pending facilities
  getPendingFacilities: () => http.get('/admin/facilities/pending'),
  
  // Approve or reject a facility
  updateFacilityStatus: (facilityId: string, decision: 'approve' | 'reject') => 
    http.put(`/admin/facilities/${facilityId}/${decision}`),
  
  // Get all users
  getUsers: () => http.get('/admin/users'),
  
  // Ban or unban a user
  updateUserStatus: (userId: string, action: 'ban' | 'unban') => 
    http.put(`/admin/users/${userId}/${action}`),
    
  // Get bookings for a specific user
  getUserBookings: (userId: string) => http.get(`/admin/users/${userId}/bookings`),
};

export default adminAPI;