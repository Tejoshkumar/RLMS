// src/api/lockerApi.js
import { authGet } from './httpClient.js';
// Wrapper for locker related backend endpoints.


/**
 * Fetch all lockers.
 * GET /api/lockers
 * @returns {Promise<Array>} array of locker objects
 */
export const getLockers = async () => {
  const response = await authGet('/api/lockers');
  return response.data; // backend returns { data: lockers }
};

/**
 * Fetch availability for a specific locker.
 * GET /api/lockers/:id/availability?date=YYYY-MM-DD&startTime=HH:mm&endTime=HH:mm
 * @param {string} lockerId
 * @param {object} params - { date, startTime, endTime }
 * @returns {Promise<object>} availability info
 */
export const getAvailability = async (lockerId, params) => {
  const query = new URLSearchParams(params).toString();
  const response = await authGet(`/api/lockers/${lockerId}/availability?${query}`);
  return response.data; // { available: true/false, conflict?: {...} }
};
