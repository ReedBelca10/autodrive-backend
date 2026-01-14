import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ContactModule } from './contact/contact.module';
import { AdminModule } from './admin/admin.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ReservationsModule } from './reservations/reservations.module';
import { AgenciesModule } from './agencies/agencies.module';
import { BlogModule } from './blog/blog.module';
import { FaqModule } from './faq/faq.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { NotificationsModule } from './notifications/notifications.module';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || '', {
      // useNewUrlParser and useUnifiedTopology are defaults in mongoose v7
    }),
    UsersModule,
    AuthModule,
    ContactModule,
    AdminModule,
    VehiclesModule,
    ReservationsModule,
    AgenciesModule,
    BlogModule,
    FaqModule,
    NewsletterModule,
    NotificationsModule,
  ],
})
export class AppModule { }
