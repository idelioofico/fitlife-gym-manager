const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const isValidUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

async function fixInvalidMemberIds() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking for invalid member IDs...');
    
    // Find all members with invalid UUIDs
    const invalidMembersResult = await client.query(`
      SELECT id, name, email, created_at 
      FROM members 
      WHERE id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    `);
    
    if (invalidMembersResult.rows.length === 0) {
      console.log('✅ No invalid member IDs found!');
      return;
    }
    
    console.log(`⚠️  Found ${invalidMembersResult.rows.length} members with invalid IDs:`);
    invalidMembersResult.rows.forEach(member => {
      console.log(`  - ID: ${member.id}, Name: ${member.name}, Email: ${member.email}`);
    });
    
    // Check for references to these invalid IDs
    console.log('\n🔍 Checking for references to invalid IDs...');
    
    for (const member of invalidMembersResult.rows) {
      const oldId = member.id;
      
      // Check references in other tables
      const referencesCheck = await client.query(`
        SELECT 'payments' as table_name, COUNT(*) as count FROM payments WHERE member_id = $1
        UNION ALL
        SELECT 'checkins' as table_name, COUNT(*) as count FROM checkins WHERE member_id = $1
        UNION ALL
        SELECT 'reservations' as table_name, COUNT(*) as count FROM reservations WHERE member_id = $1
        UNION ALL
        SELECT 'member_workouts' as table_name, COUNT(*) as count FROM member_workouts WHERE member_id = $1
      `, [oldId]);
      
      let hasReferences = false;
      referencesCheck.rows.forEach(ref => {
        if (parseInt(ref.count) > 0) {
          console.log(`  - Member ${oldId} has ${ref.count} references in ${ref.table_name}`);
          hasReferences = true;
        }
      });
      
      if (!hasReferences) {
        console.log(`  - Member ${oldId} has no references in other tables`);
      }
    }
    
    // Ask for confirmation (in a real scenario, you'd want user input)
    console.log('\n⚠️  IMPORTANT: This script will delete members with invalid IDs and no references.');
    console.log('If members have references in other tables, manual intervention is required.');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Delete members with invalid IDs that have no references
    for (const member of invalidMembersResult.rows) {
      const oldId = member.id;
      
      // Check if member has any references
      const referencesCount = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM payments WHERE member_id = $1) +
          (SELECT COUNT(*) FROM checkins WHERE member_id = $1) +
          (SELECT COUNT(*) FROM reservations WHERE member_id = $1) +
          (SELECT COUNT(*) FROM member_workouts WHERE member_id = $1) as total_references
      `, [oldId]);
      
      const totalRefs = parseInt(referencesCount.rows[0].total_references);
      
      if (totalRefs === 0) {
        // Safe to delete
        await client.query('DELETE FROM members WHERE id = $1', [oldId]);
        console.log(`✅ Deleted member with invalid ID: ${oldId} (${member.name})`);
      } else {
        console.log(`⚠️  Skipped member ${oldId} (${member.name}) - has ${totalRefs} references`);
        console.log('   This member needs manual intervention to fix references.');
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n✅ Database cleanup completed!');
    
    // Show final member count
    const finalCount = await client.query('SELECT COUNT(*) as count FROM members');
    console.log(`📊 Total members after cleanup: ${finalCount.rows[0].count}`);
    
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('❌ Error during database cleanup:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await fixInvalidMemberIds();
    console.log('\n🎉 Database cleanup completed successfully!');
  } catch (error) {
    console.error('💥 Database cleanup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
main(); 