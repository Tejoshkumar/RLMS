import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import stationRoutes from './routes/stationRoutes.js';
import lockerRoutes from './routes/lockerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Middleware imports
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5175',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // (PowerShell, Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow our frontend development origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
  })
);

// =====================================================
// BODY PARSER
// =====================================================

app.use(express.json());

// =====================================================
// DATABASE CONNECTION
// =====================================================

connectDB();

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'RLMS API is running',
  });
});

// =====================================================
// API ROUTES
// =====================================================

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

app.use('/api/stations', stationRoutes);

app.use('/api/lockers', lockerRoutes);

app.use('/api/bookings', bookingRoutes);

app.use('/api/admin', adminRoutes);

// =====================================================
// ERROR HANDLING
// =====================================================

app.use(errorHandler);

// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});