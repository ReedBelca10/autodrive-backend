export declare class CreateVehicleDto {
    brand?: string;
    model?: string;
    name?: string;
    dailyRate: number;
    passengers?: number;
    seats?: number;
    year: number;
    transmission: string;
    fuel: string;
    city?: string;
    agencyId?: string;
    bodyType: string;
    description: string;
    luggage?: number;
    mileage?: number;
    features?: string[];
    equipment?: string[];
    mediaUrls?: string[];
    status?: 'available' | 'reserved' | 'maintenance';
}
export declare class UpdateVehicleDto {
    brand?: string;
    model?: string;
    name?: string;
    dailyRate?: number;
    passengers?: number;
    seats?: number;
    year?: number;
    transmission?: string;
    fuel?: string;
    city?: string;
    bodyType?: string;
    description?: string;
    luggage?: number;
    mileage?: number;
    features?: string[];
    equipment?: string[];
    mediaUrls?: string[];
    status?: 'available' | 'reserved' | 'maintenance';
}
