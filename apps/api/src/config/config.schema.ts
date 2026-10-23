import * as Joi from 'joi';

export const configSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .required(),
  PORT: Joi.number()
    .default(3001),
  CORS_ORIGINS: Joi.string()
    .default('http://localhost:3000,http://localhost:3001'),
  DATABASE_HOST: Joi.string()
    .required(),
  DATABASE_PORT: Joi.number()
    .required(),
  DATABASE_USER: Joi.string()
    .required(),
  DATABASE_PASSWORD: Joi.string()
    .required(),
  DATABASE_NAME: Joi.string()
    .required(),
  // Optional: defaults to on in production and off elsewhere.
  DATABASE_SSL: Joi.boolean(),
  JWT_ACCESS_SECRET: Joi.string()
    .required(),
  JWT_ACCESS_EXPIRATION: Joi.number()
    .default(900),
  JWT_REFRESH_SECRET: Joi.string()
    .required(),
  JWT_REFRESH_EXPIRATION: Joi.number()
    .default(604800),
  GOOGLE_CLIENT_ID: Joi.string()
    .required(),
  GOOGLE_CLIENT_SECRET: Joi.string()
    .required(),
  GOOGLE_CALLBACK_URL: Joi.string()
    .required(),
});
