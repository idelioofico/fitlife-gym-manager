// This file should only be used in the backend
// Frontend should use the API endpoints instead

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_1o8TpLXEyQcZ@ep-spring-moon-a4luj7p4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

export default pool;
