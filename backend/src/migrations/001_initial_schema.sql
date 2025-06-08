-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    plan VARCHAR(50),
    plan_id UUID,
    status VARCHAR(20) DEFAULT 'active',
    join_date DATE,
    end_date DATE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    instructor VARCHAR(100) NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_participants INTEGER,
    color VARCHAR(7),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id),
    member_id UUID NOT NULL REFERENCES members(id),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id VARCHAR(100),
    member_id UUID NOT NULL REFERENCES members(id),
    amount DECIMAL(10,2) NOT NULL,
    plan VARCHAR(50) NOT NULL,
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create workout_exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES workouts(id),
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    sets INTEGER,
    reps VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create member_workouts table
CREATE TABLE IF NOT EXISTS member_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id),
    workout_id UUID NOT NULL REFERENCES workouts(id),
    assigned_date DATE,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create checkins table
CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES members(id),
    check_type VARCHAR(20) NOT NULL,
    check_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    gym_name VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    description TEXT,
    business_hours TEXT,
    mpesa_enabled BOOLEAN DEFAULT false,
    mpesa_number VARCHAR(20),
    emola_enabled BOOLEAN DEFAULT false,
    emola_number VARCHAR(20),
    netshop_enabled BOOLEAN DEFAULT false,
    netshop_id VARCHAR(100),
    cash_enabled BOOLEAN DEFAULT true,
    payment_reminder_days INTEGER DEFAULT 7,
    auto_backup BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT true,
    payment_reminders BOOLEAN DEFAULT true,
    class_reminders BOOLEAN DEFAULT true,
    marketing_messages BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Administrador do sistema', '["all"]'),
('manager', 'Gerente da academia', '["read", "write", "update", "manage_users", "manage_payments", "manage_classes", "manage_workouts", "view_reports"]'),
('instructor', 'Instrutor', '["read", "write", "update", "manage_classes", "manage_workouts"]'),
('receptionist', 'Recepcionista', '["read", "write", "update", "manage_payments"]'),
('user', 'Utilizador básico', '["read"]');

-- Insert default admin user (password: admin123)
INSERT INTO profiles (name, email, password, role, status) VALUES
('Admin', 'admin@fitlife.com', '$2b$10$8Kn7KM2ShW8CbYaKsbjNvuoNm.Sa6EBM931Y/3Rm/VgbvzGvZTggm', 'admin', 'active');

-- Insert default manager user (password: manager123)
INSERT INTO profiles (name, email, password, role, status) VALUES
('Manager', 'manager@fitlife.com', '$2b$10$8Kn7KM2ShW8CbYaKsbjNvuoNm.Sa6EBM931Y/3Rm/VgbvzGvZTggm', 'manager', 'active');

-- Insert default instructor user (password: instructor123)
INSERT INTO profiles (name, email, password, role, status) VALUES
('Instructor', 'instructor@fitlife.com', '$2b$10$8Kn7KM2ShW8CbYaKsbjNvuoNm.Sa6EBM931Y/3Rm/VgbvzGvZTggm', 'instructor', 'active');

-- Insert default receptionist user (password: receptionist123)
INSERT INTO profiles (name, email, password, role, status) VALUES
('Receptionist', 'receptionist@fitlife.com', '$2b$10$8Kn7KM2ShW8CbYaKsbjNvuoNm.Sa6EBM931Y/3Rm/VgbvzGvZTggm', 'receptionist', 'active');

-- Insert default settings
INSERT INTO settings (gym_name, email, phone) VALUES
('FitLife Gym', 'contact@fitlife.com', '+1234567890');

-- Insert default notification settings
INSERT INTO notification_settings DEFAULT VALUES; 


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


-- Update default users with correct password hashes
UPDATE profiles SET password = '$2b$10$8Kn7KM2ShW8CbYaKsbjNvuoNm.Sa6EBM931Y/3Rm/VgbvzGvZTggm' WHERE email = 'admin@fitlife.com';
UPDATE profiles SET password = '$2b$10$8Kn7KM2ShW8CbYaKsbjNvuoNm.Sa6EBM931Y/3Rm/VgbvzGvZTggm' WHERE email = 'manager@fitlife.com';
UPDATE profiles SET password = '$2b$10$8Kn7KM2ShW8CbYaKsbjNvuoNm.Sa6EBM931Y/3Rm/VgbvzGvZTggm' WHERE email = 'instructor@fitlife.com';
UPDATE profiles SET password = '$2b$10$8Kn7KM2ShW8CbYaKsbjNvuoNm.Sa6EBM931Y/3Rm/VgbvzGvZTggm' WHERE email = 'receptionist@fitlife.com';
