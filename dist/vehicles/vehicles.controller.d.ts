import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dtos/vehicle.dto';
export declare class VehiclesController {
    private vehiclesService;
    constructor(vehiclesService: VehiclesService);
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any>;
    create(createVehicleDto: CreateVehicleDto): Promise<any>;
    update(id: string, updateVehicleDto: UpdateVehicleDto): Promise<any>;
    delete(id: string): Promise<any>;
}
