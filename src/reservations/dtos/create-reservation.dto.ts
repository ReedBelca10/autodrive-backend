import { IsMongoId, IsDateString, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateReservationDto {
  @IsMongoId()
  vehicleId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  returnDate: string;

  @IsOptional()
  @IsString()
  pickupLocation?: string;

  @IsOptional()
  @IsString()
  returnLocation?: string;

  @IsOptional()
  @IsNumber()
  totalPrice?: number;
}
