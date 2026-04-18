import { Router } from 'express';
import authMiddleware from '../middleware/auth';
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

// Apply authMiddleware to ALL routes in this router.
// Every request must include a valid JWT token in the Authorization header.
// Without this, you get 401 Unauthorized.
router.use(authMiddleware);

// Each line maps: HTTP method + path → controller function
router.get('/', getAllJobs);         // GET    /api/jobs
router.get('/:id', getJobById);     // GET    /api/jobs/5
router.post('/', createJob);        // POST   /api/jobs
router.put('/:id', updateJob);      // PUT    /api/jobs/5
router.delete('/:id', deleteJob);   // DELETE /api/jobs/5

export default router;
