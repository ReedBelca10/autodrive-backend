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
exports.ReservationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const stripe_1 = require("stripe");
const fedapay_service_1 = require("../payments/fedapay.service");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-12-15.clover',
});
let ReservationsService = class ReservationsService {
    constructor(reservationModel, vehicleModel, agencyModel, fedapayService) {
        this.reservationModel = reservationModel;
        this.vehicleModel = vehicleModel;
        this.agencyModel = agencyModel;
        this.fedapayService = fedapayService;
    }
    async findAll() {
        return await this.reservationModel
            .find()
            .populate('userId vehicleId')
            .exec();
    }
    async findAllWithDetails() {
        const reservations = await this.reservationModel
            .find()
            .populate({
            path: 'userId',
            select: 'firstName lastName email phone'
        })
            .populate({
            path: 'vehicleId',
            select: 'brand model dailyRate'
        })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return reservations.map((res) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            return ({
                _id: res._id.toString(),
                userId: ((_b = (_a = res.userId) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || res.userId,
                vehicleId: ((_d = (_c = res.vehicleId) === null || _c === void 0 ? void 0 : _c._id) === null || _d === void 0 ? void 0 : _d.toString()) || res.vehicleId,
                userName: `${((_e = res.userId) === null || _e === void 0 ? void 0 : _e.firstName) || ''} ${((_f = res.userId) === null || _f === void 0 ? void 0 : _f.lastName) || ''}`.trim() || 'N/A',
                userEmail: ((_g = res.userId) === null || _g === void 0 ? void 0 : _g.email) || 'N/A',
                vehicleName: `${((_h = res.vehicleId) === null || _h === void 0 ? void 0 : _h.brand) || ''} ${((_j = res.vehicleId) === null || _j === void 0 ? void 0 : _j.model) || ''}`.trim() || 'N/A',
                pickupLocation: res.pickupLocation || 'N/A',
                returnLocation: res.returnLocation || 'N/A',
                startDate: ((_l = (_k = res.startDate) === null || _k === void 0 ? void 0 : _k.toISOString) === null || _l === void 0 ? void 0 : _l.call(_k)) || res.startDate,
                returnDate: ((_o = (_m = res.returnDate) === null || _m === void 0 ? void 0 : _m.toISOString) === null || _o === void 0 ? void 0 : _o.call(_m)) || res.returnDate,
                status: res.status,
                paymentStatus: res.paymentStatus || 'pending',
                paymentMethod: res.paymentMethod || 'none',
                totalPrice: res.totalPrice,
                createdAt: ((_q = (_p = res.createdAt) === null || _p === void 0 ? void 0 : _p.toISOString) === null || _q === void 0 ? void 0 : _q.call(_p)) || res.createdAt,
            });
        });
    }
    async findAllByManager(userId) {
        const agency = await this.agencyModel.findOne({ managerId: userId }).exec();
        if (!agency) {
            return [];
        }
        const vehicles = await this.vehicleModel.find({ agencyId: agency._id }).exec();
        const vehicleIds = vehicles.map(v => v._id);
        const reservations = await this.reservationModel
            .find({ vehicleId: { $in: vehicleIds } })
            .populate({
            path: 'userId',
            select: 'firstName lastName email phone'
        })
            .populate({
            path: 'vehicleId',
            select: 'brand model dailyRate'
        })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return reservations.map((res) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            return ({
                _id: res._id.toString(),
                userId: ((_b = (_a = res.userId) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || res.userId,
                vehicleId: ((_d = (_c = res.vehicleId) === null || _c === void 0 ? void 0 : _c._id) === null || _d === void 0 ? void 0 : _d.toString()) || res.vehicleId,
                userName: `${((_e = res.userId) === null || _e === void 0 ? void 0 : _e.firstName) || ''} ${((_f = res.userId) === null || _f === void 0 ? void 0 : _f.lastName) || ''}`.trim() || 'N/A',
                userEmail: ((_g = res.userId) === null || _g === void 0 ? void 0 : _g.email) || 'N/A',
                vehicleName: `${((_h = res.vehicleId) === null || _h === void 0 ? void 0 : _h.brand) || ''} ${((_j = res.vehicleId) === null || _j === void 0 ? void 0 : _j.model) || ''}`.trim() || 'N/A',
                pickupLocation: res.pickupLocation || 'N/A',
                returnLocation: res.returnLocation || 'N/A',
                startDate: ((_l = (_k = res.startDate) === null || _k === void 0 ? void 0 : _k.toISOString) === null || _l === void 0 ? void 0 : _l.call(_k)) || res.startDate,
                returnDate: ((_o = (_m = res.returnDate) === null || _m === void 0 ? void 0 : _m.toISOString) === null || _o === void 0 ? void 0 : _o.call(_m)) || res.returnDate,
                status: res.status,
                paymentStatus: res.paymentStatus || 'pending',
                paymentMethod: res.paymentMethod || 'none',
                totalPrice: res.totalPrice,
                createdAt: ((_q = (_p = res.createdAt) === null || _p === void 0 ? void 0 : _p.toISOString) === null || _q === void 0 ? void 0 : _q.call(_p)) || res.createdAt,
            });
        });
    }
    async findByUserId(userId) {
        const reservations = await this.reservationModel
            .find({ userId })
            .populate({
            path: 'vehicleId',
            select: '_id name brand model year dailyRate bodyType mediaUrls'
        })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        return reservations.map((res) => {
            var _a, _b, _c, _d, _e, _f, _g;
            const vehicle = res.vehicleId || {};
            const vehicleName = vehicle.name || `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'N/A';
            return {
                _id: res._id.toString(),
                vehicleId: {
                    _id: (_a = vehicle._id) === null || _a === void 0 ? void 0 : _a.toString(),
                    name: vehicleName,
                    brand: vehicle.brand || 'N/A',
                    model: vehicle.model || 'N/A',
                    year: vehicle.year || null,
                    dailyRate: vehicle.dailyRate || 0,
                    bodyType: vehicle.bodyType || 'N/A',
                    mediaUrls: vehicle.mediaUrls || [],
                },
                firstName: res.firstName || 'N/A',
                lastName: res.lastName || 'N/A',
                email: res.email || 'N/A',
                phone: res.phone || 'N/A',
                startDate: ((_c = (_b = res.startDate) === null || _b === void 0 ? void 0 : _b.toISOString) === null || _c === void 0 ? void 0 : _c.call(_b)) || res.startDate,
                returnDate: ((_e = (_d = res.returnDate) === null || _d === void 0 ? void 0 : _d.toISOString) === null || _e === void 0 ? void 0 : _e.call(_d)) || res.returnDate,
                status: res.status,
                paymentStatus: res.paymentStatus || 'pending',
                paymentGateway: res.paymentGateway || 'stripe',
                totalPrice: res.totalPrice,
                pickupLocation: res.pickupLocation || 'N/A',
                returnLocation: res.returnLocation || 'N/A',
                insuranceOption: res.insuranceOption || 'basic',
                createdAt: ((_g = (_f = res.createdAt) === null || _f === void 0 ? void 0 : _f.toISOString) === null || _g === void 0 ? void 0 : _g.call(_f)) || res.createdAt,
            };
        });
    }
    async findById(id) {
        const reservation = await this.reservationModel
            .findById(id)
            .populate('userId vehicleId')
            .exec();
        if (!reservation) {
            throw new common_1.NotFoundException('Réservation non trouvée');
        }
        return reservation;
    }
    async create(reservationData) {
        const startDate = new Date(reservationData.startDate);
        const returnDate = new Date(reservationData.returnDate);
        if (startDate >= returnDate) {
            throw new common_1.BadRequestException('La date de retour doit être après la date de départ');
        }
        if (startDate < new Date()) {
            throw new common_1.BadRequestException('La date de départ ne peut pas être dans le passé');
        }
        const vehicle = await this.vehicleModel.findById(reservationData.vehicleId).exec();
        if (!vehicle) {
            throw new common_1.NotFoundException('Véhicule non trouvé');
        }
        let userIdObj;
        try {
            userIdObj = new mongoose_2.Types.ObjectId(reservationData.userId);
        }
        catch (e) {
            userIdObj = reservationData.userId;
        }
        const startDateMin = new Date(startDate.getTime() - 60000);
        const startDateMax = new Date(startDate.getTime() + 60000);
        const returnDateMin = new Date(returnDate.getTime() - 60000);
        const returnDateMax = new Date(returnDate.getTime() + 60000);
        const existingPending = await this.reservationModel.findOne({
            userId: userIdObj,
            vehicleId: reservationData.vehicleId,
            startDate: { $gte: startDateMin, $lte: startDateMax },
            returnDate: { $gte: returnDateMin, $lte: returnDateMax },
            status: 'pending'
        }).exec();
        if (existingPending) {
            console.log(`Réutilisation d'une réservation pending existante: ${existingPending._id}`);
            return existingPending;
        }
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const existingReservations = await this.reservationModel.find({
            vehicleId: reservationData.vehicleId,
            userId: { $ne: userIdObj },
            $or: [
                { status: 'confirmed' },
                {
                    status: 'pending',
                    createdAt: { $gt: thirtyMinutesAgo }
                }
            ],
            startDate: { $lt: returnDate },
            returnDate: { $gt: startDate }
        }).exec();
        if (existingReservations.length > 0) {
            console.log('Conflits détectés:', existingReservations.map(r => ({
                id: r._id,
                status: r.status,
                userId: r.userId
            })));
            throw new common_1.BadRequestException('Le véhicule n\'est pas disponible pour ces dates');
        }
        const daysCount = Math.ceil((returnDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const pricePerDay = vehicle.dailyRate || vehicle.pricePerDay || 50;
        let basePrice = daysCount * pricePerDay;
        if (reservationData.insuranceOption === 'premium') {
            basePrice += (daysCount * 15000);
        }
        const totalPrice = basePrice;
        const reservation = new this.reservationModel({
            ...reservationData,
            totalPrice,
            status: 'pending'
        });
        return await reservation.save();
    }
    async confirmReservation(id, userId) {
        const reservation = await this.reservationModel.findById(id).populate('vehicleId').exec();
        if (!reservation) {
            throw new common_1.NotFoundException('Réservation non trouvée');
        }
        const isOwner = reservation.userId.toString() === userId;
        let isManager = false;
        if (!isOwner && reservation.vehicleId) {
            const vehicle = reservation.vehicleId;
            const agency = await this.agencyModel.findById(vehicle.agencyId).exec();
            if (agency && agency.managerId.toString() === userId) {
                isManager = true;
            }
        }
        if (!isOwner && !isManager) {
            throw new common_1.BadRequestException('Non autorisé à confirmer cette réservation');
        }
        reservation.status = 'confirmed';
        await this.vehicleModel.findByIdAndUpdate(reservation.vehicleId, { status: 'reserved' }, { new: true }).exec();
        return await reservation.save();
    }
    async cancelReservation(id, userId) {
        const reservation = await this.reservationModel.findById(id).exec();
        if (!reservation) {
            throw new common_1.NotFoundException('Réservation non trouvée');
        }
        if (reservation.userId.toString() !== userId) {
            throw new common_1.BadRequestException('Non autorisé à annuler cette réservation');
        }
        if (reservation.status !== 'pending') {
            throw new common_1.BadRequestException('Seules les réservations en attente peuvent être annulées');
        }
        if (reservation.status === 'cancelled') {
            throw new common_1.BadRequestException('Cette réservation est déjà annulée');
        }
        reservation.status = 'cancelled';
        const hasOtherReservations = await this.reservationModel.findOne({
            vehicleId: reservation.vehicleId,
            status: 'confirmed',
            _id: { $ne: id }
        }).exec();
        if (!hasOtherReservations) {
            await this.vehicleModel.findByIdAndUpdate(reservation.vehicleId, { status: 'available' }, { new: true }).exec();
        }
        return await reservation.save();
    }
    async archiveReservation(id, userId, userRole) {
        const reservation = await this.reservationModel.findById(id).populate('vehicleId').exec();
        if (!reservation) {
            throw new common_1.NotFoundException('Réservation non trouvée');
        }
        let canArchive = false;
        if (userRole === 'admin') {
            canArchive = true;
        }
        else if (userRole === 'manager') {
            const vehicle = reservation.vehicleId;
            const agency = await this.agencyModel.findById(vehicle.agencyId).exec();
            if (agency && agency.managerId.toString() === userId) {
                canArchive = true;
            }
        }
        if (!canArchive) {
            throw new common_1.BadRequestException('Non autorisé à archiver cette réservation');
        }
        reservation.archived = true;
        reservation.archivedAt = new Date();
        return await reservation.save();
    }
    async delete(id, userId, userRole) {
        const reservation = await this.reservationModel.findById(id).exec();
        if (!reservation) {
            throw new common_1.NotFoundException('Réservation non trouvée');
        }
        if (userRole !== 'admin') {
            throw new common_1.BadRequestException('Seuls les administrateurs peuvent supprimer une réservation');
        }
        return await this.reservationModel.findByIdAndDelete(id).exec();
    }
    async updateStatus(id, status) {
        return await this.reservationModel
            .findByIdAndUpdate(id, { status }, { new: true })
            .exec();
    }
    async createPaymentIntent(id, userId, gateway = 'stripe') {
        const reservation = await this.reservationModel.findById(id).exec();
        if (!reservation)
            throw new common_1.NotFoundException('Réservation non trouvée');
        if (reservation.userId.toString() !== userId)
            throw new common_1.BadRequestException('Non autorisé');
        reservation.paymentGateway = gateway;
        if (gateway === 'fedapay') {
            const transaction = await this.fedapayService.createTransaction(reservation.totalPrice, `Réservation véhicule - ${id}`, { reservationId: id });
            reservation.fedapayTransactionId = transaction.transactionId;
            await reservation.save();
            return {
                transactionId: transaction.transactionId,
                token: transaction.token,
                paymentUrl: transaction.paymentUrl,
            };
        }
        else {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: reservation.totalPrice * 100,
                currency: 'xof',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    reservationId: id
                }
            });
            reservation.paymentIntentId = paymentIntent.id;
            await reservation.save();
            return {
                clientSecret: paymentIntent.client_secret,
            };
        }
    }
    async verifyPaymentAndConfirm(id, userId, paymentIntentId) {
        const reservation = await this.reservationModel.findById(id).exec();
        if (!reservation)
            throw new common_1.NotFoundException('Réservation non trouvée');
        if (reservation.userId.toString() !== userId)
            throw new common_1.BadRequestException('Non autorisé');
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status === 'succeeded') {
            reservation.paymentStatus = 'paid';
            reservation.status = 'confirmed';
            await this.vehicleModel.findByIdAndUpdate(reservation.vehicleId, { status: 'reserved' }, { new: true }).exec();
            await reservation.save();
            return { success: true, reservation };
        }
        else {
            throw new common_1.BadRequestException('Le paiement n\'a pas été validé');
        }
    }
    async verifyFedapayPayment(id, userId, transactionId) {
        const reservation = await this.reservationModel.findById(id).exec();
        if (!reservation)
            throw new common_1.NotFoundException('Réservation non trouvée');
        if (reservation.userId.toString() !== userId)
            throw new common_1.BadRequestException('Non autorisé');
        const isVerified = await this.fedapayService.verifyTransaction(transactionId);
        if (isVerified) {
            reservation.paymentStatus = 'paid';
            reservation.status = 'confirmed';
            await this.vehicleModel.findByIdAndUpdate(reservation.vehicleId, { status: 'reserved' }, { new: true }).exec();
            await reservation.save();
            return { success: true, reservation };
        }
        else {
            throw new common_1.BadRequestException('Le paiement n\'a pas été validé');
        }
    }
    async handleFedapayCallback(payload) {
        var _a, _b;
        try {
            const transactionId = ((_a = payload.transaction) === null || _a === void 0 ? void 0 : _a.id) || payload.id;
            const status = ((_b = payload.transaction) === null || _b === void 0 ? void 0 : _b.status) || payload.status;
            if (!transactionId) {
                throw new common_1.BadRequestException('Transaction ID manquant dans le callback');
            }
            const reservation = await this.reservationModel.findOne({
                fedapayTransactionId: transactionId
            }).exec();
            if (!reservation) {
                throw new common_1.NotFoundException(`Réservation non trouvée pour la transaction ${transactionId}`);
            }
            if (status === 'approved') {
                reservation.paymentStatus = 'paid';
                reservation.status = 'confirmed';
                await this.vehicleModel.findByIdAndUpdate(reservation.vehicleId, { status: 'reserved' }, { new: true }).exec();
            }
            else if (status === 'declined' || status === 'canceled') {
                reservation.paymentStatus = 'failed';
                reservation.status = 'cancelled';
            }
            await reservation.save();
            return { success: true, reservation };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Erreur lors du traitement du callback: ${error.message}`);
        }
    }
    async getFedapayPaymentStatus(id, userId) {
        const reservation = await this.reservationModel.findById(id).exec();
        if (!reservation)
            throw new common_1.NotFoundException('Réservation non trouvée');
        if (reservation.userId.toString() !== userId)
            throw new common_1.BadRequestException('Non autorisé');
        if (!reservation.fedapayTransactionId) {
            throw new common_1.BadRequestException('Aucune transaction FedaPay associée à cette réservation');
        }
        try {
            const transactionStatus = await this.fedapayService.getTransactionStatus(reservation.fedapayTransactionId);
            if (transactionStatus.status === 'approved' && reservation.paymentStatus !== 'paid') {
                reservation.paymentStatus = 'paid';
                reservation.status = 'confirmed';
                await this.vehicleModel.findByIdAndUpdate(reservation.vehicleId, { status: 'reserved' }, { new: true }).exec();
                await reservation.save();
            }
            return {
                reservationId: id,
                transactionId: reservation.fedapayTransactionId,
                transactionStatus: transactionStatus.status,
                paymentStatus: reservation.paymentStatus,
                reservationStatus: reservation.status,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Erreur lors de la vérification du statut: ${error.message}`);
        }
    }
};
exports.ReservationsService = ReservationsService;
exports.ReservationsService = ReservationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)('Reservation')),
    __param(1, (0, mongoose_1.InjectModel)('Vehicle')),
    __param(2, (0, mongoose_1.InjectModel)('Agency')),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        fedapay_service_1.FedapayService])
], ReservationsService);
