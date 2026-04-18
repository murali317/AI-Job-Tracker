import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Express Request type to include our custom `user` property.
// After this middleware runs, req.user will contain the decoded JWT payload.
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────
// This function runs BEFORE route handlers on protected routes.
// Flow: Request → authMiddleware → controller (only if token is valid)

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  // 1. Get the token from the Authorization header
  // Format: "Bearer eyJhbGciOi..."
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'error',
      message: 'Access denied. No token provided.',
    });
    return;
  }

  // Extract the actual token (everything after "Bearer ")
  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    // 2. Verify the token — this checks:
    //    - Was it signed with our secret? (not tampered)
    //    - Is it expired? (beyond 7d)
    const decoded = jwt.verify(token, secret) as { userId: number; email: string };

    // 3. Attach the decoded user data to the request object
    // Now every controller after this can access req.user.userId
    req.user = decoded;

    // 4. Call next() to pass control to the next middleware or route handler
    // Without next(), the request would hang here forever
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }
};

export default authMiddleware;
