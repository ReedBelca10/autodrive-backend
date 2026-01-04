"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let VehiclesService = class VehiclesService {
    constructor(vehicleModel) {
        this.vehicleModel = vehicleModel;
    }
    async create(createVehicleDto) {
        const vehicle = new this.vehicleModel(createVehicleDto);
        return await vehicle.save();
    }
    async findAll() {
        return await this.vehicleModel.find().exec();
    }
    async findById(id) {
        return await this.vehicleModel.findById(id).exec();
    }
    async update(id, updateVehicleDto) {
        return await this.vehicleModel.findByIdAndUpdate(id, updateVehicleDto, {
            new: true,
        }).exec();
    }
    async delete(id) {
        return await this.vehicleModel.findByIdAndDelete(id).exec();
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Vehicle')),
    __metadata("design:paramtypes", [mongoose_2.Model])
], VehiclesService);
