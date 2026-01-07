import { ReservationsService } from './reservations.service';
import { Request } from 'express';
export declare class ReservationsController {
    private reservationsService;
    constructor(reservationsService: ReservationsService);
    getAllReservationsAdmin(req: Request): Promise<{
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
    findAll(req: Request): Promise<{
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
    create(reservationData: any, req: Request): Promise<any>;
    cancelReservation(id: string, req: Request): Promise<any>;
    confirmReservation(id: string, req: Request): Promise<any>;
    archiveReservation(id: string, req: Request): Promise<any>;
    delete(id: string, req: Request): Promise<any>;
    createPaymentIntent(id: string, body: {
        gateway?: 'stripe' | 'fedapay';
    }, req: Request): Promise<{
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
    confirmPayment(id: string, paymentIntentId: string, req: Request): Promise<{
        success: boolean;
        reservation: any;
    }>;
    confirmFedapayPayment(id: string, body: {
        transactionId?: string;
    }, req: Request): Promise<{
        success: boolean;
        reservation: any;
    }>;
    handleFedapayCallback(payload: any): Promise<{
        success: boolean;
        reservation: any;
    }>;
    getFedapayPaymentStatus(id: string, req: Request): Promise<{
        reservationId: string;
        transactionId: any;
        transactionStatus: string;
        paymentStatus: any;
        reservationStatus: any;
    }>;
}
