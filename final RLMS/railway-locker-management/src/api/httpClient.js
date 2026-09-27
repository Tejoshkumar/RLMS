// src/api/httpClient.js
// Central HTTP client used by all API modules.
// Reads the base URL from VITE_API_URL (defined in .env).
// Provides a `request` helper that automatically sets JSON headers
// and optionally attaches the JWT from localStorage.

const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5000";

// The key used by AuthStore to persist the JWT.
const TOKEN_KEY = "railway-locker-management:token";

/**
 * Returns an object with Authorization header if a token is stored.
 */
function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Generic request helper.
 * @param {string} path   URL path beginning with "/api/..." (e.g. "/api/lockers")
 * @param {object} options Fetch options (method, body, headers, etc.)
 * @returns {Promise<object>} Parsed JSON response body.
 * @throws {Error} When the response is not ok – uses backend's `message` field if present.
 */
export async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...getAuthHeaders(),
    },
  });

  let body;
  try {
    body = await response.json();
  } catch (e) {
    throw new Error(`Server returned a non‑JSON response (status ${response.status}).`);
  }

  if (!response.ok) {
    const err = new Error(body?.message || `Request failed with status ${response.status}.`);
  err.status = response.status;
  throw err;
  }

  return body;
}

/**
 * Convenience wrapper for authenticated GET requests.
 */
export const authGet = (path) => request(path, { method: "GET" });

/**
 * Convenience wrapper for authenticated POST requests.
 */
export const authPost = (path, data) =>
  request(path, { method: "POST", body: JSON.stringify(data) });

/**
 * Convenience wrapper for authenticated PUT requests.
 */
export const authPut = (path, data) =>
  request(path, { method: "PUT", body: JSON.stringify(data) });

/**
 * Convenience wrapper for authenticated DELETE requests.
 */
export const authDelete = (path) => request(path, { method: "DELETE" });
