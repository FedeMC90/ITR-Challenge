import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService instance to access environment variables
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  const corsOrigins = configService.get<string[]>('corsOrigins');

  // Enable CORS to allow frontend requests (development and production)
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Set global API prefix for cleaner routing
  app.setGlobalPrefix('api');

  // Enable validation with transformation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
  console.log(`CORS enabled for: ${corsOrigins.join(', ')}`);
}
bootstrap();
