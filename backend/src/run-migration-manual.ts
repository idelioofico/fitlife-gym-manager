import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

// Use the same connection string as in the main server
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_1o8TpLXEyQcZ@ep-spring-moon-a4luj7p4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function runMigration() {
  try {
    // Get migration file from command line argument
    const migrationFile = process.argv[2];
    if (!migrationFile) {
      console.error('Please provide a migration file as argument');
      process.exit(1);
    }
    
    // Read the migration file
    const migrationPath = migrationFile.startsWith('/') ? migrationFile : join(__dirname, '..', '..', migrationFile);
    const migrationSQL = readFileSync(migrationPath, 'utf8');

    console.log('Running migration:', migrationFile);
    console.log('Migration SQL:', migrationSQL);

    // Execute the migration
    await pool.query(migrationSQL);
    console.log('Migration executed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await pool.end();
  }
}

runMigration(); 