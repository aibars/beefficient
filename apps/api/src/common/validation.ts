import { ValidationPipeOptions } from '@nestjs/common';

/** Opciones del ValidationPipe global; las usan main.ts y los e2e para no divergir. */
export const VALIDATION_PIPE_OPTIONS: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
};
