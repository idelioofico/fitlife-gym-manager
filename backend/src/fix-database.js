const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@db:5432/fitlife'
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
      SET password = '$2b$10$8Kn7KM2ShW8CbYaKsbjNvuoNm.Sa6EBM931Y/3Rm/VgbvzGvZTggm'
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