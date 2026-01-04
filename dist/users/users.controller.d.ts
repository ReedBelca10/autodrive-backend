import { UsersService } from './users.service';
import { Request } from 'express';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    proxyAvatar(req: Request, res: any): Promise<any>;
    getUser(id: string): Promise<{
        fullName: string;
        email: string;
        role?: string;
        refreshToken?: string;
        avatarUrl?: string;
        avatarPath?: string;
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
    uploadAvatar(req: Request, file: Express.Multer.File): Promise<any>;
}
