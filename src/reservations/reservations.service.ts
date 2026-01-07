import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import Stripe from 'stripe';
import { FedapayService } from '../payments/fedapay.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

@Injectable()
export class ReservationsService {
  constructor(
    @InjectModel('Reservation') private reservationModel: Model<any>,
    @InjectModel('Vehicle') private vehicleModel: Model<any>,
    @InjectModel('Agency') private agencyModel: Model<any>,
    private fedapayService: FedapayService,
  ) { }

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

    // Transformer les données pour le frontend
    return reservations.map((res: any) => ({
      _id: res._id.toString(),
      userId: res.userId?._id?.toString() || res.userId,
      vehicleId: res.vehicleId?._id?.toString() || res.vehicleId,
      userName: `${res.userId?.firstName || ''} ${res.userId?.lastName || ''}`.trim() || 'N/A',
      userEmail: res.userId?.email || 'N/A',
      vehicleName: `${res.vehicleId?.brand || ''} ${res.vehicleId?.model || ''}`.trim() || 'N/A',
      pickupLocation: res.pickupLocation || 'N/A',
      returnLocation: res.returnLocation || 'N/A',
      startDate: res.startDate?.toISOString?.() || res.startDate,
      returnDate: res.returnDate?.toISOString?.() || res.returnDate,
      status: res.status,
      paymentStatus: res.paymentStatus || 'pending',
      paymentMethod: res.paymentMethod || 'none',
      totalPrice: res.totalPrice,
      createdAt: res.createdAt?.toISOString?.() || res.createdAt,
    }));
  }

  async findAllByManager(userId: string) {
    // Trouver l'agencyId du manager
    const agency = await this.agencyModel.findOne({ managerId: userId }).exec();
    if (!agency) {
      return [];
    }

    // Récupérer tous les véhicules de cette agence
    const vehicles = await this.vehicleModel.find({ agencyId: agency._id }).exec();
    const vehicleIds = vehicles.map(v => v._id);

    // Récupérer les réservations pour ces véhicules
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

    // Transformer les données pour le frontend
    return reservations.map((res: any) => ({
      _id: res._id.toString(),
      userId: res.userId?._id?.toString() || res.userId,
      vehicleId: res.vehicleId?._id?.toString() || res.vehicleId,
      userName: `${res.userId?.firstName || ''} ${res.userId?.lastName || ''}`.trim() || 'N/A',
      userEmail: res.userId?.email || 'N/A',
      vehicleName: `${res.vehicleId?.brand || ''} ${res.vehicleId?.model || ''}`.trim() || 'N/A',
      pickupLocation: res.pickupLocation || 'N/A',
      returnLocation: res.returnLocation || 'N/A',
      startDate: res.startDate?.toISOString?.() || res.startDate,
      returnDate: res.returnDate?.toISOString?.() || res.returnDate,
      status: res.status,
      paymentStatus: res.paymentStatus || 'pending',
      paymentMethod: res.paymentMethod || 'none',
      totalPrice: res.totalPrice,
      createdAt: res.createdAt?.toISOString?.() || res.createdAt,
    }));
  }

  async findByUserId(userId: string) {
    const reservations = await this.reservationModel
      .find({ userId })
      .populate({
        path: 'vehicleId',
        select: '_id name brand model year dailyRate bodyType mediaUrls'
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Transformer les données pour le frontend
    return reservations.map((res: any) => {
      const vehicle = res.vehicleId || {};
      const vehicleName = vehicle.name || `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'N/A';
      
      return {
        _id: res._id.toString(),
        vehicleId: {
          _id: vehicle._id?.toString(),
          name: vehicleName,
          brand: vehicle.brand || 'N/A',
          model: vehicle.model || 'N/A',
          year: vehicle.year || null,
          dailyRate: vehicle.dailyRate || 0,
          bodyType: vehicle.bodyType || 'N/A',
          mediaUrls: vehicle.mediaUrls || [],
        },
        // Infos personnelles stockées dans la réservation
        firstName: res.firstName || 'N/A',
        lastName: res.lastName || 'N/A',
        email: res.email || 'N/A',
        phone: res.phone || 'N/A',
        // Infos de la réservation
        startDate: res.startDate?.toISOString?.() || res.startDate,
        returnDate: res.returnDate?.toISOString?.() || res.returnDate,
        status: res.status,
        paymentStatus: res.paymentStatus || 'pending',
        paymentGateway: res.paymentGateway || 'stripe',
        totalPrice: res.totalPrice,
        pickupLocation: res.pickupLocation || 'N/A',
        returnLocation: res.returnLocation || 'N/A',
        insuranceOption: res.insuranceOption || 'basic',
        createdAt: res.createdAt?.toISOString?.() || res.createdAt,
      };
    });
  }

  async findById(id: string) {
    const reservation = await this.reservationModel
      .findById(id)
      .populate('userId vehicleId')
      .exec();

    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    return reservation;
  }

  async create(reservationData: any) {
    // Valider les dates
    const startDate = new Date(reservationData.startDate);
    const returnDate = new Date(reservationData.returnDate);

    if (startDate >= returnDate) {
      throw new BadRequestException('La date de retour doit être après la date de départ');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('La date de départ ne peut pas être dans le passé');
    }

    // Vérifier que le véhicule existe et est disponible
    const vehicle = await this.vehicleModel.findById(reservationData.vehicleId).exec();
    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    // Convertir l'ID utilisateur en ObjectId de manière sécurisée
    let userIdObj;
    try {
      userIdObj = new Types.ObjectId(reservationData.userId);
    } catch (e) {
      userIdObj = reservationData.userId;
    }

    // Vérifier si une réservation identique existe déjà pour cet utilisateur (évite les doublons)
    // Utilisation d'une plage horaire de 1 minute pour être moins strict sur l'égalité exacte des dates
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

    // Vérifier les conflits de réservation
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const existingReservations = await this.reservationModel.find({
      vehicleId: reservationData.vehicleId,
      userId: { $ne: userIdObj }, // Ignorer les réservations de l'utilisateur actuel
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
      throw new BadRequestException('Le véhicule n\'est pas disponible pour ces dates');
    }

    // Calculer le prix total
    const daysCount = Math.ceil((returnDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Fix: utilise dailyRate au lieu de pricePerDay si pricePerDay n'existe pas
    const pricePerDay = vehicle.dailyRate || vehicle.pricePerDay || 50;

    let basePrice = daysCount * pricePerDay;

    // Ajout cout assurance
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

  async confirmReservation(id: string, userId: string) {
    const reservation = await this.reservationModel.findById(id).populate('vehicleId').exec();

    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    // Vérifier que c'est le propriétaire de la réservation OU le manager du véhicule
    const isOwner = reservation.userId.toString() === userId;
    
    let isManager = false;
    if (!isOwner && reservation.vehicleId) {
      const vehicle: any = reservation.vehicleId;
      const agency = await this.agencyModel.findById(vehicle.agencyId).exec();
      if (agency && agency.managerId.toString() === userId) {
        isManager = true;
      }
    }

    if (!isOwner && !isManager) {
      throw new BadRequestException('Non autorisé à confirmer cette réservation');
    }

    reservation.status = 'confirmed';

    // Mettre à jour le statut du véhicule
    await this.vehicleModel.findByIdAndUpdate(
      reservation.vehicleId,
      { status: 'reserved' },
      { new: true }
    ).exec();

    return await reservation.save();
  }

  async cancelReservation(id: string, userId: string) {
    const reservation = await this.reservationModel.findById(id).exec();

    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    // Seulement le client (propriétaire) peut annuler sa réservation
    if (reservation.userId.toString() !== userId) {
      throw new BadRequestException('Non autorisé à annuler cette réservation');
    }

    // Peut seulement annuler si elle est en attente
    if (reservation.status !== 'pending') {
      throw new BadRequestException('Seules les réservations en attente peuvent être annulées');
    }

    if (reservation.status === 'cancelled') {
      throw new BadRequestException('Cette réservation est déjà annulée');
    }

    reservation.status = 'cancelled';

    // Remettre le véhicule en disponible si pas d'autres réservations
    const hasOtherReservations = await this.reservationModel.findOne({
      vehicleId: reservation.vehicleId,
      status: 'confirmed',
      _id: { $ne: id }
    }).exec();

    if (!hasOtherReservations) {
      await this.vehicleModel.findByIdAndUpdate(
        reservation.vehicleId,
        { status: 'available' },
        { new: true }
      ).exec();
    }

    return await reservation.save();
  }

  async archiveReservation(id: string, userId: string, userRole: string) {
    const reservation = await this.reservationModel.findById(id).populate('vehicleId').exec();

    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    // Vérifier les droits
    let canArchive = false;

    if (userRole === 'admin') {
      // Admin peut archiver n'importe quelle réservation
      canArchive = true;
    } else if (userRole === 'manager') {
      // Manager ne peut archiver que les réservations de ses véhicules
      const vehicle: any = reservation.vehicleId;
      const agency = await this.agencyModel.findById(vehicle.agencyId).exec();
      if (agency && agency.managerId.toString() === userId) {
        canArchive = true;
      }
    }

    if (!canArchive) {
      throw new BadRequestException('Non autorisé à archiver cette réservation');
    }

    reservation.archived = true;
    reservation.archivedAt = new Date();

    return await reservation.save();
  }

  async delete(id: string, userId: string, userRole: string) {
    const reservation = await this.reservationModel.findById(id).exec();

    if (!reservation) {
      throw new NotFoundException('Réservation non trouvée');
    }

    // Seulement l'admin peut supprimer
    if (userRole !== 'admin') {
      throw new BadRequestException('Seuls les administrateurs peuvent supprimer une réservation');
    }

    return await this.reservationModel.findByIdAndDelete(id).exec();
  }

  async updateStatus(id: string, status: string) {
    return await this.reservationModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
  }

  async createPaymentIntent(id: string, userId: string, gateway: 'stripe' | 'fedapay' = 'stripe') {
    const reservation = await this.reservationModel.findById(id).exec();
    if (!reservation) throw new NotFoundException('Réservation non trouvée');
    if (reservation.userId.toString() !== userId) throw new BadRequestException('Non autorisé');

    // Update payment gateway in reservation
    reservation.paymentGateway = gateway;

    if (gateway === 'fedapay') {
      const transaction = await this.fedapayService.createTransaction(
        reservation.totalPrice,
        `Réservation véhicule - ${id}`,
        { reservationId: id }
      );

      reservation.fedapayTransactionId = transaction.transactionId;
      await reservation.save();

      return {
        transactionId: transaction.transactionId,
        token: transaction.token,
        paymentUrl: transaction.paymentUrl,
      };
    } else {
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

  async verifyPaymentAndConfirm(id: string, userId: string, paymentIntentId: string) {
    const reservation = await this.reservationModel.findById(id).exec();
    if (!reservation) throw new NotFoundException('Réservation non trouvée');
    if (reservation.userId.toString() !== userId) throw new BadRequestException('Non autorisé');

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      reservation.paymentStatus = 'paid';
      reservation.status = 'confirmed';
      // Mettre à jour le statut du véhicule
      await this.vehicleModel.findByIdAndUpdate(
        reservation.vehicleId,
        { status: 'reserved' },
        { new: true }
      ).exec();

      await reservation.save();
      return { success: true, reservation };
    } else {
      throw new BadRequestException('Le paiement n\'a pas été validé');
    }
  }

  async verifyFedapayPayment(id: string, userId: string, transactionId: string) {
    const reservation = await this.reservationModel.findById(id).exec();
    if (!reservation) throw new NotFoundException('Réservation non trouvée');
    if (reservation.userId.toString() !== userId) throw new BadRequestException('Non autorisé');

    const isVerified = await this.fedapayService.verifyTransaction(transactionId);

    if (isVerified) {
      reservation.paymentStatus = 'paid';
      reservation.status = 'confirmed';
      // Mettre à jour le statut du véhicule
      await this.vehicleModel.findByIdAndUpdate(
        reservation.vehicleId,
        { status: 'reserved' },
        { new: true }
      ).exec();

      await reservation.save();
      return { success: true, reservation };
    } else {
      throw new BadRequestException('Le paiement n\'a pas été validé');
    }
  }

  async handleFedapayCallback(payload: any) {
    try {
      // FedaPay envoie les données de transaction dans le callback
      const transactionId = payload.transaction?.id || payload.id;
      const status = payload.transaction?.status || payload.status;

      if (!transactionId) {
        throw new BadRequestException('Transaction ID manquant dans le callback');
      }

      // Trouver la réservation associée à cette transaction
      const reservation = await this.reservationModel.findOne({
        fedapayTransactionId: transactionId
      }).exec();

      if (!reservation) {
        throw new NotFoundException(`Réservation non trouvée pour la transaction ${transactionId}`);
      }

      // Mettre à jour le statut selon la réponse FedaPay
      if (status === 'approved') {
        reservation.paymentStatus = 'paid';
        reservation.status = 'confirmed';

        // Mettre à jour le statut du véhicule
        await this.vehicleModel.findByIdAndUpdate(
          reservation.vehicleId,
          { status: 'reserved' },
          { new: true }
        ).exec();
      } else if (status === 'declined' || status === 'canceled') {
        reservation.paymentStatus = 'failed';
        reservation.status = 'cancelled';
      }

      await reservation.save();
      return { success: true, reservation };
    } catch (error: any) {
      throw new BadRequestException(`Erreur lors du traitement du callback: ${error.message}`);
    }
  }

  async getFedapayPaymentStatus(id: string, userId: string) {
    const reservation = await this.reservationModel.findById(id).exec();
    if (!reservation) throw new NotFoundException('Réservation non trouvée');
    if (reservation.userId.toString() !== userId) throw new BadRequestException('Non autorisé');

    if (!reservation.fedapayTransactionId) {
      throw new BadRequestException('Aucune transaction FedaPay associée à cette réservation');
    }

    try {
      const transactionStatus = await this.fedapayService.getTransactionStatus(
        reservation.fedapayTransactionId
      );

      // Mettre à jour le statut de la réservation si nécessaire
      if (transactionStatus.status === 'approved' && reservation.paymentStatus !== 'paid') {
        reservation.paymentStatus = 'paid';
        reservation.status = 'confirmed';

        await this.vehicleModel.findByIdAndUpdate(
          reservation.vehicleId,
          { status: 'reserved' },
          { new: true }
        ).exec();

        await reservation.save();
      }

      return {
        reservationId: id,
        transactionId: reservation.fedapayTransactionId,
        transactionStatus: transactionStatus.status,
        paymentStatus: reservation.paymentStatus,
        reservationStatus: reservation.status,
      };
    } catch (error: any) {
      throw new BadRequestException(`Erreur lors de la vérification du statut: ${error.message}`);
    }
  }
}
