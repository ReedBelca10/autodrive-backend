import { Schema } from 'mongoose';

export const AgencySchema = new Schema(
  {
    name: { type: String, required: true },
    city: { type: String, required: true },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    phone: { type: String, required: false },
    email: { type: String, required: false },
    description: { type: String, required: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

