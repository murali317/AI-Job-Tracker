-- Run this SQL in your Neon SQL Editor to create all required tables.
-- You can find the SQL Editor in your Neon dashboard under "SQL Editor".

-- ─── Users Table ─────────────────────────────────────────────────────────────
-- Stores registered user accounts.
-- Passwords will be stored as hashed strings (never plain text — we add this in Step 4).
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,           -- auto-incrementing unique ID
  name        VARCHAR(100) NOT NULL,        -- user's display name
  email       VARCHAR(150) UNIQUE NOT NULL, -- must be unique across all users
  password    VARCHAR(255) NOT NULL,        -- hashed password (bcrypt, Step 4)
  created_at  TIMESTAMP DEFAULT NOW()       -- auto-set on row creation
);

-- ─── Job Applications Table ───────────────────────────────────────────────────
-- Each row = one job the user has applied to (or is tracking).
CREATE TABLE IF NOT EXISTS job_applications (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                  -- user_id links this row to a specific user
                  -- ON DELETE CASCADE: if that user is deleted, their jobs are too

  company_name    VARCHAR(150) NOT NULL,
  job_title       VARCHAR(150) NOT NULL,
  job_url         TEXT,                     -- optional link to the job posting
  status          VARCHAR(50) NOT NULL DEFAULT 'applied',
                  -- values: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'saved'

  applied_date    DATE DEFAULT CURRENT_DATE,
  notes           TEXT,                     -- free-form notes about the application
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);
