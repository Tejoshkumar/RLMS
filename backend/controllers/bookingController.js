// Booking Controller
import Booking from '../models/Booking.js';
import Locker from '../models/Locker.js';

// Helper to convert HH:mm to minutes
const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

// Validation regexes
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

/**
 * POST /api/bookings
 * Create a new booking (authenticated user)
 */
export const createBooking = async (req, res, next) => {
  try {
    const { lockerId, holderName, phone, bookingDate, startTime, endTime } = req.body;
    // Required fields
    if (!lockerId || !holderName || !phone || !bookingDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'All booking fields are required' });
    }
    // Format validation
    if (!dateRegex.test(bookingDate)) {
      return res.status(400).json({ success: false, message: 'Invalid bookingDate (YYYY-MM-DD)' });
    }
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ success: false, message: 'Invalid time format (HH:mm)' });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ success: false, message: 'startTime must be before endTime' });
    }

    // Locker existence & status
    const locker = await Locker.findById(lockerId);
    if (!locker) {
      return res.status(404).json({ success: false, message: 'Locker not found' });
    }
    if (locker.status === 'out_of_service') {
      return res.status(400).json({ success: false, message: 'Locker is out of service' });
    }

    // Conflict detection (active bookings only)
    const existing = await Booking.find({
      lockerId,
      bookingDate: new Date(bookingDate),
      status: 'active',
    });
    const reqStart = toMinutes(startTime);
    const reqEnd = toMinutes(endTime);
    for (const b of existing) {
      const existingStart = toMinutes(b.startTime);
      const existingEnd = toMinutes(b.endTime);
      if (existingStart < reqEnd && reqStart < existingEnd) {
        return res.status(409).json({
          success: false,
          message: 'Locker is no longer available for the selected time.',
        });
      }
    }

    // Price calculation – pricePerBlock is per 6‑hour block (as per mock data)
    const durationHours = (reqEnd - reqStart) / 60;
    const blocks = Math.ceil(durationHours / 6);
    const price = locker.pricePerBlock * blocks;

    const booking = await Booking.create({
      userId: req.user._id,
      lockerId,
      holderName: holderName.trim(),
      phone: phone.trim(),
      bookingDate: new Date(bookingDate),
      startTime,
      endTime,
      durationHours,
      price,
    });

    res.status(201).json({ success: true, message: 'Booking created', data: booking });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings/my
 * List bookings for the authenticated user
 */
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({ path: 'lockerId', select: 'code zone size pricePerBlock status' })
      .populate({ path: 'lockerId', populate: { path: 'stationId', select: 'code name' } });
    res.status(200).json({ success: true, message: 'My bookings fetched', data: bookings });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings/:id
 * Retrieve a single booking owned by the user
 */
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.status(200).json({ success: true, message: 'Booking fetched', data: booking });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/bookings/:id/cancel
 * Cancel an existing active booking (owner only)
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.status(200).json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (err) {
    next(err);
  }
};
