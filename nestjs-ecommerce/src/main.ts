import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService instance to access environment variables
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');

  // Enable CORS to allow Angular frontend requests
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4200', // Angular CLI default port
      'http://localhost:4201', // Angular CLI fallback port
    ],
    credentials: true,
  });

  // Set global API prefix for cleaner routing
  app.setGlobalPrefix('api');

  // Enable validation with transformation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
