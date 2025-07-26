// Billing System Types for Hefel Gym

// Invoice Status Enum
export type InvoiceStatus = 'pendente' | 'paga' | 'vencida' | 'cancelada' | 'parcialmente_paga';

// Payment Method Enum  
export type PaymentMethod = 'mpesa' | 'emola' | 'bci' | 'dinheiro' | 'transferencia';

// Plan Status Enum
export type PlanStatus = 'activo' | 'expirado' | 'suspenso' | 'cancelado';

// Credit Note Type Enum
export type CreditNoteType = 'total' | 'parcial';

// Invoice (Factura) Interface
export interface Invoice {
  id: string;
  numero: string; // FT2024001, etc
  member_id: string;
  plan_id?: string;
  
  // Dates
  data_emissao: string; // ISO date
  data_vencimento: string; // ISO date
  
  // Amounts in MT (Metical)
  subtotal: number;
  taxa_iva: number; // IVA rate (default 16%)
  valor_iva: number;
  total: number;
  
  // Status
  estado: InvoiceStatus;
  
  // Service details
  descricao_servico: string;
  quantidade: number;
  preco_unitario: number;
  
  // Payment methods accepted
  metodos_pagamento_aceites: PaymentMethod[];
  
  // Plan renewal info
  plano_inicio?: string; // ISO date
  plano_fim?: string; // ISO date
  
  // Audit fields
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  
  // Related data (for joins)
  member?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    nr_cartao?: string;
  };
  plan?: {
    id: string;
    name: string;
    price: number;
    duration_days: number;
  };
  receipts?: Receipt[];
  credit_notes?: CreditNote[];
  
  // Direct member fields from backend joins
  member_name?: string;
  member_email?: string;
  member_phone?: string;
  member_nr_cartao?: string;
  plan_name?: string;
  plan_price?: number;
}

// Receipt (Recibo) Interface
export interface Receipt {
  id: string;
  numero: string; // RB2024001, etc
  factura_id: string;
  
  // Payment details
  valor_pago: number;
  metodo_pagamento: PaymentMethod;
  referencia_pagamento?: string; // Transaction reference
  
  // Payment date
  data_pagamento: string; // ISO timestamp
  
  // Description
  descricao?: string;
  
  // Audit fields
  created_at?: string;
  created_by?: string;
  
  // Related data
  invoice?: Invoice;
  
  // Direct fields from backend joins
  factura_numero?: string;
  factura_total?: number;
  member_name?: string;
}

// Credit Note (Nota de Crédito) Interface
export interface CreditNote {
  id: string;
  numero: string; // NC2024001, etc
  factura_id: string;
  
  // Credit details
  motivo: string;
  valor_credito: number;
  tipo: CreditNoteType;
  
  // Dates
  data_emissao: string; // ISO date
  
  // Approval
  aprovado_por?: string;
  data_aprovacao?: string; // ISO timestamp
  
  // Audit fields
  created_at?: string;
  created_by?: string;
  
  // Related data
  invoice?: Invoice;
  approved_by?: {
    id: string;
    name: string;
    role: string;
  };
}

// Company Configuration (Configurações da Empresa) Interface
export interface CompanyConfig {
  id: number;
  nome_empresa: string;
  nuit: string;
  endereco: string;
  email: string;
  telefone1: string;
  telefone2?: string;
  
  // Payment method configurations
  mpesa_number?: string;
  emola_number?: string;
  bci_account?: string;
  bci_nib?: string;
  
  // Fiscal parameters
  taxa_iva: number; // IVA rate
  moeda: string; // Currency (MT)
  dias_vencimento: number; // Days until due
  
  // Document numbering
  proximo_numero_factura: number;
  proximo_numero_recibo: number;
  proximo_numero_nota_credito: number;
  ano_corrente: number;
  
  // Audit fields
  updated_at?: string;
  updated_by?: string;
}

// Financial Dashboard Interface
export interface FinancialDashboard {
  data: string; // ISO date
  
  // Today's metrics
  facturas_hoje: number;
  valor_facturado_hoje: number;
  pagamentos_hoje: number;
  valor_recebido_hoje: number;
  
  // Pending/Overdue metrics
  facturas_pendentes: number;
  valor_pendente: number;
  facturas_vencidas: number;
  valor_vencido: number;
  
  // Monthly metrics
  receita_mensal: number;
  
  // Plan expiration metrics
  planos_expirando: number; // Plans expiring in next 7 days
}

// Extended Member Interface for Billing
export interface MemberWithBilling {
  id: string;
  name: string;
  email: string;
  phone: string;
  nr_cartao?: string;
  
  // Plan information
  plan_id?: string;
  plan?: string; // Plan name
  
  // Billing-specific fields
  plano_data_inicio?: string; // ISO date
  plano_data_fim?: string; // ISO date
  plano_estado: PlanStatus;
  ultima_factura_id?: string;
  notificacoes_enabled: boolean;
  whatsapp_number?: string;
  
  // Related data
  invoices?: Invoice[];
  active_invoice?: Invoice;
  plan_details?: {
    id: string;
    name: string;
    price: number;
    duration_days: number;
  };
}

// Invoice Creation Request
export interface CreateInvoiceRequest {
  member_id: string;
  plan_id?: string;
  descricao_servico: string;
  preco_unitario: number;
  quantidade?: number;
  plano_inicio?: string;
  plano_fim?: string;
  metodos_pagamento_aceites?: PaymentMethod[];
}

// Payment Registration Request
export interface RegisterPaymentRequest {
  factura_id: string;
  valor_pago: number;
  metodo_pagamento: PaymentMethod;
  referencia_pagamento?: string;
  descricao?: string;
}

// Credit Note Creation Request
export interface CreateCreditNoteRequest {
  factura_id: string;
  motivo: string;
  valor_credito: number;
  tipo: CreditNoteType;
}

// Invoice Filters for API
export interface InvoiceFilters {
  member_id?: string;
  estado?: InvoiceStatus;
  data_inicio?: string; // ISO date
  data_fim?: string; // ISO date
  plano_vencimento_inicio?: string; // ISO date
  plano_vencimento_fim?: string; // ISO date
  valor_min?: number;
  valor_max?: number;
  page?: number;
  limit?: number;
}

// Receipt Filters for API
export interface ReceiptFilters {
  factura_id?: string;
  metodo_pagamento?: PaymentMethod;
  data_inicio?: string; // ISO date
  data_fim?: string; // ISO date
  valor_min?: number;
  valor_max?: number;
  page?: number;
  limit?: number;
}

// Billing Summary for Reports
export interface BillingSummary {
  periodo: {
    inicio: string;
    fim: string;
  };
  
  facturas: {
    total: number;
    pendentes: number;
    pagas: number;
    vencidas: number;
    canceladas: number;
  };
  
  valores: {
    total_facturado: number;
    total_recebido: number;
    valor_pendente: number;
    valor_vencido: number;
  };
  
  metodos_pagamento: {
    [key in PaymentMethod]: {
      quantidade: number;
      valor: number;
    };
  };
  
  planos_mais_vendidos: Array<{
    plan_id: string;
    plan_name: string;
    quantidade: number;
    valor_total: number;
  }>;
}

// API Response Types
export interface BillingApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  timestamp: string;
}

export interface PaginatedBillingResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
  status: 'success' | 'error';
  timestamp: string;
}

// Notification Types
export interface BillingNotification {
  id: string;
  type: 'invoice_created' | 'payment_received' | 'invoice_overdue' | 'plan_expiring';
  member_id: string;
  related_id?: string; // invoice_id, receipt_id, etc
  title: string;
  message: string;
  channels: ('email' | 'sms' | 'whatsapp')[];
  sent_at?: string;
  delivered_at?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
}

// Job/Automation Types
export interface BillingJob {
  id: string;
  type: 'daily_invoice_generation' | 'overdue_check' | 'plan_expiration_check';
  status: 'scheduled' | 'running' | 'completed' | 'failed';
  scheduled_for: string; // ISO timestamp
  started_at?: string;
  completed_at?: string;
  results?: {
    processed: number;
    success: number;
    errors: number;
    details?: any;
  };
  error_message?: string;
}

// All types are exported individually above 