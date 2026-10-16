export interface AuthConfig {
  jwtAccessSecret: string;
  jwtAccessExpiration: number;
  jwtRefreshSecret: string;
  jwtRefreshExpiration: number;
  googleClientId: string;
  googleClientSecret: string;
  googleCallbackUrl: string;
  bcryptRounds: number;
}

export const authConfig = (): AuthConfig => ({
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || '',
  jwtAccessExpiration: parseInt(process.env.JWT_ACCESS_EXPIRATION || '900', 10),
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
  jwtRefreshExpiration: parseInt(process.env.JWT_REFRESH_EXPIRATION || '604800', 10),
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || '',
  bcryptRounds: 10,
});
