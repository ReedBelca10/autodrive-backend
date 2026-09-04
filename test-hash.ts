import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { UsersService } from './src/users/users.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const email = `test-${Date.now()}@test.com`;
  const user = await usersService.create({
    fullName: 'Test User',
    email,
    password: 'password123',
  });
  console.log('Created user password:', user.password);
  
  const fetched = await usersService.findByEmail(email);
  console.log('Fetched user password in DB:', fetched?.password);
  
  await app.close();
}
bootstrap();
