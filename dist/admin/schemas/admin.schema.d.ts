import { Schema } from 'mongoose';
export declare const AdminSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    password: string;
    role: string;
    isActive: boolean;
    firstName?: string;
    lastName?: string;
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    password: string;
    role: string;
    isActive: boolean;
    firstName?: string;
    lastName?: string;
}>> & import("mongoose").FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    email: string;
    password: string;
    role: string;
    isActive: boolean;
    firstName?: string;
    lastName?: string;
}> & {
    _id: import("mongoose").Types.ObjectId;
}>;
