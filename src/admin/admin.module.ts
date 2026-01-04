import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminSeedController } from './admin.seed.controller';
import { AdminDashboardController } from './admin.dashboard.controller';
import { UserSchema } from '../users/user.schema';
import { VehicleSchema } from '../vehicles/schemas/vehicle.schema';
import { ReservationSchema } from '../reservations/schemas/reservation.schema';
import { AgencySchema } from '../agencies/schemas/agency.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Vehicle', schema: VehicleSchema },
      { name: 'Reservation', schema: ReservationSchema },
      { name: 'Agency', schema: AgencySchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'La-clé-secrète',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  providers: [AdminService],
  controllers: [AdminController, AdminSeedController, AdminDashboardController],
  exports: [AdminService],
})
export class AdminModule {}
