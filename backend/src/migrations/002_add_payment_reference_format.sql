-- Add payment_reference_format column to settings table
ALTER TABLE settings 
ADD COLUMN IF NOT EXISTS payment_reference_format VARCHAR(100) DEFAULT 'PAY-{YYYY}-{MM}-{DD}-{XXXX}';

-- Update existing settings to have the default format if the column was just added
UPDATE settings 
SET payment_reference_format = 'PAY-{YYYY}-{MM}-{DD}-{XXXX}' 
WHERE payment_reference_format IS NULL; 