import { http } from './http';

export interface FacilityOwnerStats {
  kpis: {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    completedBookings: number;
    totalEarnings: number;
    activeCourts: number;
    totalFacilities: number;
  };
  charts: {
    monthlyRevenue: Array<{
      _id: string;
      revenue: number;
      count: number;
    }>;
    dailyBookings: Array<{
      _id: string;
      count: number;
      revenue: number;
    }>;
    peakHours: Array<{
      _id: string;
      count: number;
    }>;
    sportDistribution: Array<{
      _id: string;
      count: number;
    }>;
  };
  recentActivity: Array<{
    _id: string;
    status: string;
    price: number;
    start: string;
    end: string;
    dateISO: string;
    createdAt: string;
    user: {
      name: string;
    };
    court: {
      name: string;
    };
    facility: {
      name: string;
    };
  }>;
  facilities: Array<{
    id: string;
    name: string;
    status: string;
    sports: string[];
    ratingAvg: number;
    ratingCount: number;
  }>;
  courts: Array<{
    id: string;
    name: string;
    sport: string;
    pricePerHour: number;
    isActive: boolean;
    facilityId: string;
  }>;
}

export const facilityOwnerAPI = {
  // Get dashboard statistics for a facility owner
  getDashboardStats: (ownerId: string): Promise<{ data: FacilityOwnerStats }> => {
    return http.get(`/stats/facility-owner/${ownerId}`);
  },

  // Get all facilities for an owner
  getOwnerFacilities: (ownerId: string): Promise<{ data: any[] }> => {
    return http.get(`/facilities?ownerId=${ownerId}&includeAll=true`);
  },

  // Get all courts for an owner's facilities
  getOwnerCourts: (facilityIds: string[]): Promise<{ data: any[] }> => {
    const facilityIdsParam = facilityIds.join(',');
    return http.get(`/courts?facilityIds=${facilityIdsParam}`);
  },

  // Get all bookings for an owner's facilities
  getOwnerBookings: (facilityIds: string[], params?: any): Promise<{ data: any[] }> => {
    const facilityIdsParam = facilityIds.join(',');
    return http.get(`/bookings?facilityIds=${facilityIdsParam}`, { params });
  },

  // Update facility status
  updateFacility: (facilityId: string, data: any): Promise<{ data: any }> => {
    return http.put(`/facilities/${facilityId}`, data);
  },

  // Update court
  updateCourt: (courtId: string, data: any): Promise<{ data: any }> => {
    return http.put(`/courts/${courtId}`, data);
  },

  // Create new facility
  createFacility: (data: any): Promise<{ data: any }> => {
    return http.post('/facilities', data);
  },

  // Create new court
  createCourt: (data: any): Promise<{ data: any }> => {
    return http.post('/courts', data);
  }
};

export default facilityOwnerAPI;
