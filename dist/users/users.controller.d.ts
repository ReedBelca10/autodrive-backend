import { UsersService } from './users.service';
import { Request } from 'express';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    proxyAvatar(req: Request, res: any): Promise<any>;
    getFavorites(req: Request): Promise<any>;
    addFavorite(req: Request, vehicleId: string): Promise<{
        message: string;
        favoriteCount: number;
        vehicleId?: undefined;
    } | {
        message: string;
        favoriteCount: number;
        vehicleId: string;
    }>;
    removeFavorite(req: Request, vehicleId: string): Promise<{
        message: string;
        favoriteCount: any;
        vehicleId: string;
    }>;
    isFavorite(req: Request, vehicleId: string): Promise<{
        isFavorite: boolean;
    }>;
    getUser(id: string): Promise<{
        email: string;
        fullName: string;
        phone: string;
        address: string;
        role: string;
        avatarPath: string;
        avatarUrl: string;
        isActive: boolean;
        refreshToken?: string;
        favoriteVehicles: import("mongoose").Schema.Types.ObjectId[];
        createdAt?: Date;
        updatedAt?: Date;
        _id: any;
        __v?: any;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: import("mongoose").Schema;
    }>;
    getAllUsers(): Promise<(import("mongoose").FlattenMaps<import("./user.schema").UserDocument> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    createUser(createUserDto: any): Promise<import("./user.schema").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateUser(id: string, updateUserDto: any): Promise<import("mongoose").FlattenMaps<import("./user.schema").UserDocument> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    toggleUserStatus(id: string): Promise<import("mongoose").FlattenMaps<import("./user.schema").UserDocument> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    uploadAvatar(req: Request, file: Express.Multer.File): Promise<any>;
}
