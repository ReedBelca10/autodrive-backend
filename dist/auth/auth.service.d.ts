import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<{
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
        user: any;
        access_token: string;
        refresh_token: string;
    }>;
    refreshTokensUsing(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logoutRefreshToken(refreshToken: string): Promise<void>;
}
