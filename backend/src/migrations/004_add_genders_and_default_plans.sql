-- Migration to add genders table and default plans

-- Create genders table
CREATE TABLE IF NOT EXISTS genders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default genders
INSERT INTO genders (code, name, is_active) VALUES 
('M', 'Masculino', true),
('F', 'Feminino', true),
('Other', 'Outro', true)
ON CONFLICT (code) DO NOTHING;

-- Insert default plans if they don't exist
INSERT INTO plans (name, description, price, duration_days, is_active) 
SELECT 'Básico Mensal', 'Plano básico mensal com acesso completo ao ginásio', 1500.00, 30, true
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Básico Mensal');

INSERT INTO plans (name, description, price, duration_days, is_active) 
SELECT 'Premium Mensal', 'Plano premium mensal com acesso completo + aulas de grupo', 2500.00, 30, true
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Premium Mensal');

INSERT INTO plans (name, description, price, duration_days, is_active) 
SELECT 'Anual Premium', 'Plano anual premium com desconto especial', 25000.00, 365, true
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Anual Premium');

INSERT INTO plans (name, description, price, duration_days, is_active) 
SELECT 'Estudante', 'Plano especial para estudantes com desconto', 1200.00, 30, true
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Estudante');

INSERT INTO plans (name, description, price, duration_days, is_active) 
SELECT 'Familiar', 'Plano familiar para até 4 pessoas', 4000.00, 30, true
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Familiar');

INSERT INTO plans (name, description, price, duration_days, is_active) 
SELECT 'Trimestral', 'Plano trimestral com desconto', 4000.00, 90, true
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Trimestral');

-- Create trigger for genders updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists and create new one for genders
DROP TRIGGER IF EXISTS update_genders_updated_at ON genders;
CREATE TRIGGER update_genders_updated_at
    BEFORE UPDATE ON genders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 