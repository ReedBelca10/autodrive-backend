import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  year: string;

  @IsString()
  price: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  features?: string[];
}

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  features?: string[];
}
