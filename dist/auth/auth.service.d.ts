import { UsersService } from '../users/users.service';
import { EmailService } from '../common/services/email.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private jwtService;
    private emailService;
    constructor(usersService: UsersService, jwtService: JwtService, emailService: EmailService);
    validateUser(email: string, pass: string): Promise<{
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
    getTokens(user: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    login(user: any): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    register(createUserDto: {
        fullName: string;
        email: string;
        password: string;
    }): Promise<{
        user: {
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
        };
        access_token: string;
        refresh_token: string;
    }>;
    refreshTokensUsing(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logoutRefreshToken(refreshToken: string): Promise<void>;
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    resetPassword(resetToken: string, newPassword: string): Promise<{
        message: string;
    }>;
}
