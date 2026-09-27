import express from 'express';
import { protect } from '../middleware/auth.js';
import { createBooking, getMyBookings, getBookingById, cancelBooking } from '../controllers/bookingController.js';

const router = express.Router();

// Create a new booking
router.post('/', protect, createBooking);

// Get bookings for the authenticated user
router.get('/my', protect, getMyBookings);

// Get a specific booking by ID (owner only)
router.get('/:id', protect, getBookingById);

// Cancel a booking
router.put('/:id/cancel', protect, cancelBooking);

export default router;
