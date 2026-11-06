import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { apiRegister, apiLogin, apiGetMe } from '../api/authApi.js'
import { updateUserPassword, updateUserProfile } from '../api/userApi.js'

// ---------------------------------------------------------------------------
// Storage key for the JWT — we never store plaintext passwords.
// ---------------------------------------------------------------------------
const TOKEN_KEY = 'railway-locker-management:token'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true) // true while we validate a stored token

  // -------------------------------------------------------------------------
  // On mount: if a JWT is stored, validate it with GET /api/auth/me.
  // If the token is invalid or expired, clear it and treat user as logged out.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }

    apiGetMe(token)
      .then((user) => setCurrentUser(user))
      .catch(() => {
        // Token invalid / expired — clear it silently
        localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => setLoading(false))
  }, [])

  // -------------------------------------------------------------------------
  // register — calls POST /api/auth/register
  // Note: backend does NOT return a token on register, so we navigate to login.
  // Throws on failure so Register.jsx can display the error.
  // -------------------------------------------------------------------------
  const register = useCallback(async ({ name, email, phone, password }) => {
    // Basic client-side validation (mirrors backend expectations)
    if (!name?.trim()) throw new Error('Enter your name.')
    if (password?.length < 6) throw new Error('Password must be at least 6 characters.')
    if (!phone?.trim()) throw new Error('Enter your phone number.')

    // apiRegister throws on error with the backend message
    const user = await apiRegister({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password })
    // Registration succeeded — return the user (caller navigates to /login)
    return user
  }, [])

  // -------------------------------------------------------------------------
  // login — calls POST /api/auth/login, stores JWT, sets currentUser
  // Throws on failure so Login.jsx can display the error.
  // -------------------------------------------------------------------------
  const login = useCallback(async ({ email, password }) => {
    const { user, token } = await apiLogin({ email: email.trim().toLowerCase(), password })
    localStorage.setItem(TOKEN_KEY, token)
    setCurrentUser(user)
    return user
  }, [])

  // -------------------------------------------------------------------------
  // logout — removes JWT and clears user state
  // -------------------------------------------------------------------------
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setCurrentUser(null)
  }, [])

  // -------------------------------------------------------------------------
  // getToken — utility so other stores/components can attach auth headers
  // -------------------------------------------------------------------------
  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), [])

  const updateProfile = useCallback(async (profile) => {
    const updatedUser = await updateUserProfile(profile)
    setCurrentUser((user) => ({ ...user, ...updatedUser }))
    return updatedUser
  }, [])

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    if (!currentPassword || !newPassword) {
      throw new Error('Please provide both current and new passwords.')
    }
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.')
    }

    return updateUserPassword({ currentPassword, newPassword })
  }, [])

  const value = {
    currentUser,
    loading,
    register,
    login,
    logout,
    getToken,
    updateProfile,
    changePassword,
  }

  // While we are validating a stored token, render nothing to avoid a flash
  // of the login page before the user is restored.
  if (loading) return null

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
