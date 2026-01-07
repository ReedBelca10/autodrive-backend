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
    constructor(vehicleModel, agencyModel) {
        this.vehicleModel = vehicleModel;
        this.agencyModel = agencyModel;
        this.TRANSMISSIONS = ['automatique', 'manuelle', 'semi-automatique'];
        this.FUELS = ['essence', 'diesel', 'électrique', 'hybride'];
        this.BODY_TYPES = ['berline', 'suv', 'camionnette', 'monospace', 'cabriolet', 'coupé', 'break'];
        this.EQUIPMENTS = [
            'climatisation',
            'gps',
            'toit_panoramique',
            'siege_chauffant',
            'systeme_audio_premium',
            'bluetooth',
            'camera_recul',
            'siege_electrique',
            'toit_ouvrant',
            'suspension_adaptative',
            'assistant_stationnement'
        ];
    }
    async create(createVehicleDto) {
        const vehicleData = {
            dailyRate: createVehicleDto.dailyRate,
            year: createVehicleDto.year,
            transmission: createVehicleDto.transmission,
            fuel: createVehicleDto.fuel,
            bodyType: createVehicleDto.bodyType,
            description: createVehicleDto.description,
            agencyId: createVehicleDto.agencyId,
            status: createVehicleDto.status || 'available',
        };
        if (createVehicleDto.brand && createVehicleDto.model) {
            vehicleData.name = `${createVehicleDto.brand} ${createVehicleDto.model}`;
        }
        else if (createVehicleDto.name) {
            vehicleData.name = createVehicleDto.name;
        }
        else {
            throw new common_1.BadRequestException('Le nom du véhicule est requis (brand + model ou name)');
        }
        vehicleData.passengers = createVehicleDto.seats || createVehicleDto.passengers || 5;
        vehicleData.city = createVehicleDto.city || 'Non spécifiée';
        vehicleData.equipment = createVehicleDto.equipment || createVehicleDto.features || [];
        vehicleData.mediaUrls = createVehicleDto.mediaUrls || [];
        const vehicle = new this.vehicleModel(vehicleData);
        return await vehicle.save();
    }
    async findAll() {
        const vehicles = await this.vehicleModel
            .find({ isActive: { $ne: false } })
            .populate('agencyId')
            .lean()
            .exec();
        return vehicles.map(vehicle => {
            const transformedVehicle = {
                ...vehicle,
                mediaUrls: this.normalizeMediaUrls(vehicle.mediaUrls || []),
            };
            if (transformedVehicle.agencyId && typeof transformedVehicle.agencyId === 'object') {
                transformedVehicle.agency = transformedVehicle.agencyId;
                delete transformedVehicle.agencyId;
            }
            return transformedVehicle;
        });
    }
    async findById(id) {
        const vehicle = await this.vehicleModel
            .findById(id)
            .populate('agencyId')
            .lean()
            .exec();
        if (vehicle) {
            vehicle.mediaUrls = this.normalizeMediaUrls(vehicle.mediaUrls || []);
            if (vehicle.agencyId && typeof vehicle.agencyId === 'object') {
                vehicle.agency = vehicle.agencyId;
                delete vehicle.agencyId;
            }
        }
        return vehicle;
    }
    normalizeMediaUrls(urls) {
        if (!Array.isArray(urls))
            return [];
        return urls
            .filter((url) => typeof url === 'string' && url.trim().length > 0)
            .map(url => url.trim());
    }
    async update(id, updateVehicleDto) {
        var _a;
        const updateData = {};
        if (updateVehicleDto.brand || updateVehicleDto.model) {
            if (updateVehicleDto.brand || updateVehicleDto.model) {
                const currentVehicle = await this.vehicleModel.findById(id);
                const nameParts = ((_a = currentVehicle === null || currentVehicle === void 0 ? void 0 : currentVehicle.name) === null || _a === void 0 ? void 0 : _a.split(' ')) || [];
                const brand = updateVehicleDto.brand || nameParts[0];
                const model = updateVehicleDto.model || nameParts.slice(1).join(' ');
                updateData.name = `${brand} ${model}`;
            }
        }
        else if (updateVehicleDto.name) {
            updateData.name = updateVehicleDto.name;
        }
        if (updateVehicleDto.dailyRate !== undefined)
            updateData.dailyRate = updateVehicleDto.dailyRate;
        if (updateVehicleDto.year !== undefined)
            updateData.year = updateVehicleDto.year;
        if (updateVehicleDto.transmission !== undefined)
            updateData.transmission = updateVehicleDto.transmission;
        if (updateVehicleDto.fuel !== undefined)
            updateData.fuel = updateVehicleDto.fuel;
        if (updateVehicleDto.bodyType !== undefined)
            updateData.bodyType = updateVehicleDto.bodyType;
        if (updateVehicleDto.description !== undefined)
            updateData.description = updateVehicleDto.description;
        if (updateVehicleDto.seats !== undefined)
            updateData.passengers = updateVehicleDto.seats;
        if (updateVehicleDto.passengers !== undefined)
            updateData.passengers = updateVehicleDto.passengers;
        if (updateVehicleDto.city !== undefined)
            updateData.city = updateVehicleDto.city;
        if (updateVehicleDto.status !== undefined)
            updateData.status = updateVehicleDto.status;
        if (updateVehicleDto.equipment !== undefined)
            updateData.equipment = updateVehicleDto.equipment;
        if (updateVehicleDto.features !== undefined)
            updateData.equipment = updateVehicleDto.features;
        if (updateVehicleDto.mediaUrls !== undefined)
            updateData.mediaUrls = updateVehicleDto.mediaUrls;
        const cleanedData = Object.entries(updateData).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== '' && value !== null) {
                acc[key] = value;
            }
            return acc;
        }, {});
        return await this.vehicleModel
            .findByIdAndUpdate(id, { ...cleanedData, updatedAt: new Date() }, { new: true })
            .populate('agencyId')
            .exec();
    }
    async delete(id) {
        return await this.vehicleModel.findByIdAndDelete(id).exec();
    }
    async toggleStatus(id) {
        const vehicle = await this.vehicleModel.findById(id);
        if (vehicle) {
            vehicle.isActive = !vehicle.isActive;
            vehicle.updatedAt = new Date();
            return await vehicle.save();
        }
        return null;
    }
    async addMediaUrl(id, mediaUrl) {
        if (!mediaUrl || typeof mediaUrl !== 'string' || mediaUrl.trim().length === 0) {
            throw new Error('URL média invalide');
        }
        const cleanUrl = mediaUrl.trim();
        const vehicle = await this.vehicleModel.findById(id);
        if (!vehicle) {
            throw new Error('Véhicule non trouvé');
        }
        if (!vehicle.mediaUrls) {
            vehicle.mediaUrls = [];
        }
        const urlExists = vehicle.mediaUrls.some(url => url.toLowerCase() === cleanUrl.toLowerCase());
        if (!urlExists) {
            vehicle.mediaUrls.push(cleanUrl);
            console.log(`Added media URL to vehicle ${vehicle.name}:`, cleanUrl);
        }
        else {
            console.log(`Media URL already exists for vehicle ${vehicle.name}:`, cleanUrl);
        }
        vehicle.updatedAt = new Date();
        const savedVehicle = await vehicle.save();
        return {
            ...savedVehicle.toObject(),
            mediaUrls: this.normalizeMediaUrls(savedVehicle.mediaUrls)
        };
    }
    getTransmissions() {
        return this.TRANSMISSIONS;
    }
    getFuels() {
        return this.FUELS;
    }
    getBodyTypes() {
        return this.BODY_TYPES;
    }
    getEquipments() {
        return this.EQUIPMENTS;
    }
    getYears() {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear; year >= 1970; year--) {
            years.push(year);
        }
        return years;
    }
    async getManagerAgencyId(userId) {
        var _a;
        try {
            const agency = await this.agencyModel.findOne({ managerId: userId });
            return ((_a = agency === null || agency === void 0 ? void 0 : agency._id) === null || _a === void 0 ? void 0 : _a.toString()) || null;
        }
        catch (err) {
            console.error('Erreur lors de la recherche de l\'agence du manager:', err);
            return null;
        }
    }
    async findByManager(userId) {
        const agencyId = await this.getManagerAgencyId(userId);
        if (!agencyId) {
            return [];
        }
        const vehicles = await this.vehicleModel
            .find({ agencyId, isActive: { $ne: false } })
            .populate('agencyId')
            .lean()
            .exec();
        return vehicles.map(vehicle => {
            const transformedVehicle = {
                ...vehicle,
            };
            if (vehicle.mediaUrls && vehicle.mediaUrls.length > 0) {
                transformedVehicle.mediaUrls = this.normalizeMediaUrls(vehicle.mediaUrls);
            }
            return transformedVehicle;
        });
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Vehicle')),
    __param(1, (0, mongoose_1.InjectModel)('Agency')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], VehiclesService);
