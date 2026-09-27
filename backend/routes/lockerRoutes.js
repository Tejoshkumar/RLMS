import express from 'express';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import {
  getLockers,
  getLockerById,
  createLocker,
  updateLocker,
  deleteLocker,
} from '../controllers/lockerController.js';
import { getAvailability } from '../controllers/availabilityController.js';

const router = express.Router();

// Public GET list with optional filters
router.get('/', getLockers);

// Availability check must be before generic :id route
router.get('/:id/availability', getAvailability);

// Public GET by id
router.get('/:id', getLockerById);

// Admin protected routes
router.post('/', protect, admin, createLocker);
router.put('/:id', protect, admin, updateLocker);
router.delete('/:id', protect, admin, deleteLocker);

export default router;
