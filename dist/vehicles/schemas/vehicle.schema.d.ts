import { Document, Schema as MongooseSchema } from 'mongoose';
export type VehicleDocument = Vehicle & Document & {
    createdAt: Date;
    updatedAt: Date;
};
export declare class Vehicle {
    name: string;
    dailyRate: number;
    passengers: number;
    year: number;
    transmission: string;
    fuel: string;
    city: string;
    agencyId: string;
    bodyType: string;
    description: string;
    equipment: string[];
    mediaUrls: string[];
    reviews: {
        totalRatings: number;
        averageRating: number;
        reviews: Array<{
            userId: string;
            rating: number;
            comment: string;
            createdAt: Date;
        }>;
    };
    isActive: boolean;
    status: 'available' | 'reserved' | 'maintenance';
    createdAt?: Date;
    updatedAt?: Date;
}
export declare const VehicleSchema: MongooseSchema<Vehicle, import("mongoose").Model<Vehicle, any, any, any, Document<unknown, any, Vehicle> & Vehicle & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Vehicle, Document<unknown, {}, import("mongoose").FlatRecord<Vehicle>> & import("mongoose").FlatRecord<Vehicle> & {
    _id: import("mongoose").Types.ObjectId;
}>;
