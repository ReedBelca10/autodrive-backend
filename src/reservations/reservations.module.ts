import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { ReservationSchema } from './schemas/reservation.schema';
import { VehicleSchema } from '../vehicles/schemas/vehicle.schema';
import { AgencySchema } from '../agencies/schemas/agency.schema';
import { PaymentsModule } from '../payments/payments.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Reservation', schema: ReservationSchema },
      { name: 'Vehicle', schema: VehicleSchema },
      { name: 'Agency', schema: AgencySchema },
    ]),
    PaymentsModule,
    NotificationsModule,
  ],
  providers: [ReservationsService],
  controllers: [ReservationsController],
  exports: [ReservationsService],
})
export class ReservationsModule { }
