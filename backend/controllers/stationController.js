import Station from '../models/Station.js';
import Locker from '../models/Locker.js';

// Get all stations
export const getStations = async (req, res, next) => {
  try {
    const stations = await Station.find();
    res.status(200).json({ success: true, message: 'Stations fetched', data: stations });
  } catch (err) {
    next(err);
  }
};

// Get station by ID
export const getStationById = async (req, res, next) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    res.status(200).json({ success: true, message: 'Station fetched', data: station });
  } catch (err) {
    next(err);
  }
};

// Create a new station (admin only)
export const createStation = async (req, res, next) => {
  try {
    const { code, name } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'code and name are required' });
    }
    const formattedCode = code.trim().toUpperCase();
    const formattedName = name.trim();
    const station = await Station.create({ code: formattedCode, name: formattedName });
    res.status(201).json({ success: true, message: 'Station created', data: station });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Station code already exists' });
    }
    next(err);
  }
};

// Update station (admin only)
export const updateStation = async (req, res, next) => {
  try {
    const { code, name } = req.body;
    const updates = {};
    if (code) updates.code = code.trim().toUpperCase();
    if (name) updates.name = name.trim();
    const station = await Station.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    res.status(200).json({ success: true, message: 'Station updated', data: station });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Station code already exists' });
    }
    next(err);
  }
};

// Delete station (admin only) – prevent breaking related lockers
export const deleteStation = async (req, res, next) => {
  try {
    const lockerCount = await Locker.countDocuments({ stationId: req.params.id });
    if (lockerCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete station with existing lockers. Remove lockers first.',
      });
    }
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) {
      return res.status(404).json({ success: false, message: 'Station not found' });
    }
    res.status(200).json({ success: true, message: 'Station deleted', data: station });
  } catch (err) {
    next(err);
  }
};
