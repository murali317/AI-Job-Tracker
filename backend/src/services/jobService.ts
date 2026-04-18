import pool from '../config/db';

// ─── Types ─────────────────────────────────────────────────────────────────
// Defines the shape of data we accept when creating or updating a job
export interface CreateJobInput {
  company_name: string;
  job_title: string;
  job_url?: string;       // optional
  status?: string;        // optional — defaults to 'applied' in DB
  applied_date?: string;
  notes?: string;
}

export interface UpdateJobInput {
  company_name?: string;
  job_title?: string;
  job_url?: string;
  status?: string;
  applied_date?: string;
  notes?: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────
// Each function takes plain data, runs a SQL query, returns plain data.
// No knowledge of HTTP (req/res) — that's the controller's job.

// Get all job applications for a specific user
export const getAllJobs = async (userId: number) => {
  const result = await pool.query(
    // $1 is a parameterized placeholder — pg safely injects userId here
    // This prevents SQL Injection attacks (never concatenate user input into SQL strings!)
    `SELECT * FROM job_applications 
     WHERE user_id = $1 
     ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows; // rows is always an array of objects
};

// Get a single job application by its ID (and confirm it belongs to this user)
export const getJobById = async (id: number, userId: number) => {
  const result = await pool.query(
    `SELECT * FROM job_applications WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return result.rows[0]; // returns the single row object, or undefined if not found
};

// Create a new job application
export const createJob = async (userId: number, data: CreateJobInput) => {
  const { company_name, job_title, job_url, status, applied_date, notes } = data;

  const result = await pool.query(
    `INSERT INTO job_applications 
      (user_id, company_name, job_title, job_url, status, applied_date, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    // RETURNING * means: after inserting, give me back the full created row
    // This way we can return the new job (with its generated id) to the frontend
    [userId, company_name, job_title, job_url ?? null, status ?? 'applied', applied_date ?? null, notes ?? null]
  );
  return result.rows[0];
};

// Update an existing job application
export const updateJob = async (id: number, userId: number, data: UpdateJobInput) => {
  // We only update fields that were actually provided (partial update)
  // This builds a dynamic SET clause like: company_name = $1, status = $2
  const fields = Object.keys(data) as (keyof UpdateJobInput)[];
  if (fields.length === 0) return null;

  const setClauses = fields.map((field, index) => `${field} = $${index + 1}`);
  const values = fields.map(field => data[field]);

  // updated_at is always set to now on any update
  const query = `
    UPDATE job_applications
    SET ${setClauses.join(', ')}, updated_at = NOW()
    WHERE id = $${fields.length + 1} AND user_id = $${fields.length + 2}
    RETURNING *
  `;

  const result = await pool.query(query, [...values, id, userId]);
  return result.rows[0]; // undefined if no row matched (wrong id or user)
};

// Delete a job application
export const deleteJob = async (id: number, userId: number) => {
  const result = await pool.query(
    `DELETE FROM job_applications WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId]
  );
  return result.rows[0]; // returns { id } if deleted, undefined if not found
};
