import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import cookieParser = require('cookie-parser');
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Configure les pipes de validation globaux
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Utilise le parser de cookies pour accéder aux cookies des requêtes
  app.use((cookieParser as any)());

  // Active CORS pour permettre au frontend d'envoyer les identifiants (cookies)
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS: origin ${origin} non autorisée`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Applique le filtre global de gestion des exceptions
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Serveur AutoDrive démarré sur http://localhost:${port}`);
}

bootstrap();
