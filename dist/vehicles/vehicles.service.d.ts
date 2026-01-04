import { Model } from 'mongoose';
import { CreateVehicleDto, UpdateVehicleDto } from './dtos/vehicle.dto';
export declare class VehiclesService {
    private vehicleModel;
    constructor(vehicleModel: Model<any>);
    create(createVehicleDto: CreateVehicleDto): Promise<any>;
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<any>;
    delete(id: string): Promise<any>;
}
