import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_1o8TpLXEyQcZ@ep-spring-moon-a4luj7p4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    // Start transaction
    await client.query('BEGIN');

    // Read and execute the migration file from project root
    const migrationPath = join(__dirname, '../../src/migrations/002_fix_default_users.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    await client.query(migrationSQL);
    
    // Commit transaction
    await client.query('COMMIT');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(
      'INSERT INTO profiles (email, password, role) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
      ['admin@fitlife.com', hashedPassword, 'admin']
    );

    console.log('Migration completed successfully');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 