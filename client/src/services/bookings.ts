import { http } from './http';

export interface UserBooking {
  _id: string;
  facilityId?: string;
  courtId?: string;
  dateISO: string;
  start: string;
  end: string;
  price: number;
  status: string;
  createdAt: string;
  payment?: {
    method?: string;
    status?: string;
    amount?: number;
  };
}

export const bookingsAPI = {
  getMyBookings: async (): Promise<UserBooking[]> => {
    const res = await http.get('/bookings/me');
    return Array.isArray(res.data) ? res.data : [];
  }
};

export default bookingsAPI;
