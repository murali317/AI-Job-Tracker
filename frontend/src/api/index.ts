import axios from 'axios';

// Create an axios instance with the backend base URL.
// This way every API call automatically goes to http://localhost:5000
// instead of typing the full URL each time.
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// ─── Request Interceptor ──────────────────────────────────────────────────
// This runs BEFORE every request is sent.
// It reads the token from localStorage and attaches it to the Authorization header.
// Think of it as "automatically showing your ID card on every request."
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Auth API calls ───────────────────────────────────────────────────────
export const authApi = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/signup', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// ─── Jobs API calls ──────────────────────────────────────────────────────
export const jobsApi = {
  getAll: () => api.get('/jobs'),

  getById: (id: number) => api.get(`/jobs/${id}`),

  create: (data: { company_name: string; job_title: string; [key: string]: unknown }) =>
    api.post('/jobs', data),

  update: (id: number, data: Record<string, unknown>) =>
    api.put(`/jobs/${id}`, data),

  delete: (id: number) => api.delete(`/jobs/${id}`),
};

// ─── AI API calls ────────────────────────────────────────────────────────
export const aiApi = {
  analyzeResume: (resumeText: string) =>
    api.post('/ai/analyze-resume', { resumeText }),

  matchJob: (resumeText: string, jobDescription: string) =>
    api.post('/ai/match-job', { resumeText, jobDescription }),
};

export default api;
