import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as aiService from '../services/aiService';

// ─── Input Limits ──────────────────────────────────────────────────────────
// Prevent users from sending absurdly long text that would eat Gemini quota
const MAX_RESUME_LENGTH = 15000;      // ~3,000 words — enough for any resume
const MAX_JOB_DESC_LENGTH = 10000;    // ~2,000 words — enough for any JD
const MIN_TEXT_LENGTH = 50;            // reject trivially short input

// ─── Error Helper ──────────────────────────────────────────────────────────
// Maps Gemini SDK errors to user-friendly HTTP responses
const handleAIError = (error: unknown, res: Response): void => {
  const errMsg = error instanceof Error ? error.message : String(error);

  // Gemini API key issues
  if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
    console.error('Gemini API key is invalid');
    res.status(503).json({
      status: 'error',
      message: 'AI service is temporarily unavailable. Please try again later.',
    });
    return;
  }

  // Model not found (deprecated or renamed)
  if (errMsg.includes('is not found for API version') || errMsg.includes('404')) {
    console.error('Gemini model not found:', errMsg);
    res.status(503).json({
      status: 'error',
      message: 'AI model is temporarily unavailable. Please try again later.',
    });
    return;
  }

  // Gemini rate limit (free tier: 15 RPM)
  if (errMsg.includes('RATE_LIMIT_EXCEEDED') || errMsg.includes('429') || errMsg.includes('quota')) {
    console.error('Gemini rate limit hit');
    res.status(429).json({
      status: 'error',
      message: 'AI service is busy. Please wait a moment and try again.',
    });
    return;
  }

  // Gemini safety / content blocked
  if (errMsg.includes('SAFETY') || errMsg.includes('blocked') || errMsg.includes('HARM_CATEGORY')) {
    console.error('Gemini safety filter triggered:', errMsg);
    res.status(422).json({
      status: 'error',
      message: 'The text could not be analyzed. Please check the content and try again.',
    });
    return;
  }

  // GEMINI_API_KEY not set in .env
  if (errMsg.includes('GEMINI_API_KEY is not set')) {
    console.error('GEMINI_API_KEY missing from .env');
    res.status(503).json({
      status: 'error',
      message: 'AI service is not configured. Please contact the administrator.',
    });
    return;
  }

  // JSON parse errors (Gemini returned invalid JSON)
  if (error instanceof SyntaxError) {
    console.error('Failed to parse AI response:', errMsg);
    res.status(502).json({
      status: 'error',
      message: 'AI returned an unexpected response. Please try again.',
    });
    return;
  }

  // Generic fallback
  console.error('AI error:', error);
  res.status(500).json({
    status: 'error',
    message: 'AI analysis failed. Please try again.',
  });
};

// ─── POST /api/ai/analyze-resume ───────────────────────────────────────────
export const analyzeResume = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeText } = req.body;

    // ── Validation ──────────────────────────────────────────────
    if (!resumeText || typeof resumeText !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'resumeText is required and must be a string',
      });
      return;
    }

    const trimmed = resumeText.trim();

    if (trimmed.length < MIN_TEXT_LENGTH) {
      res.status(400).json({
        status: 'error',
        message: `Resume text is too short. Please provide at least ${MIN_TEXT_LENGTH} characters.`,
      });
      return;
    }

    if (trimmed.length > MAX_RESUME_LENGTH) {
      res.status(400).json({
        status: 'error',
        message: `Resume text is too long. Maximum ${MAX_RESUME_LENGTH} characters allowed.`,
      });
      return;
    }

    // ── Call AI ─────────────────────────────────────────────────
    const result = await aiService.analyzeResume(trimmed);

    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    handleAIError(error, res);
  }
};

// ─── POST /api/ai/match-job ────────────────────────────────────────────────
export const matchJob = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeText, jobDescription } = req.body;

    // ── Validation ──────────────────────────────────────────────
    if (!resumeText || typeof resumeText !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'resumeText is required and must be a string',
      });
      return;
    }

    if (!jobDescription || typeof jobDescription !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'jobDescription is required and must be a string',
      });
      return;
    }

    const trimmedResume = resumeText.trim();
    const trimmedJD = jobDescription.trim();

    if (trimmedResume.length < MIN_TEXT_LENGTH) {
      res.status(400).json({
        status: 'error',
        message: `Resume text is too short. Please provide at least ${MIN_TEXT_LENGTH} characters.`,
      });
      return;
    }

    if (trimmedJD.length < MIN_TEXT_LENGTH) {
      res.status(400).json({
        status: 'error',
        message: `Job description is too short. Please provide at least ${MIN_TEXT_LENGTH} characters.`,
      });
      return;
    }

    if (trimmedResume.length > MAX_RESUME_LENGTH) {
      res.status(400).json({
        status: 'error',
        message: `Resume text is too long. Maximum ${MAX_RESUME_LENGTH} characters.`,
      });
      return;
    }

    if (trimmedJD.length > MAX_JOB_DESC_LENGTH) {
      res.status(400).json({
        status: 'error',
        message: `Job description is too long. Maximum ${MAX_JOB_DESC_LENGTH} characters.`,
      });
      return;
    }

    // ── Call AI ─────────────────────────────────────────────────
    const result = await aiService.matchJobToResume(trimmedResume, trimmedJD);

    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    handleAIError(error, res);
  }
};
