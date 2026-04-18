import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Pool = a managed collection of reusable database connections.
// Instead of connecting/disconnecting on every query, the pool keeps
// connections open and hands them out as needed — much more efficient.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // SSL is required by Neon (and most cloud PostgreSQL providers)
  // rejectUnauthorized: false tells pg to accept Neon's certificate
  ssl: {
    rejectUnauthorized: false,
  },
});

// Test the connection when the app starts
// pool.connect() borrows a client from the pool, then releases it back
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    return;
  }
  console.log('✅ Connected to PostgreSQL database');
  release(); // Always release the client back to the pool when done
});

// We export the pool so any file in the app can run queries using it
export default pool;
