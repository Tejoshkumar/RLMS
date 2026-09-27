import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../store/AuthStore.jsx'
import { useLockers } from '../store/LockerStore.jsx'
import { STATIONS, ZONES, SIZES } from '../data/mockData.js'

export default function Admin() {
  const { currentUser } = useAuth()

  const {
    lockers,
    bookings,
    addLocker,
    removeLocker,
    toggleOutOfService,
  } = useLockers()

  const [users, setUsers] = useState([])

  const [newLocker, setNewLocker] = useState({
    code: '',
    stationId: STATIONS[0]?.id || '',
    zone: ZONES[0] || '',
    size: SIZES[0] || '',
  })

  // --------------------------------------------------
  // NORMALIZE DATA
  // --------------------------------------------------

  // Backend/API responses can sometimes be:
  // []
  // { data: [] }
  // { data: { bookings: [] } }
  //
  // Always convert them into arrays before using
  // .filter(), .map(), .length, etc.

  const bookingList = Array.isArray(bookings)
    ? bookings
    : Array.isArray(bookings?.data)
      ? bookings.data
      : Array.isArray(bookings?.data?.bookings)
        ? bookings.data.bookings
        : []

  const lockerList = Array.isArray(lockers)
    ? lockers
    : Array.isArray(lockers?.data)
      ? lockers.data
      : []

  const userList = Array.isArray(users) ? users : []

  // --------------------------------------------------
  // LOAD USERS
  // --------------------------------------------------

  useEffect(() => {
    try {
      const storedUsers = JSON.parse(
        localStorage.getItem(
          'railway-locker-management:users'
        ) || '[]'
      )

      setUsers(Array.isArray(storedUsers) ? storedUsers : [])
    } catch {
      setUsers([])
    }
  }, [])

  // --------------------------------------------------
  // AUTH PROTECTION
  // --------------------------------------------------

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  if (currentUser.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  // --------------------------------------------------
  // ADD LOCKER
  // --------------------------------------------------

  function handleAddLocker(e) {
    e.preventDefault()

    const code = newLocker.code.trim()

    if (!code) {
      alert('Please enter locker number.')
      return
    }

    const alreadyExists = lockerList.some(
      (locker) =>
        String(locker.code || locker.id || locker._id)
          .toLowerCase() === code.toLowerCase()
    )

    if (alreadyExists) {
      alert('Locker number already exists.')
      return
    }

    const station = STATIONS.find(
      (station) =>
        String(station.id) ===
        String(newLocker.stationId)
    )

    if (!station) {
      alert('Please select a valid railway station.')
      return
    }

    const prices = {
      Small: 30,
      Medium: 50,
      Large: 80,
    }

    const locker = {
      id: crypto.randomUUID(),
      code,
      stationId: newLocker.stationId,
      station: station.name,
      zone: newLocker.zone,
      size: newLocker.size,
      pricePerBlock: prices[newLocker.size] || 50,
      status: 'available',
      outOfService: false,
    }

    addLocker(locker)

    setNewLocker({
      code: '',
      stationId: newLocker.stationId,
      zone: newLocker.zone,
      size: newLocker.size,
    })

    alert('Locker added successfully.')
  }

  // --------------------------------------------------
  // REMOVE LOCKER
  // --------------------------------------------------

  function handleRemoveLocker(locker) {
    const lockerId = locker.id || locker._id

    const activeBooking = bookingList.some(
      (booking) => {
        const bookingLockerId =
          booking.lockerId ||
          booking.locker?._id ||
          booking.locker?.id

        return (
          String(bookingLockerId) ===
          String(lockerId) &&
          booking.status !== 'cancelled' &&
          booking.status !== 'released'
        )
      }
    )

    if (activeBooking) {
      alert(
        'This locker has an active booking and cannot be removed.'
      )
      return
    }

    const confirmRemove = window.confirm(
      `Are you sure you want to remove locker ${locker.code || locker.id || locker._id
      }?`
    )

    if (!confirmRemove) return

    try {
      removeLocker(lockerId)
      alert('Locker removed successfully.')
    } catch (error) {
      alert(
        error?.message ||
        'Unable to remove locker.'
      )
    }
  }

  // --------------------------------------------------
  // LOCKER STATUS
  // --------------------------------------------------

  function handleToggleOutOfService(locker) {
    try {
      toggleOutOfService(locker.id || locker._id)
    } catch (error) {
      alert(
        error?.message ||
        'Unable to update locker status.'
      )
    }
  }

  // --------------------------------------------------
  // STATISTICS
  // --------------------------------------------------

  const totalLockers = lockerList.length

  const availableLockers = lockerList.filter(
    (locker) => locker.status === 'available'
  ).length

  const reservedLockers = lockerList.filter(
    (locker) => locker.status === 'reserved'
  ).length

  const occupiedLockers = lockerList.filter(
    (locker) => locker.status === 'occupied'
  ).length

  const outOfServiceLockers = lockerList.filter(
    (locker) =>
      locker.status === 'out-of-service' ||
      locker.status === 'out_of_service' ||
      locker.outOfService === true
  ).length

  const totalUsers = userList.length

  const totalBookings = bookingList.length

  const revenue = bookingList
    .filter(
      (booking) =>
        booking.status !== 'cancelled' &&
        booking.status !== 'released'
    )
    .reduce(
      (total, booking) =>
        total + Number(booking.price || 0),
      0
    )

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="admin-page">

      {/* HEADER */}

      <div className="page-heading">
        <div>
          <p className="eyebrow">
            ADMIN CONTROL CENTER
          </p>

          <h2>Admin Dashboard</h2>

          <p>
            Monitor lockers, users, bookings and
            revenue from one place.
          </p>
        </div>

        <div className="admin-badge">
          ADMIN
        </div>
      </div>

      {/* STATISTICS */}

      <div className="admin-stats">

        <div className="admin-stat-card">
          <span>Total Lockers</span>
          <strong>{totalLockers}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Available</span>
          <strong>{availableLockers}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Reserved</span>
          <strong>{reservedLockers}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Occupied</span>
          <strong>{occupiedLockers}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Out of Service</span>
          <strong>{outOfServiceLockers}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Total Users</span>
          <strong>{totalUsers}</strong>
        </div>

        <div className="admin-stat-card">
          <span>Total Bookings</span>
          <strong>{totalBookings}</strong>
        </div>

        <div className="admin-stat-card revenue-card">
          <span>Revenue</span>
          <strong>₹{revenue}</strong>
        </div>

      </div>

      {/* ALL USERS */}

      <section className="admin-section">

        <div className="admin-section-header">
          <div>
            <p className="eyebrow">
              USER MANAGEMENT
            </p>

            <h3>All Users</h3>
          </div>

          <span>
            {userList.length} users
          </span>
        </div>

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Created</th>
              </tr>
            </thead>

            <tbody>

              {userList.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="empty-table"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                userList.map((user) => (
                  <tr
                    key={
                      user.id ||
                      user._id ||
                      user.email
                    }
                  >

                    <td>
                      {user.name || '—'}
                    </td>

                    <td>
                      {user.email || '—'}
                    </td>

                    <td>
                      {user.phone || '—'}
                    </td>

                    <td>
                      <span
                        className={
                          user.role === 'admin'
                            ? 'admin-role'
                            : 'user-role'
                        }
                      >
                        {user.role || 'user'}
                      </span>
                    </td>

                    <td>
                      {user.createdAt
                        ? new Date(
                          user.createdAt
                        ).toLocaleDateString(
                          'en-IN'
                        )
                        : '—'}
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* ALL BOOKINGS */}

      <section className="admin-section">

        <div className="admin-section-header">
          <div>
            <p className="eyebrow">
              BOOKING MANAGEMENT
            </p>

            <h3>All Bookings</h3>
          </div>

          <span>
            {bookingList.length} bookings
          </span>
        </div>

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>Booking ID</th>
                <th>User</th>
                <th>Locker</th>
                <th>Station</th>
                <th>Zone</th>
                <th>Size</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {bookingList.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="empty-table"
                  >
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookingList.map((booking) => {

                  const bookingUserId =
                    booking.userId ||
                    booking.user?._id ||
                    booking.user?.id

                  const bookingLockerId =
                    booking.lockerId ||
                    booking.locker?._id ||
                    booking.locker?.id

                  const user = userList.find(
                    (u) =>
                      String(
                        u.id || u._id
                      ) ===
                      String(bookingUserId)
                  )

                  const locker = lockerList.find(
                    (l) =>
                      String(
                        l.id || l._id
                      ) ===
                      String(bookingLockerId)
                  )

                  const stationName =
                    booking.station?.name ||
                    booking.station ||
                    locker?.station ||
                    '—'

                  const zone =
                    booking.zone ||
                    booking.locker?.zone ||
                    locker?.zone ||
                    '—'

                  const size =
                    booking.size ||
                    booking.locker?.size ||
                    locker?.size ||
                    '—'

                  return (
                    <tr
                      key={
                        booking.id ||
                        booking._id
                      }
                    >

                      <td>
                        <strong>
                          {booking.id ||
                            booking._id ||
                            '—'}
                        </strong>
                      </td>

                      <td>
                        {booking.user?.name ||
                          user?.name ||
                          bookingUserId ||
                          '—'}
                      </td>

                      <td>
                        {booking.locker?.code ||
                          locker?.code ||
                          bookingLockerId ||
                          '—'}
                      </td>

                      <td>
                        {stationName}
                      </td>

                      <td>
                        {zone}
                      </td>

                      <td>
                        {size}
                      </td>

                      <td>
                        ₹{booking.price || 0}
                      </td>

                      <td>
                        <span
                          className={`booking-status status-${String(
                            booking.status || ''
                          )
                            .toLowerCase()
                            .replaceAll(
                              ' ',
                              '-'
                            )}`}
                        >
                          {booking.status ||
                            'unknown'}
                        </span>
                      </td>

                    </tr>
                  )
                })
              )}

            </tbody>

          </table>

        </div>

      </section>

      {/* ADD LOCKER */}

      <section className="admin-section">

        <div className="admin-section-header">
          <div>
            <div className="eyebrow">
              LOCKER MANAGEMENT
            </div>

            <h2>Add New Locker</h2>
          </div>
        </div>

        <form
          className="add-locker-form"
          onSubmit={handleAddLocker}
        >

          <div className="field">
            <label>Locker Number</label>

            <input
              type="text"
              value={newLocker.code}
              onChange={(e) =>
                setNewLocker({
                  ...newLocker,
                  code: e.target.value,
                })
              }
              placeholder="e.g. 101"
              required
            />
          </div>

          <div className="field">
            <label>Railway Station</label>

            <select
              value={newLocker.stationId}
              onChange={(e) =>
                setNewLocker({
                  ...newLocker,
                  stationId: e.target.value,
                })
              }
            >
              {STATIONS.map((station) => (
                <option
                  key={station.id}
                  value={station.id}
                >
                  {station.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Zone</label>

            <select
              value={newLocker.zone}
              onChange={(e) =>
                setNewLocker({
                  ...newLocker,
                  zone: e.target.value,
                })
              }
            >
              {ZONES.map((zone) => (
                <option
                  key={zone}
                  value={zone}
                >
                  {zone}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Size</label>

            <select
              value={newLocker.size}
              onChange={(e) =>
                setNewLocker({
                  ...newLocker,
                  size: e.target.value,
                })
              }
            >
              {SIZES.map((size) => (
                <option
                  key={size}
                  value={size}
                >
                  {size}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary add-locker-btn"
          >
            + Add Locker
          </button>

        </form>

      </section>

      {/* LOCKER STATUS */}

      <section className="admin-section">

        <div className="admin-section-header">
          <div>
            <p className="eyebrow">
              LOCKER MONITORING
            </p>

            <h3>Locker Status & Management</h3>
          </div>

          <span>
            {lockerList.length} lockers
          </span>
        </div>

        <div className="admin-locker-grid">

          {lockerList.length === 0 ? (
            <p className="empty-table">
              No lockers found.
            </p>
          ) : (
            lockerList.map((locker) => {

              const lockerId =
                locker.id || locker._id

              return (
                <div
                  className="admin-locker-item"
                  key={lockerId}
                >

                  <div>
                    <strong>
                      {locker.code ||
                        lockerId}
                    </strong>

                    <small>
                      {locker.station ||
                        locker.stationId ||
                        'Railway Station'}
                    </small>
                  </div>

                  <span
                    className={`locker-status locker-status-${String(
                      locker.status || 'available'
                    )
                      .toLowerCase()
                      .replaceAll(
                        ' ',
                        '-'
                      )}`}
                  >
                    {locker.status ||
                      'available'}
                  </span>

                  <div className="locker-admin-actions">

                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() =>
                        handleToggleOutOfService(
                          locker
                        )
                      }
                    >
                      {locker.outOfService ||
                        locker.status ===
                        'out-of-service'
                        ? 'Set Available'
                        : 'Out of Service'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() =>
                        handleRemoveLocker(
                          locker
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>

                </div>
              )
            })
          )}

        </div>

      </section>

    </div>
  )
}