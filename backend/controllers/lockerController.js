import Locker from '../models/Locker.js';
import Station from '../models/Station.js';
import Booking from '../models/Booking.js';

// Helper for validation
const isValidEnum = (value, enumArray) => enumArray.includes(value);

// GET /api/lockers - list with optional filters
export const getLockers = async (req, res, next) => {
  try {
    const { stationId, zone, size, status } = req.query;
    const filter = {};
    if (stationId) filter.stationId = stationId;
    if (zone) filter.zone = zone;
    if (size) filter.size = size;
    if (status) filter.status = status;
    const lockers = await Locker.find(filter);
    res.status(200).json({ success: true, message: 'Lockers fetched', data: lockers });
  } catch (err) {
    next(err);
  }
};

// GET /api/lockers/:id
export const getLockerById = async (req, res, next) => {
  try {
    const locker = await Locker.findById(req.params.id);
    if (!locker) {
      return res.status(404).json({ success: false, message: 'Locker not found' });
    }
    res.status(200).json({ success: true, message: 'Locker fetched', data: locker });
  } catch (err) {
    next(err);
  }
};

// POST /api/lockers (admin only)
export const createLocker = async (req, res, next) => {
  try {
    const { code, stationId, zone, size, pricePerBlock, status } = req.body;
    if (!code || !stationId || !zone || !size || pricePerBlock == null) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    // Validate station exists
    const station = await Station.findById(stationId);
    if (!station) {
      return res.status(400).json({ success: false, message: 'Station does not exist' });
    }
    // Validate enums
    if (!isValidEnum(size, ['small', 'medium', 'large'])) {
      return res.status(400).json({ success: false, message: 'Invalid size value' });
    }
    if (status && !isValidEnum(status, ['available', 'out_of_service'])) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }
    const locker = await Locker.create({
      code: String(code).trim(),
      stationId,
      zone: String(zone).trim(),
      size,
      pricePerBlock,
      status: status || 'available',
    });
    res.status(201).json({ success: true, message: 'Locker created', data: locker });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate locker code for this station' });
    }
    next(err);
  }
};

// PUT /api/lockers/:id (admin only)
export const updateLocker = async (req, res, next) => {
  try {
    const { code, stationId, zone, size, pricePerBlock, status } = req.body;
    const updates = {};
    if (code) updates.code = String(code).trim();
    if (stationId) {
      const station = await Station.findById(stationId);
      if (!station) {
        return res.status(400).json({ success: false, message: 'Station does not exist' });
      }
      updates.stationId = stationId;
    }
    if (zone) updates.zone = String(zone).trim();
    if (size) {
      if (!isValidEnum(size, ['small', 'medium', 'large'])) {
        return res.status(400).json({ success: false, message: 'Invalid size value' });
      }
      updates.size = size;
    }
    if (pricePerBlock != null) updates.pricePerBlock = pricePerBlock;
    if (status) {
      if (!isValidEnum(status, ['available', 'out_of_service'])) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }
      updates.status = status;
    }
    const locker = await Locker.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!locker) {
      return res.status(404).json({ success: false, message: 'Locker not found' });
    }
    res.status(200).json({ success: true, message: 'Locker updated', data: locker });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate locker code for this station' });
    }
    next(err);
  }
};

// DELETE /api/lockers/:id (admin only) – keep booking history
export const deleteLocker = async (req, res, next) => {
  try {
    // Ensure we only delete the locker record, bookings stay (status can be retained or ignored)
    const locker = await Locker.findByIdAndDelete(req.params.id);
    if (!locker) {
      return res.status(404).json({ success: false, message: 'Locker not found' });
    }
    res.status(200).json({ success: true, message: 'Locker deleted', data: locker });
  } catch (err) {
    next(err);
  }
};

