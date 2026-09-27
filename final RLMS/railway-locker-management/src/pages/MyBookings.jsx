import { useState } from 'react'
import { useLockers } from '../store/LockerStore.jsx'
import { useAuth } from '../store/AuthStore.jsx'

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return '—'

  // Backend stores time as HH:mm
  if (
    typeof value === 'string' &&
    /^\d{2}:\d{2}$/.test(value)
  ) {
    return value
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MyBookings() {
  const {
    bookings,
    lockers,
    releaseBooking,
  } = useLockers()

  const { currentUser } = useAuth()

  const [selectedBooking, setSelectedBooking] =
    useState(null)

  // =========================
  // NORMALIZE DATA
  // =========================

  const bookingList = Array.isArray(bookings)
    ? bookings
    : Array.isArray(bookings?.data)
      ? bookings.data
      : []

  const lockerList = Array.isArray(lockers)
    ? lockers
    : Array.isArray(lockers?.data)
      ? lockers.data
      : []

  // =========================
  // CURRENT USER BOOKINGS
  // =========================

  const myBookings = bookingList.filter((booking) => {
    const bookingUserId =
      typeof booking.userId === 'object'
        ? booking.userId?._id ||
        booking.userId?.id
        : booking.userId ||
        booking.user?._id ||
        booking.user?.id

    const currentUserId =
      currentUser?.id ||
      currentUser?._id

    return (
      String(bookingUserId) ===
      String(currentUserId)
    )
  })

  // =========================
  // GET LOCKER
  // =========================

  function getLocker(booking) {
    // Backend populates lockerId
    if (
      booking?.lockerId &&
      typeof booking.lockerId === 'object'
    ) {
      return booking.lockerId
    }

    // Older frontend structure
    if (
      booking?.locker &&
      typeof booking.locker === 'object'
    ) {
      return booking.locker
    }

    // If lockerId is only an ID
    const lockerId =
      booking?.lockerId ||
      booking?.locker?._id ||
      booking?.locker?.id

    if (!lockerId) return null

    return lockerList.find((locker) => {
      const id =
        locker.id ||
        locker._id

      return String(id) === String(lockerId)
    }) || null
  }

  // =========================
  // GET LOCKER ID
  // =========================

  function getLockerId(booking) {
    if (
      booking?.lockerId &&
      typeof booking.lockerId === 'object'
    ) {
      return (
        booking.lockerId._id ||
        booking.lockerId.id
      )
    }

    return (
      booking?.lockerId ||
      booking?.locker?._id ||
      booking?.locker?.id
    )
  }

  // =========================
  // CANCEL BOOKING
  // =========================

  async function handleCancel(booking) {
    const bookingId =
      booking.id ||
      booking._id

    const bookingUserId =
      typeof booking.userId === 'object'
        ? booking.userId?._id ||
        booking.userId?.id
        : booking.userId ||
        booking.user?._id ||
        booking.user?.id

    const currentUserId =
      currentUser?.id ||
      currentUser?._id

    const confirmed = window.confirm(
      `Are you sure you want to cancel booking ${bookingId}?`
    )

    if (!confirmed) return

    // Frontend ownership check
    if (
      String(bookingUserId) !==
      String(currentUserId)
    ) {
      alert(
        'You are not authorized to cancel this booking.'
      )
      return
    }

    try {
      await releaseBooking(bookingId)

      if (
        selectedBooking &&
        String(
          selectedBooking.id ||
          selectedBooking._id
        ) === String(bookingId)
      ) {
        setSelectedBooking(null)
      }
    } catch (error) {
      alert(
        error?.message ||
        'Unable to cancel booking.'
      )
    }
  }

  // =========================
  // LOGIN CHECK
  // =========================

  if (!currentUser) {
    return (
      <div className="empty">
        <h3>Please login</h3>

        <p>
          Login to view your bookings.
        </p>
      </div>
    )
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="booking-page">

      {/* HEADER */}

      <div className="page-heading">
        <div>
          <p className="eyebrow">
            BOOKING HISTORY
          </p>

          <h2>My Bookings</h2>

          <p>
            View and manage your railway locker
            bookings.
          </p>
        </div>
      </div>

      {/* BOOKINGS */}

      {myBookings.length === 0 ? (
        <div className="empty">
          <h3>No bookings yet</h3>

          <p>
            You haven't booked a locker yet.
            Available lockers can be booked from
            the locker wall.
          </p>
        </div>
      ) : (
        <div className="booking-list">

          {myBookings.map((booking) => {
            const bookingId =
              booking.id ||
              booking._id

            const locker =
              getLocker(booking)

            const lockerId =
              getLockerId(booking)

            const lockerCode =
              locker?.code ||
              '—'

            const isCancelled =
              booking.status === 'released' ||
              booking.status === 'cancelled'

            const startTime =
              booking.startTime ||
              booking.start

            const endTime =
              booking.endTime ||
              booking.end

            return (
              <div
                className="booking-row"
                key={bookingId}
              >

                {/* LEFT */}

                <div className="booking-main">

                  <div className="booking-code">
                    {lockerCode}
                  </div>

                  <div className="booking-info">

                    <div className="booking-name">
                      Locker {lockerCode}
                    </div>

                    <div className="booking-meta">
                      Station:{' '}
                      {booking.station?.name ||
                        (
                          typeof booking.station ===
                            'string'
                            ? booking.station
                            : null
                        ) ||
                        locker?.stationId?.name ||
                        '—'}
                    </div>

                    <div className="booking-meta">
                      Zone:{' '}
                      {booking.zone ||
                        locker?.zone ||
                        '—'}
                    </div>

                    <div className="booking-meta">
                      Size:{' '}
                      {booking.size ||
                        locker?.size ||
                        '—'}
                    </div>

                    <div className="booking-meta">
                      Date:{' '}
                      {formatDate(
                        booking.bookingDate ||
                        startTime
                      )}
                    </div>

                    <div className="booking-meta">
                      Start:{' '}
                      {formatTime(startTime)}
                    </div>

                    <div className="booking-meta">
                      End:{' '}
                      {formatTime(endTime)}
                    </div>

                    <div className="booking-meta">
                      Price:{' '}
                      <strong>
                        ₹{booking.price || 0}
                      </strong>
                    </div>

                    <div className="booking-meta">
                      Booking ID:{' '}
                      <strong>
                        {bookingId}
                      </strong>
                    </div>

                  </div>
                </div>

                {/* RIGHT */}

                <div className="booking-actions">

                  <span
                    className={
                      `badge ${isCancelled
                        ? 'badge-released'
                        : 'badge-active'
                      }`
                    }
                  >
                    {isCancelled
                      ? 'Cancelled'
                      : 'Active'}
                  </span>

                  <button
                    className="btn btn-ghost"
                    onClick={() =>
                      setSelectedBooking(
                        booking
                      )
                    }
                  >
                    View details
                  </button>

                  {!isCancelled && (
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        handleCancel(booking)
                      }
                    >
                      Cancel booking
                    </button>
                  )}

                </div>

              </div>
            )
          })}

        </div>
      )}

      {/* DETAILS MODAL */}

      {selectedBooking && (
        <div
          className="modal-overlay"
          onClick={() =>
            setSelectedBooking(null)
          }
        >

          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h2>Booking Details</h2>

            <p className="modal-sub">
              Booking ID:{' '}
              <strong>
                {selectedBooking.id ||
                  selectedBooking._id}
              </strong>
            </p>

            {(() => {
              const locker =
                getLocker(selectedBooking)

              const lockerCode =
                locker?.code || '—'

              const startTime =
                selectedBooking.startTime ||
                selectedBooking.start

              const endTime =
                selectedBooking.endTime ||
                selectedBooking.end

              return (
                <div className="profile-details">

                  <div className="profile-detail">
                    <span className="profile-detail-label">
                      Locker
                    </span>

                    <strong>
                      {lockerCode}
                    </strong>
                  </div>

                  <div className="profile-detail">
                    <span className="profile-detail-label">
                      Station
                    </span>

                    <strong>
                      {selectedBooking.station?.name ||
                        (
                          typeof selectedBooking.station ===
                            'string'
                            ? selectedBooking.station
                            : null
                        ) ||
                        '—'}
                    </strong>
                  </div>

                  <div className="profile-detail">
                    <span className="profile-detail-label">
                      Zone
                    </span>

                    <strong>
                      {selectedBooking.zone ||
                        locker?.zone ||
                        '—'}
                    </strong>
                  </div>

                  <div className="profile-detail">
                    <span className="profile-detail-label">
                      Size
                    </span>

                    <strong>
                      {selectedBooking.size ||
                        locker?.size ||
                        '—'}
                    </strong>
                  </div>

                  <div className="profile-detail">
                    <span className="profile-detail-label">
                      Date
                    </span>

                    <strong>
                      {formatDate(
                        selectedBooking.bookingDate ||
                        startTime
                      )}
                    </strong>
                  </div>

                  <div className="profile-detail">
                    <span className="profile-detail-label">
                      Start Time
                    </span>

                    <strong>
                      {formatTime(startTime)}
                    </strong>
                  </div>

                  <div className="profile-detail">
                    <span className="profile-detail-label">
                      End Time
                    </span>

                    <strong>
                      {formatTime(endTime)}
                    </strong>
                  </div>

                  <div className="profile-detail">
                    <span className="profile-detail-label">
                      Price
                    </span>

                    <strong>
                      ₹{selectedBooking.price || 0}
                    </strong>
                  </div>

                  <div className="profile-detail">
                    <span className="profile-detail-label">
                      Status
                    </span>

                    <strong>
                      {selectedBooking.status ||
                        'unknown'}
                    </strong>
                  </div>

                </div>
              )
            })()}

            <div className="modal-actions">

              <button
                className="btn btn-ghost"
                onClick={() =>
                  setSelectedBooking(null)
                }
              >
                Close
              </button>

              {!(
                selectedBooking.status ===
                'released' ||
                selectedBooking.status ===
                'cancelled'
              ) && (
                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      handleCancel(
                        selectedBooking
                      )
                    }
                  >
                    Cancel booking
                  </button>
                )}

            </div>

          </div>

        </div>
      )}

    </div>
  )
}