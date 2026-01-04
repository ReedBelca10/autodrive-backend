import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
export declare class AdminController {
    private jwtService;
    private userModel;
    constructor(jwtService: JwtService, userModel: Model<any>);
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        message: string;
        token: string;
        user: {
            _id: any;
            email: any;
            fullName: any;
            role: any;
        };
    }>;
}
