"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationSchema = void 0;
const mongoose_1 = require("mongoose");
exports.ReservationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    vehicleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    startDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending',
    },
    totalPrice: { type: Number, required: true },
    pickupLocation: String,
    returnLocation: String,
}, { timestamps: true });
