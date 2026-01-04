import { AdminService } from './admin.service';
import { AdminLoginDto } from './dtos/admin-login.dto';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    login(loginDto: AdminLoginDto): Promise<{
        token: string;
        admin: {
            id: any;
            email: any;
        };
    } | {
        error: any;
    }>;
}
