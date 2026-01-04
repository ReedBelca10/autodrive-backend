import { Schema } from 'mongoose';
export declare const VehicleSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    type: string;
    year: string;
    price: string;
    features: string[];
    availability: string;
    image?: string;
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    type: string;
    year: string;
    price: string;
    features: string[];
    availability: string;
    image?: string;
}>> & import("mongoose").FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    name: string;
    type: string;
    year: string;
    price: string;
    features: string[];
    availability: string;
    image?: string;
}> & {
    _id: import("mongoose").Types.ObjectId;
}>;
