-- Database cleanup script to identify and fix invalid member IDs

-- Check for any members with invalid UUID formats
SELECT id, name, email 
FROM members 
WHERE id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

-- Check for any plan_id references that are invalid
SELECT id, name, plan_id 
FROM members 
WHERE plan_id IS NOT NULL 
AND plan_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$';

-- Check for any orphaned plan_id references
SELECT id, name, plan_id 
FROM members 
WHERE plan_id IS NOT NULL 
AND plan_id NOT IN (SELECT id FROM plans);

-- Check current members count and show sample data
SELECT COUNT(*) as total_members FROM members;
SELECT id, name, email, created_at FROM members ORDER BY created_at DESC LIMIT 5;

-- Check plans count and show sample data
SELECT COUNT(*) as total_plans FROM plans;
SELECT id, name, price, duration_days FROM plans ORDER BY created_at DESC LIMIT 5;

-- If there are any invalid member IDs, you would need to:
-- 1. Back up the data
-- 2. Delete the invalid records
-- 3. Re-create them with proper UUIDs
-- 4. Update any references to the old IDs

-- Example of how to fix invalid member IDs (USE WITH CAUTION):
-- UPDATE members SET id = gen_random_uuid() WHERE id = '8';
-- Note: This would break any foreign key references, so you'd need to update those too

-- Check for any references to the problematic member ID '8' in other tables
SELECT 'payments' as table_name, COUNT(*) as count FROM payments WHERE member_id = '8'
UNION ALL
SELECT 'checkins' as table_name, COUNT(*) as count FROM checkins WHERE member_id = '8'
UNION ALL
SELECT 'reservations' as table_name, COUNT(*) as count FROM reservations WHERE member_id = '8'
UNION ALL
SELECT 'member_workouts' as table_name, COUNT(*) as count FROM member_workouts WHERE member_id = '8'; 