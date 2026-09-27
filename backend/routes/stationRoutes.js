import express from 'express';
const router = express.Router();

import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import {
  getStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation,
} from '../controllers/stationController.js';

// Public routes
router.get('/', getStations);
router.get('/:id', getStationById);

// Admin protected routes
router.post('/', protect, admin, createStation);
router.put('/:id', protect, admin, updateStation);
router.delete('/:id', protect, admin, deleteStation);

export default router;
