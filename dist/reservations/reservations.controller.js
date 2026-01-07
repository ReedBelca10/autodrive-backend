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
exports.ReservationsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const reservations_service_1 = require("./reservations.service");
let ReservationsController = class ReservationsController {
    constructor(reservationsService) {
        this.reservationsService = reservationsService;
    }
    async getAllReservationsAdmin(req) {
        const user = req.user;
        const userRole = user === null || user === void 0 ? void 0 : user.role;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (userRole === 'admin') {
            return await this.reservationsService.findAllWithDetails();
        }
        if (userRole === 'manager') {
            return await this.reservationsService.findAllByManager(userId);
        }
        throw new common_1.ForbiddenException('Accès réservé aux administrateurs et managers');
    }
    async findAll(req) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé');
        return await this.reservationsService.findByUserId(userId);
    }
    async findById(id) {
        return await this.reservationsService.findById(id);
    }
    async create(reservationData, req) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé');
        return await this.reservationsService.create({
            ...reservationData,
            userId
        });
    }
    async cancelReservation(id, req) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé');
        return await this.reservationsService.cancelReservation(id, userId);
    }
    async confirmReservation(id, req) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé');
        return await this.reservationsService.confirmReservation(id, userId);
    }
    async archiveReservation(id, req) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        const userRole = user === null || user === void 0 ? void 0 : user.role;
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé');
        return await this.reservationsService.archiveReservation(id, userId, userRole);
    }
    async delete(id, req) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        const userRole = user === null || user === void 0 ? void 0 : user.role;
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé');
        return await this.reservationsService.delete(id, userId, userRole);
    }
    async createPaymentIntent(id, body, req) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé');
        const gateway = (body === null || body === void 0 ? void 0 : body.gateway) || 'stripe';
        return await this.reservationsService.createPaymentIntent(id, userId, gateway);
    }
    async confirmPayment(id, paymentIntentId, req) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé');
        return await this.reservationsService.verifyPaymentAndConfirm(id, userId, paymentIntentId);
    }
    async confirmFedapayPayment(id, body, req) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé');
        if (!(body === null || body === void 0 ? void 0 : body.transactionId))
            throw new common_1.BadRequestException('Transaction ID manquant');
        return await this.reservationsService.verifyFedapayPayment(id, userId, body.transactionId);
    }
    async handleFedapayCallback(payload) {
        return await this.reservationsService.handleFedapayCallback(payload);
    }
    async getFedapayPaymentStatus(id, req) {
        const user = req.user;
        const userId = (user === null || user === void 0 ? void 0 : user.userId) || (user === null || user === void 0 ? void 0 : user.sub) || (user === null || user === void 0 ? void 0 : user.id);
        if (!userId)
            throw new common_1.BadRequestException('Utilisateur non trouvé');
        return await this.reservationsService.getFedapayPaymentStatus(id, userId);
    }
};
exports.ReservationsController = ReservationsController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('admin/all'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getAllReservationsAdmin", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "findById", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "cancelReservation", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)(':id/confirm'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "confirmReservation", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)(':id/archive'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "archiveReservation", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "delete", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(':id/payment-intent'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "createPaymentIntent", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(':id/confirm-payment'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('paymentIntentId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "confirmPayment", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(':id/confirm-fedapay'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "confirmFedapayPayment", null);
__decorate([
    (0, common_1.Post)('fedapay-callback'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "handleFedapayCallback", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(':id/fedapay-status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReservationsController.prototype, "getFedapayPaymentStatus", null);
exports.ReservationsController = ReservationsController = __decorate([
    (0, common_1.Controller)('reservations'),
    __metadata("design:paramtypes", [reservations_service_1.ReservationsService])
], ReservationsController);
