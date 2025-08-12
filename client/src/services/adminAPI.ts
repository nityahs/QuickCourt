import { http } from './http';

// Define interfaces for admin API responses
export interface AdminStats {
  totalUsers: number;
  totalOwners: number;
  totalFacilities: number;
  totalBookings: number;
  activeCourts: number;
  facilityTrends: Array<{
    _id: string;
    count: number;
  }>;
}

export interface AdminFacility {
  _id: string;
  name: string;
  description: string;
  address: string;
  geolocation: {
    lat: number;
    lng: number;
  };
  sports: string[];
  startingPricePerHour: number;
  ratingAvg: number;
  ratingCount: number;
  photos: string[];
  amenities: string[];
  status: 'pending' | 'approved' | 'rejected';
  ownerId: string;
  ownerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'facility_owner' | 'admin';
  isVerified: boolean;
  banned?: boolean;
  avatar?: string;
  createdAt?: string;
}

export interface AdminBooking {
  id: string;
  venueName: string;
  courtName: string;
  date: string;
  startTime: string;
  duration: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  userId?: string;
  userName?: string;
}

// Admin API service
export const adminAPI = {
  // Get dashboard statistics for admin
  getDashboardStats: async (): Promise<AdminStats> => {
    try {
      const response = await http.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  },

  // Get pending facilities for approval
  getPendingFacilities: async (): Promise<AdminFacility[]> => {
    try {
      const response = await http.get('/admin/facilities/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending facilities:', error);
      throw error;
    }
  },

  // Get all facilities
  getAllFacilities: async (): Promise<AdminFacility[]> => {
    try {
      const response = await http.get('/admin/facilities');
      return response.data;
    } catch (error) {
      console.error('Error fetching all facilities:', error);
      throw error;
    }
  },

  // Approve or reject a facility
  updateFacilityStatus: async (facilityId: string, decision: 'approve' | 'reject'): Promise<AdminFacility> => {
    try {
      const response = await http.put(`/admin/facilities/${facilityId}/${decision}`);
      return response.data;
    } catch (error) {
      console.error(`Error ${decision}ing facility:`, error);
      throw error;
    }
  },

  // Get all users
  getUsers: async (): Promise<AdminUser[]> => {
    try {
      const response = await http.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Ban or unban a user
  updateUserStatus: async (userId: string, action: 'ban' | 'unban'): Promise<AdminUser> => {
    try {
      const response = await http.put(`/admin/users/${userId}/${action}`);
      return response.data;
    } catch (error) {
      console.error(`Error ${action}ning user:`, error);
      throw error;
    }
  },

  // Get bookings for a specific user
  getUserBookings: async (userId: string): Promise<AdminBooking[]> => {
    try {
      const response = await http.get(`/admin/users/${userId}/bookings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  }
};

export default adminAPI;