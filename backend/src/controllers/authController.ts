import { Request, Response } from 'express';
import * as authService from '../services/authService';

// ─── POST /api/auth/signup ──────────────────────────────────────────────────
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400).json({
        status: 'error',
        message: 'name, email, and password are required',
      });
      return;
    }

    // Basic password length check
    if (password.length < 6) {
      res.status(400).json({
        status: 'error',
        message: 'Password must be at least 6 characters',
      });
      return;
    }

    const result = await authService.signup({ name, email, password });

    // If result has an error property, it means email is taken
    if ('error' in result) {
      res.status(409).json({ status: 'error', message: result.error });
      return;
    }

    // 201 = Created
    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ status: 'error', message: 'Signup failed' });
  }
};

// ─── POST /api/auth/login ───────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        status: 'error',
        message: 'email and password are required',
      });
      return;
    }

    const result = await authService.login({ email, password });

    if ('error' in result) {
      // 401 = Unauthorized
      res.status(401).json({ status: 'error', message: result.error });
      return;
    }

    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Login failed' });
  }
};
