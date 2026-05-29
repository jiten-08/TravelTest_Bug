import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('traveltest_access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authApi = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (payload) => api.post('/auth/register/', payload),
  forgotPassword: (payload) => api.post('/auth/forgot-password/', payload),
};

export const flightsApi = {
  search: (params) => api.get('/flights/', { params }),
  getById: (flightId) => api.get(`/flights/${flightId}/`),
};

export const hotelsApi = {
  search: (params) => api.get('/hotels/', { params }),
  getById: (hotelId) => api.get(`/hotels/${hotelId}/`),
};

export const bookingsApi = {
  list: () => api.get('/bookings/'),
  create: (payload) => api.post('/bookings/', payload),
  getById: (bookingId) => api.get(`/bookings/${bookingId}/`),
};

export const paymentsApi = {
  create: (payload) => api.post('/payments/', payload),
};

export default api;
