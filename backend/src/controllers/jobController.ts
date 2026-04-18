import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as jobService from '../services/jobService';

// ─── GET /api/jobs ──────────────────────────────────────────────────────────
export const getAllJobs = async (req: AuthRequest, res: Response) => {
  try {
    // req.user is set by the auth middleware (decoded from JWT token)
    const userId = req.user!.userId;
    const jobs = await jobService.getAllJobs(userId);
    res.status(200).json({ status: 'success', data: jobs });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch jobs' });
  }
};

// ─── GET /api/jobs/:id ──────────────────────────────────────────────────────
export const getJobById = async (req: AuthRequest, res: Response) => {
  try {
    // req.params.id is always a string — we convert it to a number
    // Cast to string first: newer @types/express types params as string | string[]
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid job ID' });
      return;
    }

    const userId = req.user!.userId;
    const job = await jobService.getJobById(id, userId);

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
export const createJob = async (req: AuthRequest, res: Response) => {
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

    const userId = req.user!.userId;
    const newJob = await jobService.createJob(userId, {
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
export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid job ID' });
      return;
    }

    const userId = req.user!.userId;
    const updatedJob = await jobService.updateJob(id, userId, req.body);

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
export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      res.status(400).json({ status: 'error', message: 'Invalid job ID' });
      return;
    }

    const userId = req.user!.userId;
    const deleted = await jobService.deleteJob(id, userId);

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
