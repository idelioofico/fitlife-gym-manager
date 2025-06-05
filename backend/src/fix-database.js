const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_1o8TpLXEyQcZ@ep-spring-moon-a4luj7p4-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function fixDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // First, fix any NULL names
    await client.query(`
      UPDATE profiles 
      SET name = CASE 
        WHEN email = 'admin@fitlife.com' THEN 'Admin'
        WHEN email = 'manager@fitlife.com' THEN 'Manager'
        WHEN email = 'instructor@fitlife.com' THEN 'Instructor'
        WHEN email = 'receptionist@fitlife.com' THEN 'Receptionist'
        ELSE 'Unknown'
      END
      WHERE name IS NULL
    `);

    // Then update passwords
    await client.query(`
      UPDATE profiles 
      SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
      WHERE email IN (
        'admin@fitlife.com',
        'manager@fitlife.com',
        'instructor@fitlife.com',
        'receptionist@fitlife.com'
      )
    `);

    await client.query('COMMIT');
    console.log('Database fixed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error fixing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 