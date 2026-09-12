import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard.jsx'
import MyBookings from './pages/MyBookings.jsx'
import Admin from './pages/Admin.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import { useLockers } from './store/LockerStore.jsx'
import { useAuth } from './store/AuthStore.jsx'
import Profile from './pages/Profile.jsx'

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30)
    return () => clearInterval(t)
  }, [])
  return now
}

function AppShell() {
  const { lockers } = useLockers()
  const { currentUser, logout } = useAuth()
  const now = useClock()

  const counts = lockers.reduce(
    (acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1
      return acc
    },
    { available: 0, occupied: 0, reserved: 0, 'out-of-service': 0 }
  )

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">▣</span>
          <div>
            <div className="brand-title">Platform Lockers</div>
            <div className="brand-sub">Central Junction</div>
          </div>
        </div>
        <nav className="nav">
         
       {currentUser?.role !== 'admin' && (
  <>
    <NavLink
      to="/"
      className={({ isActive }) =>
        `nav-link${isActive ? ' active' : ''}`
      }
    >
      Book a Locker
    </NavLink>

    <NavLink
      to="/bookings"
      className={({ isActive }) =>
        `nav-link${isActive ? ' active' : ''}`
      }
    >
      My bookings
    </NavLink>

    <NavLink
      to="/profile"
      className={({ isActive }) =>
        `nav-link${isActive ? ' active' : ''}`
      }
    >
      Profile
    </NavLink>
  </>
)}
  

{currentUser?.role === 'admin' && (
  <NavLink
    to="/admin"
    className={({ isActive }) =>
      `nav-link${isActive ? ' active' : ''}`
    }
  >
    Admin
  </NavLink>
)}
          
         
        </nav>
        <div className="sidebar-foot">
          <div className="account-box">
            <div className="account-name">{currentUser?.name}</div>
            <div className="account-email">
              {currentUser?.email}{currentUser?.role === 'admin' ? ' · admin' : ''}
            </div>
            <button className="btn btn-ghost auth-logout" onClick={logout}>Log out</button>
          </div>
          <div className="legend">
            <div><span className="dot dot-available" /> Available</div>
            <div><span className="dot dot-reserved" /> Reserved</div>
            <div><span className="dot dot-occupied" /> Occupied</div>
            <div><span className="dot dot-oos" /> Out of service</div>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <h1>Locker availability</h1>
            <p className="topbar-sub">Real-time status across the station</p>
          </div>
          <div className="board">
            <div className="board-clock">
              {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="board-stats">
              <div className="board-stat">
                <span className="board-stat-num">{counts.available}</span>
                <span className="board-stat-label">Free</span>
              </div>
              <div className="board-stat">
                <span className="board-stat-num">{counts.reserved}</span>
                <span className="board-stat-label">Reserved</span>
              </div>
              <div className="board-stat">
                <span className="board-stat-num">{counts.occupied}</span>
                <span className="board-stat-label">In use</span>
              </div>
            </div>
          </div>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<Dashboard  currentUser={currentUser} />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/admin"
              element={currentUser?.role === 'admin' 
                ? <Admin />
                 : <Navigate to="/" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const { currentUser } = useAuth()
  const location = useLocation()

  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={currentUser ? <Navigate to="/" replace /> : <Register />}
      />
      <Route
        path="/*"
        element={
          currentUser ? (
            <AppShell />
          ) : (
            <Navigate to="/login" replace state={{ from: location.pathname }} />
          )
        }
      />
    </Routes>
  )
}
