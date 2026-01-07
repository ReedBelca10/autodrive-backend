import { AuthService } from './auth.service';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
declare class RegisterDto {
    fullName: string;
    email: string;
    password: string;
}
declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private authService;
    private jwtService;
    private usersService;
    constructor(authService: AuthService, jwtService: JwtService, usersService: UsersService);
    private static twitterPkce;
    oauthStart(req: Request, res: Response): Promise<void | Response<any, Record<string, any>>>;
    googleCallback(req: Request, res: Response): Promise<void>;
    facebookCallback(req: Request, res: Response): Promise<void>;
    twitterCallback(req: Request, res: Response): Promise<void>;
    register(dto: RegisterDto, res: Response): Promise<any>;
    login(dto: LoginDto, res: Response): Promise<{
        message: string;
    }>;
    profile(req: Request): Promise<{
        user: {
            _id: any;
            email: any;
            fullName: any;
            avatarUrl: any;
        };
    }>;
    logout(req: Request, res: Response): Promise<{
        message: string;
    }>;
    refresh(req: Request, res: Response): Promise<{
        message: string;
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
    resetPassword(body: {
        token: string;
        password: string;
    }): Promise<{
        message: string;
    }>;
}
export {};
