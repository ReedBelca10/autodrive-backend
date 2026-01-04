"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleSchema = void 0;
const mongoose_1 = require("mongoose");
exports.VehicleSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    year: { type: String, required: true },
    price: { type: String, required: true },
    image: String,
    features: [String],
    availability: { type: String, default: 'Disponible' },
}, { timestamps: true });
