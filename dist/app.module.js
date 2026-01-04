"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const dotenv = require("dotenv");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const contact_module_1 = require("./contact/contact.module");
const admin_module_1 = require("./admin/admin.module");
const vehicles_module_1 = require("./vehicles/vehicles.module");
const reservations_module_1 = require("./reservations/reservations.module");
const agencies_module_1 = require("./agencies/agencies.module");
dotenv.config();
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forRoot(process.env.MONGODB_URI || '', {}),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            contact_module_1.ContactModule,
            admin_module_1.AdminModule,
            vehicles_module_1.VehiclesModule,
            reservations_module_1.ReservationsModule,
            agencies_module_1.AgenciesModule,
        ],
    })
], AppModule);
