/**
 * authApi.js
 * Low-level wrappers around the RLMS backend auth endpoints.
 * Base URL is read from the Vite environment variable VITE_API_URL.
 *
 * All functions throw an Error with a user-friendly message on failure
 * so callers can display it directly.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/**
 * Internal helper – sends JSON to the backend and either returns the
 * parsed response body or throws a descriptive Error.
 *
 * @param {string} path      - e.g. '/api/auth/login'
 * @param {object} options   - standard fetch options
 * @returns {Promise<object>} - the parsed JSON body
 */
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  // Parse body regardless of status so we can surface backend messages
  let body
  try {
    body = await response.json()
  } catch {
    throw new Error(`Server returned a non-JSON response (status ${response.status}).`)
  }

  if (!response.ok) {
    // Use the backend message when available, otherwise fall back to HTTP status
    throw new Error(body?.message || `Request failed with status ${response.status}.`)
  }

  return body
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

/**
 * Register a new user.
 *
 * POST /api/auth/register
 * Body: { name, email, phone, password }
 *
 * Returns the created user's public fields (NO token on register per backend).
 * Backend response shape: { success, message, data: { _id, name, email, phone, role } }
 */
export async function apiRegister({ name, email, phone, password }) {
  const body = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, phone, password }),
  })
  // body.data contains the user object; no token is returned by register
  return body.data
}

/**
 * Login an existing user.
 *
 * POST /api/auth/login
 * Body: { email, password }
 *
 * Backend response shape: { success, message, data: { _id, name, email, phone, role, token } }
 * Returns { user, token } where user is the data object minus the token.
 */
export async function apiLogin({ email, password }) {
  const body = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  const { token, ...user } = body.data
  return { user, token }
}

/**
 * Fetch the currently authenticated user using a stored JWT.
 *
 * GET /api/auth/me
 * Authorization: Bearer <token>
 *
 * Backend response shape: { success, message, data: { _id, name, email, phone, role, ... } }
 * Returns the user data object.
 */
export async function apiGetMe(token) {
  const body = await request('/api/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return body.data
}
