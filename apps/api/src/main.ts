import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { VALIDATION_PIPE_OPTIONS } from './common/validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global ValidationPipe with whitelist and transform
  app.useGlobalPipes(
    new ValidationPipe(VALIDATION_PIPE_OPTIONS),
  );

  // Enable CORS with configurable origins from environment
  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigins.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    maxAge: 86400, // 24 hours
  });

  const port = configService.get<number>('PORT', 3001);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on port ${port} in ${nodeEnv} mode`);
  console.log(`API available at http://localhost:${port}`);
  console.log(`CORS enabled for origins: ${corsOrigins}`);
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap application:', err);
  process.exit(1);
});
