-- Force set the name for each user
UPDATE profiles SET name = 'Admin' WHERE email = 'admin@fitlife.com';
UPDATE profiles SET name = 'Manager' WHERE email = 'manager@fitlife.com';
UPDATE profiles SET name = 'Instructor' WHERE email = 'instructor@fitlife.com';
UPDATE profiles SET name = 'Receptionist' WHERE email = 'receptionist@fitlife.com';

-- Update default users with correct password hashes
UPDATE profiles SET password = '$2b$10$8Kn7KM2ShW8CbYaKsbjNvuoNm.Sa6EBM931Y/3Rm/VgbvzGvZTggm' WHERE email = 'admin@fitlife.com';
UPDATE profiles SET password = '$2b$10$8Kn7KM2ShW8CbYaKsbjNvuoNm.Sa6EBM931Y/3Rm/VgbvzGvZTggm' WHERE email = 'manager@fitlife.com';
UPDATE profiles SET password = '$2b$10$8Kn7KM2ShW8CbYaKsbjNvuoNm.Sa6EBM931Y/3Rm/VgbvzGvZTggm' WHERE email = 'instructor@fitlife.com';
UPDATE profiles SET password = '$2b$10$8Kn7KM2ShW8CbYaKsbjNvuoNm.Sa6EBM931Y/3Rm/VgbvzGvZTggm' WHERE email = 'receptionist@fitlife.com'; 