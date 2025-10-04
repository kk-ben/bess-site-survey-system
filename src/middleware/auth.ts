import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthError, ForbiddenError } from './errorHandler';
import { logger } from '@/utils/logger';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('No token provided');
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }

    const decoded = jwt.verify(token, secret) as JWTPayload;
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthError('Token expired'));
    } else {
      next(error);
    }
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthError('Authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(`Access denied. Required roles: ${roles.join(', ')}`)
      );
    }

    next();
  };
};

// Alias for compatibility
export const authenticate = authMiddleware;
