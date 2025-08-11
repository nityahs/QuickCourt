import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const reviewsAPI = {
  getByFacility: (facilityId: string, params?: { page?: number; limit?: number }) =>
    api.get(`/reviews/facility/${facilityId}`, { params }),
};

export default api;
