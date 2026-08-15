import { Schema } from 'mongoose';
export declare const ReservationSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    vehicleId: import("mongoose").Types.ObjectId;
    userId: import("mongoose").Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled";
    startDate: Date;
    returnDate: Date;
    paymentGateway: "stripe" | "fedapay";
    paymentStatus: "pending" | "paid" | "failed";
    totalPrice: number;
    insuranceOption: "basic" | "premium";
    archived: boolean;
    email?: string;
    phone?: string;
    pickupLocation?: string;
    returnLocation?: string;
    firstName?: string;
    lastName?: string;
    drivingLicense?: string;
    paymentIntentId?: string;
    fedapayTransactionId?: string;
    archivedAt?: Date;
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    vehicleId: import("mongoose").Types.ObjectId;
    userId: import("mongoose").Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled";
    startDate: Date;
    returnDate: Date;
    paymentGateway: "stripe" | "fedapay";
    paymentStatus: "pending" | "paid" | "failed";
    totalPrice: number;
    insuranceOption: "basic" | "premium";
    archived: boolean;
    email?: string;
    phone?: string;
    pickupLocation?: string;
    returnLocation?: string;
    firstName?: string;
    lastName?: string;
    drivingLicense?: string;
    paymentIntentId?: string;
    fedapayTransactionId?: string;
    archivedAt?: Date;
}>> & import("mongoose").FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    vehicleId: import("mongoose").Types.ObjectId;
    userId: import("mongoose").Types.ObjectId;
    status: "pending" | "confirmed" | "cancelled";
    startDate: Date;
    returnDate: Date;
    paymentGateway: "stripe" | "fedapay";
    paymentStatus: "pending" | "paid" | "failed";
    totalPrice: number;
    insuranceOption: "basic" | "premium";
    archived: boolean;
    email?: string;
    phone?: string;
    pickupLocation?: string;
    returnLocation?: string;
    firstName?: string;
    lastName?: string;
    drivingLicense?: string;
    paymentIntentId?: string;
    fedapayTransactionId?: string;
    archivedAt?: Date;
}> & {
    _id: import("mongoose").Types.ObjectId;
}>;
