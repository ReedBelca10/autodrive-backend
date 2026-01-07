import { Request } from 'express';
import { VehiclesService } from './vehicles.service';
import { VehiclesUploadService } from './vehicles-upload.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dtos/vehicle.dto';
export declare class VehiclesController {
    private vehiclesService;
    private uploadService;
    constructor(vehiclesService: VehiclesService, uploadService: VehiclesUploadService);
    getTransmissions(): string[];
    getFuels(): string[];
    getBodyTypes(): string[];
    getEquipments(): string[];
    getYears(): number[];
    getManagerVehicles(req: Request): Promise<import("./schemas/vehicle.schema").VehicleDocument[]>;
    findAll(): Promise<import("./schemas/vehicle.schema").VehicleDocument[]>;
    findById(id: string): Promise<import("./schemas/vehicle.schema").VehicleDocument>;
    create(createVehicleDto: CreateVehicleDto, req: Request): Promise<import("./schemas/vehicle.schema").VehicleDocument>;
    update(id: string, updateVehicleDto: UpdateVehicleDto, req: Request): Promise<import("./schemas/vehicle.schema").VehicleDocument>;
    delete(id: string, req: Request): Promise<import("./schemas/vehicle.schema").VehicleDocument>;
    toggleStatus(id: string, req: Request): Promise<import("./schemas/vehicle.schema").VehicleDocument>;
    uploadMedia(file: Express.Multer.File, req: Request): Promise<{
        success: boolean;
        publicUrl: string;
        fileName: string;
    }>;
    addMediaToVehicle(id: string, body: {
        mediaUrl: string;
    }, req: Request): Promise<import("./schemas/vehicle.schema").VehicleDocument>;
}
