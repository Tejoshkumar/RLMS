import { createContext, useContext, useEffect, useMemo, useState } from 'react'

// NOTE: This is a client-only demo auth system — users and passwords are
// stored in plain form in localStorage. There is no backend, so this is
// not secure and should be replaced with real authentication (hashed
// passwords, server-issued sessions/tokens, etc.) before handling real users.

const USERS_KEY = 'railway-locker-management:users'
const SESSION_KEY = 'railway-locker-management:currentUserId'

const PREDEFINED_ADMIN = {
  id: 'admin-seed',
  name: 'Station Admin',
  email: 'admin@railway.com',
  password: 'admin123',
  phone: '',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
}

const AuthContext = createContext(null)

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Make sure the predefined admin always exists, even if the saved
      // users list predates this account or was edited/cleared.
      if (!parsed.some((u) => u.email.toLowerCase() === PREDEFINED_ADMIN.email)) {
        parsed.push(PREDEFINED_ADMIN)
      }
      return parsed
    }
  } catch (err) {
    console.warn('Could not read saved users, starting fresh.', err)
  }
  return [PREDEFINED_ADMIN]
}

function genId() {
  return `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers)
  const [currentUserId, setCurrentUserId] = useState(() => localStorage.getItem(SESSION_KEY))

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(SESSION_KEY, currentUserId)
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }, [currentUserId])

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || null,
    [users, currentUserId]
  )

  const api = useMemo(() => {
    return {
      currentUser,

     register({ name, email, password, phone }) {
        const cleanEmail = email.trim().toLowerCase()
        if (!name.trim()) throw new Error('Enter your name.')
        if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw new Error('Enter a valid email address.')
        if (password.length < 6) throw new Error('Password must be at least 6 characters.')
        if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
          throw new Error('An account with that email already exists.')
        }

       const newUser = {
  id: genId(),
  name: name.trim(),
  email: cleanEmail,
  password,
  phone: '',
  role: 'user',
  createdAt: new Date().toISOString(),
}
        setUsers((prev) => [...prev, newUser])
        setCurrentUserId(newUser.id)
        return newUser
      },

      login({ email, password }) {
        const cleanEmail = email.trim().toLowerCase()
        const user = users.find((u) => u.email.toLowerCase() === cleanEmail)
        if (!user || user.password !== password) {
          throw new Error('Incorrect email or password.')
        }
        setCurrentUserId(user.id)
        return user
      },

      logout() {
        setCurrentUserId(null)
      },
      updateProfile({ name, email, phone }) {
  const cleanName = name.trim()
  const cleanEmail = email.trim().toLowerCase()

  if (!cleanName) {
    throw new Error('Name cannot be empty.')
  }

  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
    throw new Error('Enter a valid email address.')
  }

  const emailExists = users.some(
    (u) =>
      u.id !== currentUserId &&
      u.email.toLowerCase() === cleanEmail
  )

  if (emailExists) {
    throw new Error('Another account already uses this email.')
  }

  setUsers((prev) =>
    prev.map((user) =>
      user.id === currentUserId
        ? {
            ...user,
            name: cleanName,
            email: cleanEmail,
            phone: phone.trim(),
          }
        : user
    )
  )
},

changePassword({ currentPassword, newPassword }) {
  const user = users.find((u) => u.id === currentUserId)

  if (!user) {
    throw new Error('User account not found.')
  }

  if (user.password !== currentPassword) {
    throw new Error('Current password is incorrect.')
  }

  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters.')
  }

  setUsers((prev) =>
    prev.map((u) =>
      u.id === currentUserId
        ? {
            ...u,
            password: newPassword,
          }
        : u
    )
  )
},
    }
  }, [users, currentUser])

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
