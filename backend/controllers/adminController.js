// Admin Controller
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Locker from '../models/Locker.js';
import Station from '../models/Station.js';

/**
 * GET /api/admin/users
 * Return list of all users (password excluded).
 */
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, message: 'Users fetched', data: { users } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/bookings
 * Return all bookings with populated user, locker, and station info.
 */
export const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'userId', select: 'name email phone' })
      .populate({
        path: 'lockerId',
        select: 'code zone size pricePerBlock status stationId',
        populate: { path: 'stationId', select: 'code name' },
      });
    res.status(200).json({ success: true, message: 'Bookings fetched', data: { bookings } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/stats
 * Return various system statistics.
 */
export const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalStations, totalLockers, availableLockers, outOfServiceLockers, totalBookings, activeBookings, cancelledBookings] = await Promise.all([
      User.countDocuments(),
      Station.countDocuments(),
      Locker.countDocuments(),
      Locker.countDocuments({ status: 'available' }),
      Locker.countDocuments({ status: 'out_of_service' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'active' }),
      Booking.countDocuments({ status: 'cancelled' }),
    ]);

    // Revenue from active bookings only (price field stored on each booking)
    const revenueAgg = await Booking.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, totalRevenue: { $sum: '$price' } } },
    ]);
    const totalRevenue = revenueAgg.length ? revenueAgg[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      message: 'Stats computed',
      data: {
        totalUsers,
        totalStations,
        totalLockers,
        availableLockers,
        outOfServiceLockers,
        totalBookings,
        activeBookings,
        cancelledBookings,
        totalRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
};

