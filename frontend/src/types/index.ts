// Shape of a user object returned by the API
export interface User {
  id: number;
  name: string;
  email: string;
}

// Shape of the auth response (login & signup)
export interface AuthResponse {
  user: User;
  token: string;
}

// Shape of a job application from the API
export interface Job {
  id: number;
  user_id: number;
  company_name: string;
  job_title: string;
  job_url: string | null;
  status: string;
  applied_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Shape of data sent when creating/updating a job
export interface JobFormData {
  company_name: string;
  job_title: string;
  job_url?: string;
  status?: string;
  applied_date?: string;
  notes?: string;
}
