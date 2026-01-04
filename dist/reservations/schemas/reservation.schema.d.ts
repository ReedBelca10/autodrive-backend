import { Schema } from 'mongoose';
export declare const ReservationSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "confirmed" | "cancelled";
    userId: import("mongoose").Types.ObjectId;
    vehicleId: import("mongoose").Types.ObjectId;
    startDate: Date;
    returnDate: Date;
    totalPrice: number;
    pickupLocation?: string;
    returnLocation?: string;
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "confirmed" | "cancelled";
    userId: import("mongoose").Types.ObjectId;
    vehicleId: import("mongoose").Types.ObjectId;
    startDate: Date;
    returnDate: Date;
    totalPrice: number;
    pickupLocation?: string;
    returnLocation?: string;
}>> & import("mongoose").FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    status: "pending" | "confirmed" | "cancelled";
    userId: import("mongoose").Types.ObjectId;
    vehicleId: import("mongoose").Types.ObjectId;
    startDate: Date;
    returnDate: Date;
    totalPrice: number;
    pickupLocation?: string;
    returnLocation?: string;
}> & {
    _id: import("mongoose").Types.ObjectId;
}>;
