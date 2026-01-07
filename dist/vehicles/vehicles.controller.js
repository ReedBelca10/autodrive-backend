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
exports.VehiclesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const passport_1 = require("@nestjs/passport");
const vehicles_service_1 = require("./vehicles.service");
const vehicles_upload_service_1 = require("./vehicles-upload.service");
const vehicle_dto_1 = require("./dtos/vehicle.dto");
let VehiclesController = class VehiclesController {
    constructor(vehiclesService, uploadService) {
        this.vehiclesService = vehiclesService;
        this.uploadService = uploadService;
    }
    getTransmissions() {
        return this.vehiclesService.getTransmissions();
    }
    getFuels() {
        return this.vehiclesService.getFuels();
    }
    getBodyTypes() {
        return this.vehiclesService.getBodyTypes();
    }
    getEquipments() {
        return this.vehiclesService.getEquipments();
    }
    getYears() {
        return this.vehiclesService.getYears();
    }
    async getManagerVehicles(req) {
        const user = req.user;
        const userRole = user === null || user === void 0 ? void 0 : user.role;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (userRole !== 'manager') {
            throw new common_1.ForbiddenException('Seuls les managers peuvent accéder à cette route');
        }
        return await this.vehiclesService.findByManager(userId);
    }
    async findAll() {
        try {
            const vehicles = await this.vehiclesService.findAll();
            return vehicles;
        }
        catch (err) {
            console.error('Erreur lors de la récupération des véhicules:', err);
            throw err;
        }
    }
    async findById(id) {
        try {
            if (!id || id.length < 24) {
                throw new common_1.BadRequestException('ID de véhicule invalide');
            }
            const vehicle = await this.vehiclesService.findById(id);
            if (!vehicle) {
                throw new common_1.NotFoundException('Véhicule non trouvé');
            }
            return vehicle;
        }
        catch (err) {
            if (err.response)
                throw err;
            console.error('Erreur lors de la récupération du véhicule:', err);
            throw new common_1.NotFoundException('Véhicule non trouvé');
        }
    }
    async create(createVehicleDto, req) {
        try {
            const user = req.user;
            const userRole = user === null || user === void 0 ? void 0 : user.role;
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
            if (userRole === 'admin' && createVehicleDto.agencyId) {
                return await this.vehiclesService.create(createVehicleDto);
            }
            if (userRole === 'manager') {
                const agencyId = await this.vehiclesService.getManagerAgencyId(userId);
                if (!agencyId) {
                    throw new common_1.ForbiddenException('Vous ne gérez pas d\'agence');
                }
                return await this.vehiclesService.create({
                    ...createVehicleDto,
                    agencyId,
                });
            }
            throw new common_1.ForbiddenException('Seuls les administrateurs et managers peuvent créer des véhicules');
        }
        catch (err) {
            console.error('Erreur lors de la création du véhicule:', err);
            if (err instanceof common_1.ForbiddenException || err instanceof common_1.BadRequestException) {
                throw err;
            }
            throw new common_1.BadRequestException(err.message);
        }
    }
    async update(id, updateVehicleDto, req) {
        var _a;
        try {
            const user = req.user;
            const userRole = user === null || user === void 0 ? void 0 : user.role;
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
            if (userRole === 'admin') {
                return await this.vehiclesService.update(id, updateVehicleDto);
            }
            if (userRole === 'manager') {
                const agencyId = await this.vehiclesService.getManagerAgencyId(userId);
                if (!agencyId) {
                    throw new common_1.ForbiddenException('Vous ne gérez pas d\'agence');
                }
                const vehicle = await this.vehiclesService.findById(id);
                if (((_a = vehicle.agencyId) === null || _a === void 0 ? void 0 : _a.toString()) !== agencyId.toString()) {
                    throw new common_1.ForbiddenException('Vous ne pouvez mettre à jour que vos propres véhicules');
                }
                return await this.vehiclesService.update(id, updateVehicleDto);
            }
            throw new common_1.ForbiddenException('Seuls les administrateurs et managers peuvent mettre à jour des véhicules');
        }
        catch (err) {
            console.error('Erreur lors de la mise à jour du véhicule:', err);
            if (err instanceof common_1.ForbiddenException || err instanceof common_1.BadRequestException) {
                throw err;
            }
            throw new common_1.BadRequestException(err.message);
        }
    }
    async delete(id, req) {
        var _a;
        try {
            const user = req.user;
            const userRole = user === null || user === void 0 ? void 0 : user.role;
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
            if (userRole === 'admin') {
                return await this.vehiclesService.delete(id);
            }
            if (userRole === 'manager') {
                const agencyId = await this.vehiclesService.getManagerAgencyId(userId);
                if (!agencyId) {
                    throw new common_1.ForbiddenException('Vous ne gérez pas d\'agence');
                }
                const vehicle = await this.vehiclesService.findById(id);
                if (((_a = vehicle.agencyId) === null || _a === void 0 ? void 0 : _a.toString()) !== agencyId.toString()) {
                    throw new common_1.ForbiddenException('Vous ne pouvez supprimer que vos propres véhicules');
                }
                return await this.vehiclesService.delete(id);
            }
            throw new common_1.ForbiddenException('Seuls les administrateurs et managers peuvent supprimer des véhicules');
        }
        catch (err) {
            console.error('Erreur lors de la suppression du véhicule:', err);
            if (err instanceof common_1.ForbiddenException || err instanceof common_1.BadRequestException) {
                throw err;
            }
            throw new common_1.BadRequestException(err.message);
        }
    }
    async toggleStatus(id, req) {
        var _a;
        try {
            const user = req.user;
            const userRole = user === null || user === void 0 ? void 0 : user.role;
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
            if (userRole === 'admin') {
                return await this.vehiclesService.toggleStatus(id);
            }
            if (userRole === 'manager') {
                const agencyId = await this.vehiclesService.getManagerAgencyId(userId);
                if (!agencyId) {
                    throw new common_1.ForbiddenException('Vous ne gérez pas d\'agence');
                }
                const vehicle = await this.vehiclesService.findById(id);
                if (((_a = vehicle.agencyId) === null || _a === void 0 ? void 0 : _a.toString()) !== agencyId.toString()) {
                    throw new common_1.ForbiddenException('Vous ne pouvez basculer l\'état que de vos propres véhicules');
                }
                return await this.vehiclesService.toggleStatus(id);
            }
            throw new common_1.ForbiddenException('Seuls les administrateurs et managers peuvent basculer l\'état des véhicules');
        }
        catch (err) {
            console.error('Erreur lors du basculement de l\'état du véhicule:', err);
            if (err instanceof common_1.ForbiddenException || err instanceof common_1.BadRequestException) {
                throw err;
            }
            throw new common_1.BadRequestException(err.message);
        }
    }
    async uploadMedia(file, req) {
        try {
            const user = req.user;
            const userRole = user === null || user === void 0 ? void 0 : user.role;
            if (userRole !== 'admin' && userRole !== 'manager') {
                throw new common_1.ForbiddenException('Seuls les administrateurs et managers peuvent uploader des médias');
            }
            if (!file) {
                console.error('❌ Aucun fichier fourni');
                throw new common_1.BadRequestException('Aucun fichier fourni');
            }
            console.log(`📄 Fichier reçu: ${file.originalname}`);
            console.log(`   Taille: ${(file.size / 1024).toFixed(2)} KB`);
            console.log(`   Type: ${file.mimetype}`);
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'video/mp4',
            ];
            if (!allowedTypes.includes(file.mimetype)) {
                console.error(`❌ Type de fichier invalide: ${file.mimetype}`);
                throw new common_1.BadRequestException(`Type de fichier non supporté: ${file.mimetype}`);
            }
            const maxTaille = 10 * 1024 * 1024;
            if (file.size > maxTaille) {
                console.error(`❌ Fichier trop volumineux: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
                throw new common_1.BadRequestException('Fichier trop volumineux (max 10 MB)');
            }
            const timestamp = Date.now();
            const random = Math.random().toString(36).substring(7);
            const originalNameWithoutExt = file.originalname.replace(/\.[^/.]+$/, '');
            const ext = file.originalname.split('.').pop();
            const fileName = `${timestamp}_${random}_${originalNameWithoutExt}.${ext}`;
            console.log(`🔄 Traitement du fichier en tant que: ${fileName}`);
            const publicUrl = await this.uploadService.uploadMediaFile(file, fileName);
            console.log(`✅ Téléchargement multimédia réussi`);
            console.log(`   URL: ${publicUrl}`);
            return {
                success: true,
                publicUrl,
                fileName,
            };
        }
        catch (err) {
            console.error('❌ Erreur du point de terminaison de téléchargement:', err);
            if (err instanceof common_1.BadRequestException) {
                throw err;
            }
            throw new common_1.BadRequestException(err.message || 'Erreur lors du téléchargement du fichier');
        }
    }
    async addMediaToVehicle(id, body, req) {
        var _a;
        try {
            const user = req.user;
            const userRole = user === null || user === void 0 ? void 0 : user.role;
            const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
            if (userRole === 'admin') {
            }
            else if (userRole === 'manager') {
                const agencyId = await this.vehiclesService.getManagerAgencyId(userId);
                if (!agencyId) {
                    throw new common_1.ForbiddenException('Vous ne gérez pas d\'agence');
                }
                const vehicle = await this.vehiclesService.findById(id);
                if (((_a = vehicle.agencyId) === null || _a === void 0 ? void 0 : _a.toString()) !== agencyId.toString()) {
                    throw new common_1.ForbiddenException('Vous ne pouvez ajouter des médias qu\'à vos propres véhicules');
                }
            }
            else {
                throw new common_1.ForbiddenException('Seuls les administrateurs et managers peuvent ajouter des médias');
            }
            if (!body.mediaUrl) {
                throw new common_1.BadRequestException('mediaUrl est requis');
            }
            const result = await this.vehiclesService.addMediaUrl(id, body.mediaUrl);
            console.log(`Media added to vehicle ${id}`);
            return result;
        }
        catch (err) {
            console.error('Erreur lors de l\'ajout de médias au véhicule:', err);
            if (err instanceof common_1.ForbiddenException || err instanceof common_1.BadRequestException) {
                throw err;
            }
            throw new common_1.BadRequestException(err.message);
        }
    }
};
exports.VehiclesController = VehiclesController;
__decorate([
    (0, common_1.Get)('config/transmissions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "getTransmissions", null);
__decorate([
    (0, common_1.Get)('config/fuels'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "getFuels", null);
__decorate([
    (0, common_1.Get)('config/body-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "getBodyTypes", null);
__decorate([
    (0, common_1.Get)('config/equipments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "getEquipments", null);
__decorate([
    (0, common_1.Get)('config/years'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiclesController.prototype, "getYears", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('manager/my-vehicles'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "getManagerVehicles", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "findById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vehicle_dto_1.CreateVehicleDto, Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, vehicle_dto_1.UpdateVehicleDto, Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)(':id/toggle-status'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "toggleStatus", null);
__decorate([
    (0, common_1.Post)('upload/media'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "uploadMedia", null);
__decorate([
    (0, common_1.Post)(':id/add-media'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], VehiclesController.prototype, "addMediaToVehicle", null);
exports.VehiclesController = VehiclesController = __decorate([
    (0, common_1.Controller)('vehicles'),
    __metadata("design:paramtypes", [vehicles_service_1.VehiclesService,
        vehicles_upload_service_1.VehiclesUploadService])
], VehiclesController);
