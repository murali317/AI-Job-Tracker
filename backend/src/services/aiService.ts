import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Gemini Client ─────────────────────────────────────────────────────────
// Google Gemini offers a generous free tier:
//   - 15 requests per minute
//   - 1 million tokens per day
//   - No credit card required
// Perfect for a portfolio project that real users can actually try.

const getModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in .env');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  // gemini-2.0-flash is fast, free, and great for text analysis
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json', // forces valid JSON output
      temperature: 0.3,                     // low = consistent responses
      maxOutputTokens: 1024,
    },
  });
};

// ─── Response Types ────────────────────────────────────────────────────────
// These define the shape of JSON we expect back from Gemini.
// We validate at runtime since LLMs can technically return anything.

export interface ResumeAnalysis {
  score: number;           // 1–10
  summary: string;         // 1–2 sentence overview
  strengths: string[];     // what's good
  improvements: string[];  // what needs work
  suggestions: string[];   // actionable tips
}

export interface JobMatchResult {
  matchPercentage: number;     // 0–100
  summary: string;             // 1–2 sentence overview
  matchingSkills: string[];    // skills the resume has that match the JD
  missingSkills: string[];     // skills the JD wants that the resume lacks
  tips: string[];              // tailored advice for this specific application
}

// ─── Helper: extract JSON from response ────────────────────────────────────
// Gemini may sometimes wrap JSON in markdown code fences; strip them if present
const extractJSON = (text: string): string => {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  return text.trim();
};

// ─── Analyze Resume ────────────────────────────────────────────────────────
// Takes raw resume text, asks Gemini to evaluate it as a career coach.

export const analyzeResume = async (resumeText: string): Promise<ResumeAnalysis> => {
  const model = getModel();

  const prompt = `You are an expert career coach and resume reviewer with 15 years of experience.
Analyze the following resume text and return a JSON object with EXACTLY this structure:
{
  "score": <number 1-10>,
  "summary": "<1-2 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"],
  "suggestions": ["<actionable suggestion 1>", "<actionable suggestion 2>", "<actionable suggestion 3>"]
}
Rules:
- score: 1 = very poor, 10 = exceptional. Be honest but constructive.
- strengths: exactly 3 items. Focus on what stands out positively.
- improvements: exactly 3 items. Focus on gaps or weaknesses.
- suggestions: exactly 3 items. Practical, specific, and actionable tips.
- Return ONLY valid JSON. No markdown, no code fences, no extra text.

RESUME:
${resumeText}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  if (!raw) {
    throw new Error('Empty response from Gemini');
  }

  const parsed = JSON.parse(extractJSON(raw)) as ResumeAnalysis;

  // Runtime validation — LLM may not always respect the schema
  if (
    typeof parsed.score !== 'number' ||
    typeof parsed.summary !== 'string' ||
    !Array.isArray(parsed.strengths) ||
    !Array.isArray(parsed.improvements) ||
    !Array.isArray(parsed.suggestions)
  ) {
    throw new Error('Invalid response structure from AI');
  }

  // Clamp score to valid range
  parsed.score = Math.max(1, Math.min(10, Math.round(parsed.score)));

  return parsed;
};

// ─── Match Job to Resume ───────────────────────────────────────────────────
// Compares a resume against a specific job description.

export const matchJobToResume = async (
  resumeText: string,
  jobDescription: string
): Promise<JobMatchResult> => {
  const model = getModel();

  const prompt = `You are an expert recruiter and career advisor.
Compare the candidate's resume against the job description and return a JSON object with EXACTLY this structure:
{
  "matchPercentage": <number 0-100>,
  "summary": "<1-2 sentence assessment of fit>",
  "matchingSkills": ["<skill 1>", "<skill 2>", ...],
  "missingSkills": ["<skill 1>", "<skill 2>", ...],
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}
Rules:
- matchPercentage: 0 = completely unqualified, 100 = perfect match. Be realistic.
- matchingSkills: skills/qualifications from the resume that match JD requirements.
- missingSkills: skills/qualifications the JD requires that are NOT in the resume.
- tips: 3 specific, actionable tips to improve chances for THIS particular job.
- Return ONLY valid JSON. No markdown, no code fences, no extra text.

RESUME:
${resumeText}

---

JOB DESCRIPTION:
${jobDescription}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();

  if (!raw) {
    throw new Error('Empty response from Gemini');
  }

  const parsed = JSON.parse(extractJSON(raw)) as JobMatchResult;

  // Runtime validation
  if (
    typeof parsed.matchPercentage !== 'number' ||
    typeof parsed.summary !== 'string' ||
    !Array.isArray(parsed.matchingSkills) ||
    !Array.isArray(parsed.missingSkills) ||
    !Array.isArray(parsed.tips)
  ) {
    throw new Error('Invalid response structure from AI');
  }

  // Clamp percentage to valid range
  parsed.matchPercentage = Math.max(0, Math.min(100, Math.round(parsed.matchPercentage)));

  return parsed;
};
