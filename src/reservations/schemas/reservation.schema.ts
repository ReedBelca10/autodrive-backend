import { Schema } from 'mongoose';

export const ReservationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    startDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
    paymentIntentId: { type: String },
    paymentGateway: {
      type: String,
      enum: ['stripe', 'fedapay'],
      default: 'stripe',
    },
    fedapayTransactionId: { type: String },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    totalPrice: { type: Number, required: true },
    pickupLocation: String,
    returnLocation: String,
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    drivingLicense: String,
    insuranceOption: { type: String, enum: ['basic', 'premium'], default: 'basic' },
    archived: { type: Boolean, default: false },
    archivedAt: { type: Date },
  },
  { timestamps: true }
);
