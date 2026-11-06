import Booking from '../models/Booking.js'

const EXPIRY_CHECK_INTERVAL_MS = 60_000
const LOOKAHEAD_MS = 24 * 60 * 60 * 1000

export function bookingHasEnded(booking, now = new Date()) {
  const bookingDate = booking.bookingDate instanceof Date
    ? booking.bookingDate.toISOString().slice(0, 10)
    : String(booking.bookingDate).slice(0, 10)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(bookingDate) ||
      !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(booking.endTime)) {
    throw new Error('Booking has an invalid date or end time.')
  }

  return new Date(`${bookingDate}T${booking.endTime}:00`) <= now
}

export async function completeEndedBookings(bookingModel, now = new Date()) {
  const candidates = await bookingModel.find({
    status: 'active',
    bookingDate: { $lte: new Date(now.getTime() + LOOKAHEAD_MS) },
  })
    .select('_id bookingDate endTime')
    .lean()

  const expiredIds = candidates
    .filter((booking) => bookingHasEnded(booking, now))
    .map((booking) => booking._id)

  if (expiredIds.length === 0) return 0

  const result = await bookingModel.updateMany(
    { _id: { $in: expiredIds }, status: 'active' },
    { $set: { status: 'completed' } }
  )

  return result.modifiedCount ?? result.nModified
}

export async function expireEndedBookings(now = new Date()) {
  return completeEndedBookings(Booking, now)
}

export function startBookingExpiryJob() {
  let running = false

  async function checkForEndedBookings() {
    if (running) return
    running = true

    try {
      const completedCount = await expireEndedBookings()
      if (completedCount > 0) {
        console.info(`Marked ${completedCount} ended booking(s) as completed.`)
      }
    } catch (error) {
      console.error('Booking expiry check failed:', error.message)
    } finally {
      running = false
    }
  }

  void checkForEndedBookings()
  const timer = setInterval(checkForEndedBookings, EXPIRY_CHECK_INTERVAL_MS)
  timer.unref()
}
