import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '@/config/env';
import logger from '@/utils/logger';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface JWTPayload extends AuthUser {
  iat: number;
  exp: number;
}

export class AuthError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      throw new AuthError(401, 'Authentication token required');
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as JWTPayload;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        error: {
          type: 'authentication_error',
          message: 'Token expired',
          code: 'TOKEN_EXPIRED',
        },
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        error: {
          type: 'authentication_error',
          message: 'Invalid token',
          code: 'INVALID_TOKEN',
        },
      });
      return;
    }

    if (error instanceof AuthError) {
      res.status(error.statusCode).json({
        error: {
          type: 'authentication_error',
          message: error.message,
          code: 'AUTH_ERROR',
        },
      });
      return;
    }

    logger.error({ error }, 'Authentication error');
    res.status(500).json({
      error: {
        type: 'internal_error',
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      error: {
        type: 'authorization_error',
        message: 'Admin access required',
        code: 'FORBIDDEN',
      },
    });
    return;
  }
  next();
};

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.auth.jwtSecret,
    {
      expiresIn: config.auth.jwtExpiry,
    }
  );
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, config.auth.jwtSecret) as JWTPayload;
}
