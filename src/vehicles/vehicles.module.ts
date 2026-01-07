import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { VehiclesUploadService } from './vehicles-upload.service';
import { VehicleSchema } from './schemas/vehicle.schema';
import { AgencySchema } from '../agencies/schemas/agency.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Vehicle', schema: VehicleSchema },
      { name: 'Agency', schema: AgencySchema },
    ]),
    JwtModule.register({ secret: process.env.JWT_SECRET || 'secret' }),
  ],
  providers: [VehiclesService, VehiclesUploadService],
  controllers: [VehiclesController],
  exports: [VehiclesService],
})
export class VehiclesModule {}
