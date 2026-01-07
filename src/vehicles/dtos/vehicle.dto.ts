import { IsString, IsArray, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';

export class CreateVehicleDto {
  // Champs du formulaire frontend
  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  name?: string; // Fallback si envoyé comme name

  @IsNumber()
  dailyRate: number;

  @IsNumber()
  @IsOptional()
  passengers?: number;

  @IsNumber()
  @IsOptional()
  seats?: number;

  @IsNumber()
  @Min(1970)
  year: number;

  @IsEnum(['automatique', 'manuelle', 'semi-automatique'])
  transmission: string;

  @IsEnum(['essence', 'diesel', 'électrique', 'hybride'])
  fuel: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  agencyId?: string;

  @IsEnum(['berline', 'suv', 'camionnette', 'monospace', 'cabriolet', 'coupé', 'break'])
  bodyType: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  luggage?: number;

  @IsNumber()
  @IsOptional()
  mileage?: number;

  @IsArray()
  @IsOptional()
  features?: string[];

  @IsArray()
  @IsOptional()
  equipment?: string[];

  @IsArray()
  @IsOptional()
  mediaUrls?: string[];

  @IsEnum(['available', 'reserved', 'maintenance'])
  @IsOptional()
  status?: 'available' | 'reserved' | 'maintenance';
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  dailyRate?: number;

  @IsOptional()
  @IsNumber()
  passengers?: number;

  @IsOptional()
  @IsNumber()
  seats?: number;

  @IsOptional()
  @IsNumber()
  @Min(1970)
  year?: number;

  @IsOptional()
  @IsEnum(['automatique', 'manuelle', 'semi-automatique'])
  transmission?: string;

  @IsOptional()
  @IsEnum(['essence', 'diesel', 'électrique', 'hybride'])
  fuel?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsEnum(['berline', 'suv', 'camionnette', 'monospace', 'cabriolet', 'coupé', 'break'])
  bodyType?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  luggage?: number;

  @IsOptional()
  @IsNumber()
  mileage?: number;

  @IsOptional()
  @IsArray()
  features?: string[];

  @IsOptional()
  @IsArray()
  equipment?: string[];

  @IsOptional()
  @IsArray()
  mediaUrls?: string[];

  @IsOptional()
  @IsEnum(['available', 'reserved', 'maintenance'])
  status?: 'available' | 'reserved' | 'maintenance';
}
