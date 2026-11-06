export default function LockerCard({
  locker,
  bookings = [],
  onBook,
}) {
  const activeBooking = bookings.find((booking) => {
    const bookingLockerId = typeof booking.lockerId === 'object'
      ? booking.lockerId?._id || booking.lockerId?.id
      : booking.lockerId

    return String(bookingLockerId) === String(locker.id || locker._id) &&
      booking.status === 'active'
  })

  const isOutOfService = locker.outOfService

  const isOccupied =
    !isOutOfService && Boolean(activeBooking)

  function formatTime(dateString) {
    if (!dateString) return ''

    return new Date(
      dateString
    ).toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  function formatDate(dateString) {
    if (!dateString) return ''

    return new Date(
      dateString
    ).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <div
      className={`locker-card ${
        isOccupied
          ? 'locker-card-occupied'
          : 'locker-card-available'
      }`}
    >
      <div className="locker-card-header">
        <div>
          <h3>
            {locker.code || locker.id}
          </h3>

          <span className="locker-size">
            {locker.size}
          </span>
        </div>

        <span
          className={`locker-status-badge ${
            isOccupied || isOutOfService
              ? 'occupied'
              : 'available'
          }`}
        >
          {isOutOfService
            ? 'Out of Service'
            : isOccupied
            ? 'Occupied'
            : 'Available'}
        </span>
      </div>

      <div className="locker-card-info">
        <div>
          <span>Zone</span>
          <strong>{locker.zone}</strong>
        </div>

        <div>
          <span>Price</span>
          <strong>
            ₹{locker.pricePerBlock}/hr
          </strong>
        </div>
      </div>

      {/* Show booking time */}
      {activeBooking && (
        <div className="locker-booking-info">
          <strong>
            🔴 Occupied
          </strong>

          <span>
            {formatDate(
              activeBooking.startTime
            )}
          </span>

          <span>
            {formatTime(
              activeBooking.startTime
            )}{' '}
            –{' '}
            {formatTime(
              activeBooking.endTime
            )}
          </span>
        </div>
      )}

      {isOutOfService && (
        <div className="locker-booking-info out-service-message">
          <strong>
            ⚠️ Out of Service
          </strong>

          <span>
            This locker is currently unavailable.
          </span>
        </div>
      )}

      <button
        className="btn btn-primary locker-book-btn"
        disabled={
          isOccupied || isOutOfService
        }
        onClick={() => onBook(locker)}
      >
        {isOccupied || isOutOfService
          ? 'Not Available'
          : 'Book Locker'}
      </button>
    </div>
  )
}