-- Migration to add card number field to members table
-- Adding nr_cartao field to store member card numbers

-- Add nr_cartao field (card number)
ALTER TABLE members ADD COLUMN IF NOT EXISTS nr_cartao VARCHAR(20);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_members_nr_cartao ON members(nr_cartao);

-- Add constraint to ensure unique card numbers (excluding NULL values)
ALTER TABLE members ADD CONSTRAINT unique_nr_cartao UNIQUE (nr_cartao); 