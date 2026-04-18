import { Router } from 'express';
import authMiddleware from '../middleware/auth';
import { analyzeResume, matchJob } from '../controllers/aiController';

const router = Router();

// All AI routes require authentication — you must be logged in
router.use(authMiddleware);

// POST /api/ai/analyze-resume — Analyze a resume with AI
router.post('/analyze-resume', analyzeResume);

// POST /api/ai/match-job — Compare resume against a job description
router.post('/match-job', matchJob);

export default router;
