import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const errorType = statusCode >= 500 ? 'internal_error' : 'client_error';

  logger.error(
    {
      err,
      req: {
        method: req.method,
        url: req.url,
        body: req.body,
        user: (req as any).user?.id,
      },
    },
    'Request error'
  );

  res.status(statusCode).json({
    error: {
      type: errorType,
      message: err.message || 'An error occurred',
      code: err.code || 'UNKNOWN_ERROR',
      ...(err.details && { details: err.details }),
      trace_id: (req as any).id,
    },
  });
};

export class ValidationError extends Error implements AppError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';

  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error implements AppError {
  statusCode = 401;
  code = 'AUTHENTICATION_ERROR';

  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error implements AppError {
  statusCode = 403;
  code = 'AUTHORIZATION_ERROR';

  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error implements AppError {
  statusCode = 404;
  code = 'NOT_FOUND';

  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends Error implements AppError {
  statusCode = 429;
  code = 'RATE_LIMIT_ERROR';

  constructor(message: string = 'Rate limit exceeded') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class ProviderError extends Error implements AppError {
  statusCode = 502;
  code = 'PROVIDER_ERROR';

  constructor(
    message: string,
    public provider?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class InternalError extends Error implements AppError {
  statusCode = 500;
  code = 'INTERNAL_ERROR';

  constructor(message: string = 'Internal server error', public details?: any) {
    super(message);
    this.name = 'InternalError';
  }
}
