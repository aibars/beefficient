import { Router, Response } from 'express';
import { AuthRequest, ApiResponse } from '../types/index.js';

const router = Router();

router.get('/health', (req: AuthRequest, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      version: '0.0.1',
    },
  };
  res.json(response);
});

router.get('/api/v1/health', (req: AuthRequest, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: 'API is running',
    data: {
      timestamp: new Date().toISOString(),
      authenticated: !!req.user,
      user: req.user ? { id: req.user.id, profileType: req.user.profileType } : null,
    },
  };
  res.json(response);
});

export default router;
