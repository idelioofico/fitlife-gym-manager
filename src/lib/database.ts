
import { Pool } from 'pg';

const connectionString = "postgresql://neondb_owner:npg_1o8TpLXEyQcZ@ep-spring-moon-a4luj7p4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
});

export default pool;
