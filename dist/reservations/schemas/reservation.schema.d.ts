import { Schema } from 'mongoose';
export declare const ReservationSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: import("mongoose").Types.ObjectId;
    vehicleId: import("mongoose").Types.ObjectId;
    startDate: Date;
    returnDate: Date;
    status: "pending" | "confirmed" | "cancelled";
    paymentGateway: "stripe" | "fedapay";
    paymentStatus: "pending" | "paid" | "failed";
    totalPrice: number;
    insuranceOption: "basic" | "premium";
    archived: boolean;
    pickupLocation?: string;
    returnLocation?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    drivingLicense?: string;
    paymentIntentId?: string;
    fedapayTransactionId?: string;
    archivedAt?: Date;
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: import("mongoose").Types.ObjectId;
    vehicleId: import("mongoose").Types.ObjectId;
    startDate: Date;
    returnDate: Date;
    status: "pending" | "confirmed" | "cancelled";
    paymentGateway: "stripe" | "fedapay";
    paymentStatus: "pending" | "paid" | "failed";
    totalPrice: number;
    insuranceOption: "basic" | "premium";
    archived: boolean;
    pickupLocation?: string;
    returnLocation?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    drivingLicense?: string;
    paymentIntentId?: string;
    fedapayTransactionId?: string;
    archivedAt?: Date;
}>> & import("mongoose").FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    userId: import("mongoose").Types.ObjectId;
    vehicleId: import("mongoose").Types.ObjectId;
    startDate: Date;
    returnDate: Date;
    status: "pending" | "confirmed" | "cancelled";
    paymentGateway: "stripe" | "fedapay";
    paymentStatus: "pending" | "paid" | "failed";
    totalPrice: number;
    insuranceOption: "basic" | "premium";
    archived: boolean;
    pickupLocation?: string;
    returnLocation?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    drivingLicense?: string;
    paymentIntentId?: string;
    fedapayTransactionId?: string;
    archivedAt?: Date;
}> & {
    _id: import("mongoose").Types.ObjectId;
}>;
