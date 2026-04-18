import { Request, Response } from 'express';
import * as jobService from '../services/jobService';

// Temporary: hardcode userId = 1 until we add JWT auth in Step 4.
// After Step 4, this will come from req.user.id (decoded from the JWT token).
const TEMP_USER_ID = 1;

// ─── GET /api/jobs ──────────────────────────────────────────────────────────
export const getAllJobs = async (req: Request, res: Response) => {
  try {
    const jobs = await jobService.getAllJobs(TEMP_USER_ID);
    res.status(200).json({ status: 'success', data: jobs });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch jobs' });
  }
};

// ─── GET /api/jobs/:id ──────────────────────────────────────────────────────
export const getJobById = async (req: Request, res: Response) => {
  try {
    // req.params.id is always a string — we convert it to a number
    // Cast to string first: newer @types/express types params as string | string[]
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid job ID' });
      return;
    }

    const job = await jobService.getJobById(id, TEMP_USER_ID);

    if (!job) {
      // 404 = resource not found
      res.status(404).json({ status: 'error', message: 'Job not found' });
      return;
    }

    res.status(200).json({ status: 'success', data: job });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch job' });
  }
};

// ─── POST /api/jobs ─────────────────────────────────────────────────────────
export const createJob = async (req: Request, res: Response) => {
  try {
    const { company_name, job_title, job_url, status, applied_date, notes } = req.body;

    // Basic validation — company_name and job_title are required
    if (!company_name || !job_title) {
      res.status(400).json({
        status: 'error',
        message: 'company_name and job_title are required',
      });
      return;
    }

    const newJob = await jobService.createJob(TEMP_USER_ID, {
      company_name,
      job_title,
      job_url,
      status,
      applied_date,
      notes,
    });

    // 201 = "Created" (different from 200 — specifically means a resource was created)
    res.status(201).json({ status: 'success', data: newJob });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to create job' });
  }
};

// ─── PUT /api/jobs/:id ──────────────────────────────────────────────────────
export const updateJob = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid job ID' });
      return;
    }

    const updatedJob = await jobService.updateJob(id, TEMP_USER_ID, req.body);

    if (!updatedJob) {
      res.status(404).json({ status: 'error', message: 'Job not found' });
      return;
    }

    res.status(200).json({ status: 'success', data: updatedJob });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update job' });
  }
};

// ─── DELETE /api/jobs/:id ───────────────────────────────────────────────────
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid job ID' });
      return;
    }

    const deleted = await jobService.deleteJob(id, TEMP_USER_ID);

    if (!deleted) {
      res.status(404).json({ status: 'error', message: 'Job not found' });
      return;
    }

    // 204 = "No Content" — success but nothing to return
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to delete job' });
  }
};
