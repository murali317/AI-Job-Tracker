import pool from '../config/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Shape of the user row from the database
interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
}

// ─── Helper: Generate JWT ──────────────────────────────────────────────────

const generateToken = (userId: number, email: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not defined in .env');
  }

  // jwt.sign() creates the token.
  // - 1st arg: payload (data baked into the token)
  // - 2nd arg: secret key (used to sign/verify)
  // - 3rd arg: options (expiresIn = when the token expires)
  return jwt.sign(
    { userId, email },
    secret,
    { expiresIn: '7d' } // Token valid for 7 days
  );
};

// ─── Signup ────────────────────────────────────────────────────────────────

export const signup = async (data: SignupInput) => {
  const { name, email, password } = data;

  // 1. Check if a user with this email already exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    // Return null to signal "email taken" — the controller decides the HTTP status
    return { error: 'Email already registered' };
  }

  // 2. Hash the password
  // The "10" is the salt rounds — higher = more secure but slower.
  // 10 is the standard recommendation.
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Insert the new user into the database
  const result = await pool.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, hashedPassword]
  );

  const newUser = result.rows[0];

  // 4. Generate a JWT token for the new user (auto-login after signup)
  const token = generateToken(newUser.id, newUser.email);

  return {
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    },
    token,
  };
};

// ─── Login ─────────────────────────────────────────────────────────────────

export const login = async (data: LoginInput) => {
  const { email, password } = data;

  // 1. Find the user by email
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  const user: UserRow | undefined = result.rows[0];

  if (!user) {
    return { error: 'Invalid email or password' };
  }

  // 2. Compare the incoming password with the stored hash
  // bcrypt.compare() hashes the incoming password and checks if it matches
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // Same error message for both wrong email & wrong password
    // This is a security practice — don't reveal WHICH one was wrong
    return { error: 'Invalid email or password' };
  }

  // 3. Generate a JWT token
  const token = generateToken(user.id, user.email);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};
