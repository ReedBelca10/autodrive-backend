"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const admin_service_1 = require("./admin.service");
const admin_controller_1 = require("./admin.controller");
const admin_seed_controller_1 = require("./admin.seed.controller");
const admin_dashboard_controller_1 = require("./admin.dashboard.controller");
const user_schema_1 = require("../users/user.schema");
const vehicle_schema_1 = require("../vehicles/schemas/vehicle.schema");
const reservation_schema_1 = require("../reservations/schemas/reservation.schema");
const agency_schema_1 = require("../agencies/schemas/agency.schema");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: 'User', schema: user_schema_1.UserSchema },
                { name: 'Vehicle', schema: vehicle_schema_1.VehicleSchema },
                { name: 'Reservation', schema: reservation_schema_1.ReservationSchema },
                { name: 'Agency', schema: agency_schema_1.AgencySchema },
            ]),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'La-clé-secrète',
                signOptions: { expiresIn: '24h' },
            }),
        ],
        providers: [admin_service_1.AdminService],
        controllers: [admin_controller_1.AdminController, admin_seed_controller_1.AdminSeedController, admin_dashboard_controller_1.AdminDashboardController],
        exports: [admin_service_1.AdminService],
    })
], AdminModule);
