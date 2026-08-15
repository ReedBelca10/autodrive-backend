import { Model } from 'mongoose';
import { FedapayService } from '../payments/fedapay.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class ReservationsService {
    private reservationModel;
    private vehicleModel;
    private agencyModel;
    private fedapayService;
    private notificationsService;
    constructor(reservationModel: Model<any>, vehicleModel: Model<any>, agencyModel: Model<any>, fedapayService: FedapayService, notificationsService: NotificationsService);
    findAll(): Promise<Omit<any, never>[]>;
    findAllWithDetails(): Promise<{
        _id: any;
        userId: any;
        vehicleId: any;
        userName: string;
        userEmail: any;
        vehicleName: string;
        pickupLocation: any;
        returnLocation: any;
        startDate: any;
        returnDate: any;
        status: any;
        paymentStatus: any;
        paymentMethod: any;
        totalPrice: any;
        createdAt: any;
    }[]>;
    findAllByManager(userId: string): Promise<{
        _id: any;
        userId: any;
        vehicleId: any;
        userName: string;
        userEmail: any;
        vehicleName: string;
        pickupLocation: any;
        returnLocation: any;
        startDate: any;
        returnDate: any;
        status: any;
        paymentStatus: any;
        paymentMethod: any;
        totalPrice: any;
        createdAt: any;
    }[]>;
    findByUserId(userId: string): Promise<{
        _id: any;
        vehicleId: {
            _id: any;
            name: any;
            brand: any;
            model: any;
            year: any;
            dailyRate: any;
            bodyType: any;
            mediaUrls: any;
        };
        firstName: any;
        lastName: any;
        email: any;
        phone: any;
        startDate: any;
        returnDate: any;
        status: any;
        paymentStatus: any;
        paymentGateway: any;
        totalPrice: any;
        pickupLocation: any;
        returnLocation: any;
        insuranceOption: any;
        createdAt: any;
    }[]>;
    findById(id: string): Promise<any>;
    create(reservationData: any): Promise<any>;
    confirmReservation(id: string, userId: string): Promise<any>;
    cancelReservation(id: string, userId: string): Promise<any>;
    archiveReservation(id: string, userId: string, userRole: string): Promise<any>;
    delete(id: string, userId: string, userRole: string): Promise<any>;
    updateStatus(id: string, status: string): Promise<any>;
    createPaymentIntent(id: string, userId: string, gateway?: 'stripe' | 'fedapay'): Promise<{
        transactionId: string;
        token: string;
        paymentUrl: string;
        clientSecret?: undefined;
    } | {
        clientSecret: string;
        transactionId?: undefined;
        token?: undefined;
        paymentUrl?: undefined;
    }>;
    verifyPaymentAndConfirm(id: string, userId: string, paymentIntentId: string): Promise<{
        success: boolean;
        reservation: any;
    }>;
    verifyFedapayPayment(id: string, userId: string, transactionId: string): Promise<{
        success: boolean;
        reservation: any;
    }>;
    handleFedapayCallback(payload: any): Promise<{
        success: boolean;
        reservation: any;
    }>;
    getFedapayPaymentStatus(id: string, userId: string): Promise<{
        reservationId: string;
        transactionId: any;
        transactionStatus: string;
        paymentStatus: any;
        reservationStatus: any;
    }>;
    private sendConfirmationNotification;
}
