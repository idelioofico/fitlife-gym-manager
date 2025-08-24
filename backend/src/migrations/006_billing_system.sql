-- Migration to create complete billing system for Hefel Gym
-- Tables: facturas, recibos, notas_credito, configuracoes_empresa

-- Create facturas table (Commercial Invoices)
CREATE TABLE IF NOT EXISTS facturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(50) NOT NULL UNIQUE, -- FT2024001, FT2024002, etc
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id),
    
    -- Invoice dates
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_vencimento DATE NOT NULL,
    
    -- Invoice amounts (in MT - Metical)
    subtotal DECIMAL(12,2) NOT NULL,
    taxa_iva DECIMAL(5,2) NOT NULL DEFAULT 16.00, -- 16% IVA rate
    valor_iva DECIMAL(12,2) NOT NULL,
    total DECIMAL(12,2) NOT NULL,
    
    -- Invoice status
    estado VARCHAR(20) NOT NULL DEFAULT 'pendente', -- pendente, paga, vencida, cancelada, parcialmente_paga
    
    -- Service description
    descricao_servico TEXT NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(12,2) NOT NULL,
    
    -- Payment methods accepted
    metodos_pagamento_aceites JSONB DEFAULT '["mpesa", "emola", "bci", "dinheiro"]',
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES profiles(id),
    
    -- Plan renewal info
    plano_inicio DATE,
    plano_fim DATE
);

-- Create recibos table (Payment Receipts)
CREATE TABLE IF NOT EXISTS recibos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(50) NOT NULL UNIQUE, -- RB2024001, RB2024002, etc
    factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
    
    -- Payment details
    valor_pago DECIMAL(12,2) NOT NULL,
    metodo_pagamento VARCHAR(20) NOT NULL, -- mpesa, emola, bci, dinheiro
    referencia_pagamento VARCHAR(100), -- Transaction reference from payment provider
    
    -- Payment dates
    data_pagamento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Receipt details
    descricao TEXT,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES profiles(id)
);

-- Create notas_credito table (Credit Notes)
CREATE TABLE IF NOT EXISTS notas_credito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(50) NOT NULL UNIQUE, -- NC2024001, NC2024002, etc
    factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
    
    -- Credit note details
    motivo TEXT NOT NULL,
    valor_credito DECIMAL(12,2) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'total', -- total, parcial
    
    -- Credit note date
    data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Approval info
    aprovado_por UUID REFERENCES profiles(id),
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES profiles(id)
);

-- Create credito_usado table (Credit Usage Tracking)
CREATE TABLE IF NOT EXISTS credito_usado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credito_id UUID NOT NULL REFERENCES notas_credito(id) ON DELETE CASCADE,
    factura_id UUID NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
    
    -- Usage details
    valor_usado DECIMAL(12,2) NOT NULL,
    data_uso TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Audit fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES profiles(id)
);

-- Create configuracoes_empresa table (Company Settings)
CREATE TABLE IF NOT EXISTS configuracoes_empresa (
    id SERIAL PRIMARY KEY,
    nome_empresa VARCHAR(100) NOT NULL DEFAULT 'Hefel Lda',
    nuit VARCHAR(20) NOT NULL DEFAULT '401059330',
    endereco TEXT NOT NULL DEFAULT 'Av Cardeal Alxexandre dos Santos, Maputo',
    email VARCHAR(100) NOT NULL DEFAULT 'hefel.lda@gmail.com',
    telefone1 VARCHAR(20) NOT NULL DEFAULT '+258 87 01 35 980',
    telefone2 VARCHAR(20) DEFAULT '+258 87 01 35 983',
    
    -- Payment method configurations
    mpesa_number VARCHAR(20) DEFAULT '84 01 35 981',
    emola_number VARCHAR(20) DEFAULT '87 01 35 983',
    bci_account VARCHAR(50) DEFAULT '2269 1142 2100.01',
    bci_nib VARCHAR(50) DEFAULT '0008.0000.26911422101.13',
    
    -- Fiscal parameters
    taxa_iva DECIMAL(5,2) NOT NULL DEFAULT 16.00,
    moeda VARCHAR(5) NOT NULL DEFAULT 'MT',
    dias_vencimento INTEGER NOT NULL DEFAULT 30,
    
    -- Document numbering
    proximo_numero_factura INTEGER NOT NULL DEFAULT 1,
    proximo_numero_recibo INTEGER NOT NULL DEFAULT 1,
    proximo_numero_nota_credito INTEGER NOT NULL DEFAULT 1,
    ano_corrente INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    
    -- Audit fields
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID REFERENCES profiles(id)
);

-- Add billing-related fields to members table
ALTER TABLE members ADD COLUMN IF NOT EXISTS plano_data_inicio DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS plano_data_fim DATE;
ALTER TABLE members ADD COLUMN IF NOT EXISTS plano_estado VARCHAR(20) DEFAULT 'activo'; -- activo, expirado, suspenso, cancelado
ALTER TABLE members ADD COLUMN IF NOT EXISTS ultima_factura_id UUID REFERENCES facturas(id);
ALTER TABLE members ADD COLUMN IF NOT EXISTS notificacoes_enabled BOOLEAN DEFAULT true;
ALTER TABLE members ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(20);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_facturas_member_id ON facturas(member_id);
CREATE INDEX IF NOT EXISTS idx_facturas_estado ON facturas(estado);
CREATE INDEX IF NOT EXISTS idx_facturas_data_vencimento ON facturas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_facturas_numero ON facturas(numero);

CREATE INDEX IF NOT EXISTS idx_recibos_factura_id ON recibos(factura_id);
CREATE INDEX IF NOT EXISTS idx_recibos_data_pagamento ON recibos(data_pagamento);
CREATE INDEX IF NOT EXISTS idx_recibos_numero ON recibos(numero);

CREATE INDEX IF NOT EXISTS idx_notas_credito_factura_id ON notas_credito(factura_id);
CREATE INDEX IF NOT EXISTS idx_notas_credito_numero ON notas_credito(numero);

CREATE INDEX IF NOT EXISTS idx_members_plano_data_fim ON members(plano_data_fim);
CREATE INDEX IF NOT EXISTS idx_members_plano_estado ON members(plano_estado);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_facturas_timestamp ON facturas;
CREATE TRIGGER update_facturas_timestamp
    BEFORE UPDATE ON facturas
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_configuracoes_empresa_timestamp ON configuracoes_empresa;
CREATE TRIGGER update_configuracoes_empresa_timestamp
    BEFORE UPDATE ON configuracoes_empresa
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Insert default company configuration
INSERT INTO configuracoes_empresa DEFAULT VALUES
ON CONFLICT DO NOTHING;

-- Add constraints to ensure data integrity
ALTER TABLE facturas ADD CONSTRAINT check_factura_estado 
    CHECK (estado IN ('pendente', 'paga', 'vencida', 'cancelada', 'parcialmente_paga'));

ALTER TABLE facturas ADD CONSTRAINT check_factura_valores 
    CHECK (subtotal >= 0 AND valor_iva >= 0 AND total >= 0);

ALTER TABLE facturas ADD CONSTRAINT check_factura_datas 
    CHECK (data_vencimento >= data_emissao);

ALTER TABLE recibos ADD CONSTRAINT check_recibo_valor 
    CHECK (valor_pago > 0);

ALTER TABLE recibos ADD CONSTRAINT check_metodo_pagamento 
    CHECK (metodo_pagamento IN ('mpesa', 'emola', 'bci', 'dinheiro', 'transferencia'));

ALTER TABLE notas_credito ADD CONSTRAINT check_nota_credito_valor 
    CHECK (valor_credito > 0);

ALTER TABLE notas_credito ADD CONSTRAINT check_nota_credito_tipo 
    CHECK (tipo IN ('total', 'parcial'));

ALTER TABLE members ADD CONSTRAINT check_plano_estado 
    CHECK (plano_estado IN ('activo', 'expirado', 'suspenso', 'cancelado'));

ALTER TABLE members ADD CONSTRAINT check_plano_datas 
    CHECK (plano_data_fim >= plano_data_inicio OR plano_data_inicio IS NULL OR plano_data_fim IS NULL);

-- Create view for financial dashboard
CREATE OR REPLACE VIEW dashboard_financeiro AS
SELECT 
    CURRENT_DATE as data,
    -- Today's invoices
    (SELECT COUNT(*) FROM facturas WHERE data_emissao = CURRENT_DATE) as facturas_hoje,
    (SELECT COALESCE(SUM(total), 0) FROM facturas WHERE data_emissao = CURRENT_DATE) as valor_facturado_hoje,
    
    -- Today's payments
    (SELECT COUNT(*) FROM recibos WHERE DATE(data_pagamento) = CURRENT_DATE) as pagamentos_hoje,
    (SELECT COALESCE(SUM(valor_pago), 0) FROM recibos WHERE DATE(data_pagamento) = CURRENT_DATE) as valor_recebido_hoje,
    
    -- Pending invoices
    (SELECT COUNT(*) FROM facturas WHERE estado = 'pendente') as facturas_pendentes,
    (SELECT COALESCE(SUM(total), 0) FROM facturas WHERE estado = 'pendente') as valor_pendente,
    
    -- Overdue invoices
    (SELECT COUNT(*) FROM facturas WHERE estado = 'pendente' AND data_vencimento < CURRENT_DATE) as facturas_vencidas,
    (SELECT COALESCE(SUM(total), 0) FROM facturas WHERE estado = 'pendente' AND data_vencimento < CURRENT_DATE) as valor_vencido,
    
    -- Monthly totals
    (SELECT COALESCE(SUM(total), 0) FROM facturas WHERE EXTRACT(MONTH FROM data_emissao) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM data_emissao) = EXTRACT(YEAR FROM CURRENT_DATE)) as receita_mensal,
    
    -- Members with expiring plans (next 7 days)
    (SELECT COUNT(*) FROM members WHERE plano_data_fim BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days' AND plano_estado = 'activo') as planos_expirando
; 