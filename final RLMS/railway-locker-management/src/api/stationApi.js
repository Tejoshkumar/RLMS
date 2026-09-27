// src/api/stationApi.js
// Wrapper for station related backend endpoints.
import { authGet } from './httpClient.js';

/**
 * Fetch all stations.
 * GET /api/stations
 * @returns {Promise<Array>} array of station objects
 */
export const getStations = async () => {
  const response = await authGet('/api/stations');
  return response.data; // backend returns { data: stations }
};
