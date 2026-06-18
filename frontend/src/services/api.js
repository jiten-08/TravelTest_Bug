import axios from 'axios';
import { clearAuthSession, getAccessToken, getRefreshToken } from '../utils/authSession.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

function redirectToLogin() {
  const currentPath = `${window.location.pathname}${window.location.search}`;

  if (window.location.pathname !== '/login') {
    window.location.assign(`/login?session=expired&from=${encodeURIComponent(currentPath)}`);
  }
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const url = originalRequest.url || '';
    const isAuthEndpoint = url.includes('/token/');

    if (status !== 401 || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refresh = getRefreshToken();

    if (!refresh) {
      clearAuthSession();
      redirectToLogin();
      return Promise.reject(error);
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });
      const access = response.data?.access;

      if (!access) {
        throw new Error('Refresh response did not include an access token.');
      }

      const storage = localStorage.getItem('traveltest_user_session') ? localStorage : sessionStorage;
      storage.setItem('traveltest_access_token', access);
      originalRequest.headers = {
        ...(originalRequest.headers || {}),
        Authorization: `Bearer ${access}`,
      };

      return api(originalRequest);
    } catch (refreshError) {
      clearAuthSession();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  },
);

function unwrapList(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;

  if (!data) {
    return fallback;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (data.error) {
    return data.error;
  }

  const firstError = Object.values(data).flat().find(Boolean);
  return typeof firstError === 'string' ? firstError : fallback;
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getMetadataValue(metadata, keys, fallback) {
  if (!metadata) {
    return fallback;
  }

  const keyList = Array.isArray(keys) ? keys : [keys];
  const key = keyList.find((candidate) => metadata[candidate] !== undefined && metadata[candidate] !== null);
  return key ? metadata[key] : fallback;
}

export function normalizeFlight(flight) {
  const metadata = flight.metadata || {};

  return {
    ...flight,
    id: flight.id,
    referenceId: flight.reference_id,
    displayId: flight.reference_id || flight.id,
    flightNumber: flight.flight_number || '',
    departureTime: flight.departure_time || '',
    arrivalTime: flight.arrival_time || '',
    travelClass: flight.travel_class || '',
    price: toNumber(flight.price),
    duration: getMetadataValue(metadata, ['duration', 'durationText'], 'Direct'),
    seatsAvailable: toNumber(getMetadataValue(metadata, ['seatsAvailable', 'seats_available'], 24), 24),
    source: flight.source || '',
    destination: flight.destination || '',
  };
}

export function normalizeHotel(hotel) {
  const metadata = hotel.metadata || {};
  const image = getMetadataValue(metadata, ['image', 'imageUrl'], '');
  const rating = toNumber(getMetadataValue(metadata, 'rating', 4.4), 4.4);
  const inventories = hotel.inventories || [];
  const availableFromInventory = inventories.reduce((sum, item) => sum + toNumber(item.available), 0);

  return {
    ...hotel,
    id: hotel.id,
    referenceId: hotel.reference_id,
    displayId: hotel.reference_id || hotel.id,
    pricePerNight: toNumber(hotel.price_per_night),
    roomsAvailable: availableFromInventory || toNumber(hotel.rooms_available),
    roomTypes: (hotel.room_types || []).map((room) => ({
      ...room,
      id: room.code || room.id,
      backendId: room.id,
      hotelId: room.hotel,
      code: room.code,
      label: room.label,
      description: room.description || '',
      priceOffset: toNumber(room.price_offset),
      defaultAvailable: toNumber(room.default_available),
      available:
        inventories.find((inventory) => inventory.room_type === room.id || inventory.room_type_label === room.label)?.available ??
        room.default_available,
    })),
    inventories,
    image,
    rating,
    amenities: hotel.amenities || [],
    description: getMetadataValue(metadata, 'description', hotel.address || ''),
    address: hotel.address || '',
  };
}

export function normalizeBooking(booking) {
  const flight = booking.flight_detail
    ? normalizeFlight({
        id: booking.flight_detail.id,
        airline: booking.flight_detail.airline,
        flight_number: booking.flight_detail.flight_number,
        source: booking.flight_detail.source,
        destination: booking.flight_detail.destination,
        departure_time: booking.flight_detail.departure_time,
        arrival_time: booking.flight_detail.arrival_time,
        price: booking.flight_detail.price,
        travel_class: booking.search_details?.travelClass || booking.search_details?.travel_class,
      })
    : null;
  const hotel = booking.hotel_detail
    ? normalizeHotel({
        id: booking.hotel_detail.id,
        name: booking.hotel_detail.name,
        city: booking.hotel_detail.city,
        address: booking.hotel_detail.address,
        price_per_night: booking.hotel_detail.price_per_night,
        amenities: booking.hotel_detail.amenities || [],
      })
    : null;
  const bookingType = booking.booking_type;
  const item = bookingType === 'hotel' ? hotel : flight;

  return {
    ...booking,
    id: booking.booking_id || booking.id,
    backendId: booking.id,
    bookingId: booking.booking_id,
    bookingType,
    customerName: 'You',
    bookingDateTime: booking.booking_date_time || booking.created_at,
    travelDate:
      booking.search_details?.checkInDate ||
      booking.search_details?.departureDate ||
      booking.search_details?.check_in_date ||
      booking.search_details?.departure_date ||
      '',
    destination: bookingType === 'hotel' ? hotel?.city : flight?.destination,
    amountPaid: toNumber(booking.amount_paid),
    paymentStatus: booking.payment_status,
    bookingStatus: booking.booking_status,
    paymentMethod: booking.payment_method || 'payment',
    item,
    searchDetails: booking.search_details || {},
    travelerDetails: booking.search_details?.travelerDetails || [],
    selectedRoomTypeId: booking.selected_room_type,
    selectedRoomType: booking.selected_room_type_label || booking.selected_room_type,
    source: 'api',
  };
}

export const authApi = {
  login: (credentials) => api.post('/token/', credentials),
  register: (payload) => api.post('/users/', payload),
  forgotPassword: (payload) => api.post('/users/forgot_password/', payload),
  me: () => api.get('/users/me/'),
  updateProfile: (payload) => api.put('/users/update_profile/', payload),
};

export const flightsApi = {
  search: async (params) => {
    const response = await api.get('/flights/', { params });
    return unwrapList(response.data).map(normalizeFlight);
  },
  getById: async (flightId) => {
    const response = await api.get(`/flights/${flightId}/`);
    return normalizeFlight(response.data);
  },
};

export const hotelsApi = {
  search: async (params) => {
    const response = await api.get('/hotels/', { params });
    return unwrapList(response.data).map(normalizeHotel);
  },
  getById: async (hotelId) => {
    const response = await api.get(`/hotels/${hotelId}/`);
    return normalizeHotel(response.data);
  },
  roomTypes: async (hotelId) => {
    const response = await api.get(`/hotels/${hotelId}/room_types/`);
    return unwrapList(response.data);
  },
  inventory: async (hotelId) => {
    const response = await api.get(`/hotels/${hotelId}/inventory/`);
    return unwrapList(response.data);
  },
};

export const bookingsApi = {
  list: async () => {
    const response = await api.get('/bookings/');
    return unwrapList(response.data).map(normalizeBooking);
  },
  create: async (payload) => {
    const response = await api.post('/bookings/', payload);
    return normalizeBooking(response.data);
  },
  getById: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}/`);
    return normalizeBooking(response.data);
  },
  cancel: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/cancel/`);
    return normalizeBooking(response.data);
  },
  bookedSeats: async (flightId, departureDate) => {
    const params = { flight: flightId };

    if (departureDate) {
      params.departure_date = departureDate;
    }

    const response = await api.get('/bookings/booked_seats/', { params });
    return response.data?.seat_numbers || [];
  },
};

export default api;
