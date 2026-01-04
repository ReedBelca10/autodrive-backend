import { UsersService } from './users.service';
import { Request } from 'express';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    proxyAvatar(req: Request, res: any): Promise<any>;
    getUser(id: string): Promise<{
        fullName: string;
        email: string;
        phone?: string;
        address?: string;
        role?: string;
        refreshToken?: string;
        avatarUrl?: string;
        avatarPath?: string;
        isActive?: boolean;
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
    getAllUsers(): Promise<(import("mongoose").FlattenMaps<import("./schemas/user.schema").UserDocument> & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    createUser(createUserDto: any): Promise<import("./schemas/user.schema").User & import("mongoose").Document<any, any, any> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    updateUser(id: string, updateUserDto: any): Promise<import("mongoose").FlattenMaps<import("./schemas/user.schema").UserDocument> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    toggleUserStatus(id: string): Promise<import("mongoose").FlattenMaps<import("./schemas/user.schema").UserDocument> & {
        _id: import("mongoose").Types.ObjectId;
    }>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    uploadAvatar(req: Request, file: Express.Multer.File): Promise<any>;
}
