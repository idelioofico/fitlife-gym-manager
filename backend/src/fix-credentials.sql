-- Fix user credentials
-- Password for all users: admin123

UPDATE profiles SET password = '$2a$10$5n.fh1NggmXDMm9eoFqLwOY5W4bW.4lBOt6X55cRI0vpOmynFdaVi' WHERE email = 'admin@fitlife.com';
UPDATE profiles SET password = '$2a$10$5n.fh1NggmXDMm9eoFqLwOY5W4bW.4lBOt6X55cRI0vpOmynFdaVi' WHERE email = 'manager@fitlife.com';
UPDATE profiles SET password = '$2a$10$5n.fh1NggmXDMm9eoFqLwOY5W4bW.4lBOt6X55cRI0vpOmynFdaVi' WHERE email = 'instructor@fitlife.com';
UPDATE profiles SET password = '$2a$10$5n.fh1NggmXDMm9eoFqLwOY5W4bW.4lBOt6X55cRI0vpOmynFdaVi' WHERE email = 'receptionist@fitlife.com'; 