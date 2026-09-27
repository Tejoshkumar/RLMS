import express from 'express';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import { getUsers, getBookings, getStats } from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', protect, admin, getUsers);
router.get('/bookings', protect, admin, getBookings);
router.get('/stats', protect, admin, getStats);

export default router;
