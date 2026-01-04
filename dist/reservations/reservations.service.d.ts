import { Model } from 'mongoose';
export declare class ReservationsService {
    private reservationModel;
    constructor(reservationModel: Model<any>);
    findAll(): Promise<Omit<any, never>[]>;
    findById(id: string): Promise<any>;
    create(reservationData: any): Promise<any>;
    delete(id: string): Promise<any>;
    updateStatus(id: string, status: string): Promise<any>;
}
