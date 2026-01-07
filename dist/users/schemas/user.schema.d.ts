import { Document, Schema as MongooseSchema } from 'mongoose';
export type UserDocument = User & Document;
export declare class User {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    role?: string;
    refreshToken?: string;
    avatarUrl?: string;
    avatarPath?: string;
    isActive?: boolean;
    favoriteVehicles: MongooseSchema.Types.ObjectId[];
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}
export declare const UserSchema: MongooseSchema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & {
    _id: import("mongoose").Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
}>;
