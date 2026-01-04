import { ReservationsService } from './reservations.service';
export declare class ReservationsController {
    private reservationsService;
    constructor(reservationsService: ReservationsService);
    findAll(): Promise<Omit<any, never>[]>;
    findById(id: string): Promise<any>;
    create(reservationData: any): Promise<any>;
    delete(id: string): Promise<any>;
}
