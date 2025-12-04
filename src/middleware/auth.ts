import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    const userHeader = req.headers['x-user'];
    if (!userHeader) return res.status(401).json({ error: 'Unauthorized: No user provided' });

    const user = typeof userHeader === 'string' ? JSON.parse(userHeader) : userHeader;
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: Invalid user format' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (req.user.role !== 'ROLE_ADMIN') return res.status(403).json({ error: 'Forbidden: Admin access required' });
  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
};
