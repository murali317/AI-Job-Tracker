import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file into process.env
// Must be called BEFORE using any process.env values
dotenv.config();

// Importing db.ts here triggers the pool.connect() test inside it.
// If the DB URL is wrong, you'll see the error in your terminal on startup.
import pool from './config/db';
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import aiRoutes from './routes/ai';

const app: Application = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
// Middleware are functions that run on EVERY request before reaching your routes.
// Think of them as a pipeline: Request → middleware1 → middleware2 → route handler

// Allows your React frontend (different port/domain) to call this API
// Without this, the browser will block the request (CORS policy)
// In production, FRONTEND_URL restricts which domain can call our API.
// Locally, it falls back to allowing everything.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);

// Parses incoming requests with JSON bodies
// Without this, req.body would be undefined when frontend sends JSON
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

// Auth routes (public — no token needed to signup/login)
app.use('/api/auth', authRoutes);

// Mount the jobs router under /api/jobs
// All routes defined in routes/jobs.ts will be prefixed with /api/jobs
app.use('/api/jobs', jobRoutes);

// AI routes — resume analysis & job matching (protected by auth middleware)
app.use('/api/ai', aiRoutes);

// Health check route — used to verify the server is running
// Postman: GET http://localhost:5000/health
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Job Tracker API is running',
    timestamp: new Date().toISOString(),
  });
});

// DB health check — runs a simple query to verify the DB connection is live
// Postman: GET http://localhost:5000/health/db
app.get('/health/db', async (req: Request, res: Response) => {
  try {
    // pool.query() sends a SQL string and returns the result as a JS object
    // SELECT NOW() just asks the DB for the current time — a harmless test query
    const result = await pool.query('SELECT NOW() AS current_time');
    res.status(200).json({
      status: 'OK',
      message: 'Database connection is healthy',
      db_time: result.rows[0].current_time,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
// If no route matches, return a clean 404 error
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

export default app;
