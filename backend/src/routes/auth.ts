import { Router } from 'express';
import { signup, login } from '../controllers/authController';

const router = Router();

// POST /api/auth/signup — Create a new user
router.post('/signup', signup);

// POST /api/auth/login — Log in and get a JWT token
router.post('/login', login);

export default router;
