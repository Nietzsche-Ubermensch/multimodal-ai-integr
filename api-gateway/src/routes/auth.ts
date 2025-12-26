import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { generateToken } from '@/middleware/auth';
import { authRateLimiter } from '@/middleware/rateLimit';
import logger from '@/utils/logger';

const router = Router();

const users: Map<string, {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  role: 'user' | 'admin';
  createdAt: Date;
}> = new Map();

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/register', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      res.status(409).json({
        error: {
          type: 'conflict',
          message: 'User already exists',
          code: 'USER_EXISTS',
        },
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const user = {
      id: userId,
      email,
      name,
      passwordHash,
      role: 'user' as const,
      createdAt: new Date(),
    };

    users.set(userId, user);

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    logger.info({ userId, email }, 'User registered');

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: {
          type: 'validation_error',
          message: 'Invalid request body',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
      });
      return;
    }

    logger.error({ error }, 'Registration error');
    res.status(500).json({
      error: {
        type: 'internal_error',
        message: 'Registration failed',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

router.post('/login', authRateLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = Array.from(users.values()).find(u => u.email === email);

    if (!user) {
      res.status(401).json({
        error: {
          type: 'authentication_error',
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        },
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      res.status(401).json({
        error: {
          type: 'authentication_error',
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        },
      });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    logger.info({ userId: user.id, email }, 'User logged in');

    res.json({
      token,
      expiresIn: '24h',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: {
          type: 'validation_error',
          message: 'Invalid request body',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
      });
      return;
    }

    logger.error({ error }, 'Login error');
    res.status(500).json({
      error: {
        type: 'internal_error',
        message: 'Login failed',
        code: 'INTERNAL_ERROR',
      },
    });
  }
});

export default router;
