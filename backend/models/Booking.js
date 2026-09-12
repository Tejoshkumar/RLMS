import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lockerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Locker',
      required: true,
    },
    holderName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // e.g., '14:00'
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    durationHours: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ lockerId: 1, bookingDate: 1, status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
