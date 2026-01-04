import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { AdminLoginDto } from './dtos/admin-login.dto';
export declare class AdminService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<any>, jwtService: JwtService);
    login(loginDto: AdminLoginDto): Promise<{
        token: string;
        admin: {
            id: any;
            email: any;
            role: any;
        };
    }>;
    validateAdmin(id: string): Promise<any>;
}
