import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { AppError } from './errorHandler.js';

// Placeholder para autenticación real (JWT, etc.)
// Por ahora, este middleware espera un header Authorization: Bearer <user-id>

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError(401, 'Missing authorization header'));
  }

  const [scheme, credentials] = authHeader.split(' ');

  if (scheme !== 'Bearer') {
    return next(new AppError(401, 'Invalid authorization scheme'));
  }

  // TODO: Validar JWT y extraer usuario
  // Por ahora, usar el token como ID de usuario
  req.user = {
    id: credentials,
    email: 'placeholder@example.com',
    profileType: 'productor',
  };

  next();
}

export function requireProfile(...profiles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'User not authenticated'));
    }

    if (!profiles.includes(req.user.profileType)) {
      return next(
        new AppError(403, `This action requires one of: ${profiles.join(', ')}`),
      );
    }

    next();
  };
}
