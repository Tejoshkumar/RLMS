import Locker from '../models/Locker.js';
import Booking from '../models/Booking.js';

/**
 * GET /api/lockers/:id/availability?date=YYYY-MM-DD&startTime=HH:mm&endTime=HH:mm
 * Returns { available: true|false } and optional conflict info.
 */
export const getAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime } = req.query;

    // Validate locker existence
    const locker = await Locker.findById(id);
    if (!locker) {
      return res.status(404).json({ success: false, message: 'Locker not found' });
    }

    // Out of service lockers are unavailable
    if (locker.status === 'out_of_service') {
      return res.status(200).json({
        success: true,
        message: 'Locker out of service',
        data: { available: false },
      });
    }

    // Validate date format (basic check YYYY-MM-DD)
    if (!date || !/\d{4}-\d{2}-\d{2}/.test(date)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing date (YYYY-MM-DD)' });
    }
    // Validate time formats HH:mm
    const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!startTime || !endTime || !timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ success: false, message: 'Invalid or missing startTime/endTime (HH:mm)' });
    }
    if (startTime >= endTime) {
      return res.status(400).json({ success: false, message: 'startTime must be before endTime' });
    }

    // Find active bookings for this locker on the given date
    const bookings = await Booking.find({
      lockerId: id,
      bookingDate: new Date(date),
      status: 'active',
    });

    // Helper to convert HH:mm to minutes since midnight for comparison
    const toMinutes = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const reqStart = toMinutes(startTime);
    const reqEnd = toMinutes(endTime);

    // Check for any conflict using the overlap rule
    for (const b of bookings) {
      const existingStart = toMinutes(b.startTime);
      const existingEnd = toMinutes(b.endTime);
      if (existingStart < reqEnd && reqStart < existingEnd) {
        // Conflict found
        return res.status(200).json({
          success: true,
          message: 'Locker unavailable for requested slot',
          data: {
            available: false,
            conflict: {
              holderName: b.holderName,
              startTime: b.startTime,
              endTime: b.endTime,
            },
          },
        });
      }
    }

    // No conflicts
    return res.status(200).json({
      success: true,
      message: 'Locker available',
      data: { available: true },
    });
  } catch (err) {
    next(err);
  }
};
