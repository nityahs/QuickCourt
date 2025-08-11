import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const facilitiesAPI = {
  getAll: (params?: any) => api.get('/facilities', { params }),
  getById: (id: string) => api.get(`/facilities/${id}`),
};

export default api;
