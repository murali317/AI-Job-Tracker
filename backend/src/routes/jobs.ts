import { Router } from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from '../controllers/jobController';

// Router is a mini Express app — it only handles routes.
// We mount it in index.ts under the '/api/jobs' prefix.
const router = Router();

// Each line maps: HTTP method + path → controller function
router.get('/', getAllJobs);         // GET    /api/jobs
router.get('/:id', getJobById);     // GET    /api/jobs/5
router.post('/', createJob);        // POST   /api/jobs
router.put('/:id', updateJob);      // PUT    /api/jobs/5
router.delete('/:id', deleteJob);   // DELETE /api/jobs/5

export default router;
