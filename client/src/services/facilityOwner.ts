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
}

export const facilityOwnerAPI = {
  // Get dashboard statistics for a facility owner
  getDashboardStats: async (ownerId: string): Promise<FacilityOwnerStats> => {
    console.log('Calling API for dashboard stats with ownerId:', ownerId);
    try {
  // Switched to unified stats endpoint that already returns rich charts
  const response = await http.get(`/stats/facility-owner/${ownerId}`);
      console.log('Raw API response:', response);
      
      // For development or if API returns empty data, use mock data
      if (!response.data || Object.keys(response.data).length === 0) {
        console.log('Using mock data for dashboard');
        return getMockDashboardData();
      }
      
      // Transform API response to match expected interface
      const data = response.data;
      console.log('Transforming API response to match expected interface');
      
      // Create a transformed data object with the correct structure
      const transformedData: FacilityOwnerStats = {
        kpis: {
          totalBookings: 0,
          confirmedBookings: 0,
          cancelledBookings: 0,
          completedBookings: 0,
          totalEarnings: 0,
          activeCourts: 0,
          totalFacilities: 0
        },
        charts: {
          monthlyRevenue: [],
          dailyBookings: [],
          peakHours: [],
          sportDistribution: []
        },
        recentActivity: []
      };
      
      // kpis from stats endpoint already an object; if legacy array, convert
      if (Array.isArray(data.kpis)) {
        data.kpis.forEach((kpi: any) => {
          const label = (kpi.label || '').toLowerCase();
          if (label.includes('total booking') || label.includes('upcoming')) transformedData.kpis.totalBookings = kpi.value;
          if (label.includes('revenue') || label.includes('earning')) transformedData.kpis.totalEarnings = kpi.value;
          if (label.includes('facilit')) transformedData.kpis.totalFacilities = kpi.value;
          if (label.includes('court')) transformedData.kpis.activeCourts = kpi.value;
        });
      } else if (data.kpis && typeof data.kpis === 'object') {
        const k = data.kpis;
        const computedTotalBookings = k.totalBookings != null
          ? k.totalBookings
          : ((k.confirmedBookings ?? 0) + (k.cancelledBookings ?? 0) + (k.completedBookings ?? 0));
        transformedData.kpis = {
          totalBookings: computedTotalBookings,
          confirmedBookings: k.confirmedBookings ?? 0,
          cancelledBookings: k.cancelledBookings ?? 0,
          completedBookings: k.completedBookings ?? 0,
          totalEarnings: k.totalEarnings ?? k.totalRevenue ?? 0,
          activeCourts: k.activeCourts ?? k.courts ?? 0,
          totalFacilities: k.totalFacilities ?? k.facilities ?? 0
        } as any;
      }
      
      // Transform recentActivity data if needed
      if (Array.isArray(data.recentActivity)) {
        // Check if we need to transform the format
        if (data.recentActivity.length > 0 && data.recentActivity[0].id && !data.recentActivity[0]._id) {
          console.log('Transforming recentActivity data format');
          transformedData.recentActivity = data.recentActivity.map((activity: any) => ({
            _id: activity.id,
            status: activity.status,
            price: activity.amount || 0,
            start: activity.time ? activity.time.split('-')[0] : '',
            end: activity.time ? activity.time.split('-')[1] : '',
            dateISO: activity.date || '',
            createdAt: activity.createdAt,
            user: { name: activity.user?.name || '' },
            court: { name: activity.court?.name || '' },
            facility: { name: activity.facility?.name || '' }
          }));
        } else {
          transformedData.recentActivity = data.recentActivity;
        }
      }
      
      // Transform charts data
      if (data.charts) {
        console.log('Transforming charts data');
        
        // Transform bookingsByDay to dailyBookings if needed
        // Map legacy bookingsByDay -> dailyBookings
        if (data.charts.bookingsByDay && !data.charts.dailyBookings) {
          transformedData.charts.dailyBookings = data.charts.bookingsByDay.map((item: any) => ({
            _id: item.date || item._id,
            count: item.count ?? 0,
            revenue: item.revenue || 0
          }));
        }
        if (data.charts.dailyBookings) transformedData.charts.dailyBookings = data.charts.dailyBookings;
        
        // Use other chart data if available
        if (data.charts.monthlyRevenue) transformedData.charts.monthlyRevenue = data.charts.monthlyRevenue.map((m: any) => ({
          _id: m._id,
          revenue: m.revenue ?? m.total ?? 0,
          count: m.count ?? 0
        }));
        if (data.charts.peakHours) transformedData.charts.peakHours = data.charts.peakHours;
        if (data.charts.sportDistribution) transformedData.charts.sportDistribution = data.charts.sportDistribution;
      }
      
      console.log('Transformed data:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('API error in getDashboardStats:', error);
      // Return mock data on error for development
      return getMockDashboardData();
    }
  },

  // Get all facilities for an owner
  getOwnerFacilities: async (): Promise<{ data: any[] }> => {
    const res = await http.get('/facility-owner/facilities');
    // Unwrap nested data returned by the API { data: facilities }
    return { data: res.data?.data ?? [] };
  },

  // Create a new facility
  createFacility: async (data: any): Promise<{ data: any }> => {
    const res = await http.post('/facility-owner/facilities', data);
    return { data: res.data?.data };
  },

  // Update an existing facility
  updateFacility: async (facilityId: string, data: any): Promise<{ data: any }> => {
    const res = await http.put(`/facility-owner/facilities/${facilityId}`, data);
    return { data: res.data?.data };
  },

  // Delete a facility
  deleteFacility: async (facilityId: string): Promise<{ success: boolean; message?: string }> => {
    const res = await http.delete(`/facility-owner/facilities/${facilityId}`);
    return { success: !!res.data?.success, message: res.data?.message };
  },

  // Get all courts for an owner's facilities
  getOwnerCourts: async (): Promise<{ data: any[] }> => {
    const res = await http.get('/facility-owner/courts');
    return { data: res.data?.data ?? [] };
  },

  // Convenience proxies for availability & slot blocking (used by TimeSlots UI)
  getAvailability: (courtId: string, date: string): Promise<{ data: any[] }> => {
    return http.get('/facility-owner/availability', { params: { courtId, date } });
  },
  blockSlot: (data: { courtId: string; dateISO: string; start: string; end: string; isBlocked: boolean }): Promise<{ data: any; message: string }> => {
    return http.post('/facility-owner/block-slot', data);
  }
};

// Mock data function for development
function getMockDashboardData(): FacilityOwnerStats {
  return {
    kpis: {
      totalBookings: 124,
      confirmedBookings: 85,
      cancelledBookings: 12,
      completedBookings: 27,
      totalEarnings: 8750,
      activeCourts: 8,
      totalFacilities: 3
    },
    charts: {
      monthlyRevenue: [
        { _id: '2023-01', revenue: 5200, count: 42 },
        { _id: '2023-02', revenue: 6100, count: 51 },
        { _id: '2023-03', revenue: 7300, count: 63 },
        { _id: '2023-04', revenue: 8200, count: 72 },
        { _id: '2023-05', revenue: 7800, count: 68 },
        { _id: '2023-06', revenue: 8750, count: 75 }
      ],
      dailyBookings: [
        { _id: '2023-06-01', count: 5, revenue: 550 },
        { _id: '2023-06-02', count: 7, revenue: 770 },
        { _id: '2023-06-03', count: 3, revenue: 330 },
        { _id: '2023-06-04', count: 8, revenue: 880 },
        { _id: '2023-06-05', count: 12, revenue: 1320 },
        { _id: '2023-06-06', count: 10, revenue: 1100 },
        { _id: '2023-06-07', count: 6, revenue: 660 }
      ],
      peakHours: [
        { _id: '08:00', count: 15 },
        { _id: '10:00', count: 22 },
        { _id: '12:00', count: 18 },
        { _id: '14:00', count: 25 },
        { _id: '16:00', count: 30 },
        { _id: '18:00', count: 35 },
        { _id: '20:00', count: 20 }
      ],
      sportDistribution: [
        { _id: 'Tennis', count: 45 },
        { _id: 'Basketball', count: 30 },
        { _id: 'Soccer', count: 25 },
        { _id: 'Volleyball', count: 15 },
        { _id: 'Badminton', count: 10 }
      ]
    },
    recentActivity: [
      {
        _id: '1',
        status: 'confirmed',
        price: 45,
        start: '14:00',
        end: '15:00',
        dateISO: '2023-06-07',
        createdAt: '2023-06-05T10:30:00Z',
        user: { name: 'John Smith' },
        court: { name: 'Court 1' },
        facility: { name: 'Downtown Sports Center' }
      },
      {
        _id: '2',
        status: 'pending',
        price: 35,
        start: '09:00',
        end: '10:00',
        dateISO: '2023-06-08',
        createdAt: '2023-06-05T09:15:00Z',
        user: { name: 'Sarah Johnson' },
        court: { name: 'Court 3' },
        facility: { name: 'Riverside Tennis Club' }
      },
      {
        _id: '3',
        status: 'confirmed',
        price: 50,
        start: '18:00',
        end: '19:00',
        dateISO: '2023-06-07',
        createdAt: '2023-06-04T16:45:00Z',
        user: { name: 'Michael Brown' },
        court: { name: 'Court 2' },
        facility: { name: 'Downtown Sports Center' }
      }
    ]
  };
}

// Add the rest of the API methods
export const facilityOwnerBookingAPI = {
  // Get all bookings for an owner's facilities
  getOwnerBookings: async (params?: any): Promise<{ data: any[]; total: number; page: number; limit: number; totalPages: number }> => {
    try {
      console.log('Calling API with params:', params);
      const response = await http.get('/facility-owner/bookings', { params });
      
      // Validate response structure
      if (!response || typeof response !== 'object') {
        console.error('Invalid API response format:', response);
        throw new Error('Invalid API response format');
      }
      
      // Check if response has data property
      if (!response.data && !Array.isArray(response)) {
        console.error('Missing data in API response:', response);
        return { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 20, totalPages: 0 };
      }
      
      // Handle both response formats (direct array or object with data property)
      const responseData = Array.isArray(response) ? response : response.data;
      const data = Array.isArray(responseData) ? responseData : 
                  (responseData && responseData.data && Array.isArray(responseData.data)) ? responseData.data : [];
      
      // Normalize response format
      return {
        data: data,
        total: responseData.total || data.length || 0,
        page: responseData.page || params?.page || 1,
        limit: responseData.limit || params?.limit || 20,
        totalPages: responseData.totalPages || Math.ceil((responseData.total || data.length) / (params?.limit || 20)) || 1
      };
    } catch (error) {
      console.error('Error in getOwnerBookings:', error);
      // Return a safe default response
      return { data: [], total: 0, page: params?.page || 1, limit: params?.limit || 20, totalPages: 0 };
    }
  },

  // Get availability for a specific court and date
  getAvailability: (courtId: string, date: string): Promise<{ data: any[] }> => {
    return http.get('/facility-owner/availability', { params: { courtId, date } });
  },

  // Block or unblock a time slot
  blockSlot: (data: { courtId: string; dateISO: string; start: string; end: string; isBlocked: boolean }): Promise<{ data: any; message: string }> => {
    return http.post('/facility-owner/block-slot', data);
  },

  // Update facility status
  updateFacility: (facilityId: string, data: any): Promise<{ data: any }> => {
    return http.put(`/facility-owner/facilities/${facilityId}`, data);
  }
};

// Court management API
export const facilityOwnerCourtAPI = {
  // Update court
  updateCourt: (courtId: string, data: any): Promise<{ data: any }> => {
    return http.put(`/facility-owner/courts/${courtId}`, data);
  },

  // Create new facility
  createFacility: (data: any): Promise<{ data: any }> => {
    return http.post('/facility-owner/facilities', data);
  },

  // Create a new court
  createCourt: (data: any): Promise<{ data: any }> => {
    return http.post('/facility-owner/courts', data);
  }
};

// Facility management API
export const facilityOwnerManagementAPI = {
  // Delete facility
  deleteFacility: (facilityId: string): Promise<{ success: boolean; message: string }> => {
    return http.delete(`/facility-owner/facilities/${facilityId}`);
  },
  
  // Delete court
  deleteCourt: (courtId: string): Promise<{ success: boolean; message: string }> => {
    return http.delete(`/facility-owner/courts/${courtId}`);
  }
};

// User profile API
export const facilityOwnerProfileAPI = {
  // Update user profile
  updateProfile: (data: any): Promise<{ data: any }> => {
    return http.put('/facility-owner/profile', data);
  },
  
  // Change password
  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> => {
    return http.post('/facility-owner/change-password', data);
  }
};

export default facilityOwnerAPI;
