import { Request, Response, NextFunction } from 'express';

export type ProfileType = 'productor' | 'tecnico';

export interface AuthUser {
  id: string;
  email: string;
  profileType: ProfileType;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export type AsyncHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
