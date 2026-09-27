// src/api/bookingApi.js
import { authPost, authGet, authPut } from './httpClient.js';

export const createBooking = (data) => authPost('/api/bookings', data);
export const getMyBookings = () => authGet('/api/bookings/my');
export const getBooking = (id) => authGet(`/api/bookings/${id}`);
export const cancelBooking = (id) => authPut(`/api/bookings/${id}/cancel`);
