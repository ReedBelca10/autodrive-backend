import { Model } from 'mongoose';
import { CreateVehicleDto, UpdateVehicleDto } from './dtos/vehicle.dto';
import { VehicleDocument } from './schemas/vehicle.schema';
export declare class VehiclesService {
    private vehicleModel;
    private agencyModel;
    constructor(vehicleModel: Model<VehicleDocument>, agencyModel: Model<any>);
    private readonly TRANSMISSIONS;
    private readonly FUELS;
    private readonly BODY_TYPES;
    private readonly EQUIPMENTS;
    create(createVehicleDto: CreateVehicleDto): Promise<VehicleDocument>;
    findAll(): Promise<VehicleDocument[]>;
    findById(id: string): Promise<VehicleDocument>;
    private normalizeMediaUrls;
    update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<VehicleDocument>;
    delete(id: string): Promise<VehicleDocument>;
    toggleStatus(id: string): Promise<VehicleDocument>;
    addMediaUrl(id: string, mediaUrl: string): Promise<VehicleDocument>;
    getTransmissions(): string[];
    getFuels(): string[];
    getBodyTypes(): string[];
    getEquipments(): string[];
    getYears(): number[];
    getManagerAgencyId(userId: string): Promise<string | null>;
    findByManager(userId: string): Promise<VehicleDocument[]>;
}
