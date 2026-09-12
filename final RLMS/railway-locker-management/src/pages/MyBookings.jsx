import { useState } from 'react'
import { useLockers } from '../store/LockerStore.jsx'
import { useAuth } from '../store/AuthStore.jsx'

function formatDate(value) {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return '—'

  return new Date(value).toLocaleTimeString('en-IN', {
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

  /*
    IMPORTANT:
    Only bookings belonging to the currently
    logged-in user are displayed.
  */
  const myBookings = bookings.filter(
    (booking) =>
      booking.userId === currentUser?.id
  )

  function getLocker(lockerId) {
    return lockers.find(
      (locker) => locker.id === lockerId
    )
  }

  function handleCancel(booking) {
    const confirmed = window.confirm(
      `Are you sure you want to cancel booking ${booking.id}?`
    )

    if (!confirmed) return

    /*
      Extra safety check.
      A user cannot cancel another user's booking.
    */
    if (booking.userId !== currentUser?.id) {
      alert('You are not authorized to cancel this booking.')
      return
    }

   releaseBooking(
  booking.id,
  currentUser.id
)
  }

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

  return (
    <div className="booking-page">

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

            const locker = getLocker(
              booking.lockerId
            )

            const isCancelled =
              booking.status === 'released' ||
              booking.status === 'cancelled'

            return (
              <div
                className="booking-row"
                key={booking.id}
              >

                {/* LEFT */}
                <div className="booking-main">

                  <div className="booking-code">
                    {locker?.code ||
                      booking.lockerId}
                  </div>

                  <div className="booking-info">

                    <div className="booking-name">
                      Locker{' '}
                      {locker?.code ||
                        booking.lockerId}
                    </div>

                    <div className="booking-meta">
                      Station:{' '}
                      {booking.station || '—'}
                    </div>

                    <div className="booking-meta">
                      Zone:{' '}
                      {booking.zone || '—'}
                    </div>

                    <div className="booking-meta">
                      Size:{' '}
                      {booking.size || '—'}
                    </div>

                    <div className="booking-meta">
                      Date:{' '}
                      {formatDate(
                        booking.bookingDate
                      )}
                    </div>

                    <div className="booking-meta">
                      Start:{' '}
                      {formatTime(
                        booking.startTime
                      )}
                    </div>

                    <div className="booking-meta">
                      End:{' '}
                      {formatTime(
                        booking.endTime
                      )}
                    </div>

                    <div className="booking-meta">
                      Price:{' '}
                      <strong>
                        ₹{booking.price}
                      </strong>
                    </div>

                    <div className="booking-meta">
                      Booking ID:{' '}
                      <strong>
                        {booking.id}
                      </strong>
                    </div>

                  </div>
                </div>

                {/* RIGHT */}
                <div className="booking-actions">

                  <span
                    className={
                      `badge ${
                        isCancelled
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
                        handleCancel(
                          booking
                        )
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
                {selectedBooking.id}
              </strong>
            </p>

            <div className="profile-details">

              <div className="profile-detail">
                <span className="profile-detail-label">
                  Locker
                </span>
                <strong>
                  {getLocker(
                    selectedBooking.lockerId
                  )?.code ||
                    selectedBooking.lockerId}
                </strong>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-label">
                  Station
                </span>
                <strong>
                  {selectedBooking.station}
                </strong>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-label">
                  Zone
                </span>
                <strong>
                  {selectedBooking.zone}
                </strong>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-label">
                  Size
                </span>
                <strong>
                  {selectedBooking.size}
                </strong>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-label">
                  Date
                </span>
                <strong>
                  {formatDate(
                    selectedBooking.bookingDate
                  )}
                </strong>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-label">
                  Start Time
                </span>
                <strong>
                  {formatTime(
                    selectedBooking.startTime
                  )}
                </strong>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-label">
                  End Time
                </span>
                <strong>
                  {formatTime(
                    selectedBooking.endTime
                  )}
                </strong>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-label">
                  Price
                </span>
                <strong>
                  ₹{selectedBooking.price}
                </strong>
              </div>

              <div className="profile-detail">
                <span className="profile-detail-label">
                  Status
                </span>
                <strong>
                  {selectedBooking.status}
                </strong>
              </div>

            </div>

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
                  onClick={() => {
                    handleCancel(
                      selectedBooking
                    )
                    setSelectedBooking(null)
                  }}
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