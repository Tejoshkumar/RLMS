import mongoose from 'mongoose';

const lockerSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    zone: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      enum: ['small', 'medium', 'large'],
      required: true,
    },
    pricePerBlock: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'out_of_service'],
      default: 'available',
    },
  },
  {
    timestamps: true,
  }
);

lockerSchema.index({ stationId: 1, code: 1 }, { unique: true });

const Locker = mongoose.model('Locker', lockerSchema);

export default Locker;
