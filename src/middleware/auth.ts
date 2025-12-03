import { Request, Response, NextFunction } from 'express';

/**
 * Extend Express Request to include user info
 */
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

/**
 * Mock authentication middleware
 * In a real application, this would validate JWT tokens
 */
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  try {
    // For testing purposes, extract user from header
    const userHeader = req.headers['x-user'];
    
    if (!userHeader) {
      return res.status(401).json({ error: 'Unauthorized: No user provided' });
    }

    const user = typeof userHeader === 'string' ? JSON.parse(userHeader) : userHeader;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid user format' });
  }
};

/**
 * Authorization middleware for admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.role !== 'ROLE_ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  next();
};

/**
 * Authorization middleware for any authenticated user
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};
