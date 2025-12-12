import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || '', {
      // useNewUrlParser and useUnifiedTopology are defaults in mongoose v7
    }),
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
