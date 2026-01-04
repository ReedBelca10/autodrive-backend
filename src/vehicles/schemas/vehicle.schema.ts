import { Schema } from 'mongoose';

export const VehicleSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    year: { type: String, required: true },
    price: { type: String, required: true },
    image: String,
    features: [String],
    availability: { type: String, default: 'Disponible' },
  },
  { timestamps: true }
);
