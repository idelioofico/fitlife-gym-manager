-- Force set the name for each user
UPDATE profiles SET name = 'Admin' WHERE email = 'admin@fitlife.com';
UPDATE profiles SET name = 'Manager' WHERE email = 'manager@fitlife.com';
UPDATE profiles SET name = 'Instructor' WHERE email = 'instructor@fitlife.com';
UPDATE profiles SET name = 'Receptionist' WHERE email = 'receptionist@fitlife.com';

-- Update default users with correct password hashes
UPDATE profiles SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE email = 'admin@fitlife.com';
UPDATE profiles SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE email = 'manager@fitlife.com';
UPDATE profiles SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE email = 'instructor@fitlife.com';
UPDATE profiles SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE email = 'receptionist@fitlife.com'; 