-- Migration to add missing fields to members table
-- Adding fields that exist in the frontend form but not in the current members table

-- Add document field
ALTER TABLE members ADD COLUMN IF NOT EXISTS document VARCHAR(50);

-- Add gender field
ALTER TABLE members ADD COLUMN IF NOT EXISTS gender VARCHAR(10);

-- Add address fields
ALTER TABLE members ADD COLUMN IF NOT EXISTS street TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE members ADD COLUMN IF NOT EXISTS province VARCHAR(100);

-- Add emergency contact fields
ALTER TABLE members ADD COLUMN IF NOT EXISTS emergency_name VARCHAR(100);
ALTER TABLE members ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20);
ALTER TABLE members ADD COLUMN IF NOT EXISTS emergency_relationship VARCHAR(50);

-- Add fitness goals field
ALTER TABLE members ADD COLUMN IF NOT EXISTS fitness_goals TEXT;

-- Add medical restrictions field
ALTER TABLE members ADD COLUMN IF NOT EXISTS medical_restrictions TEXT;

-- Add updated_at field for tracking changes
ALTER TABLE members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create or update trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_members_updated_at ON members;
CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 