// Frontend Billing Service for API communication

import { 
  Invoice, 
  Receipt, 
  CreditNote, 
  CompanyConfig,
  FinancialDashboard,
  CreateInvoiceRequest,
  RegisterPaymentRequest,
  CreateCreditNoteRequest,
  InvoiceFilters,
  ReceiptFilters,
  BillingSummary,
  BillingApiResponse,
  PaginatedBillingResponse
} from '@/types/billing';

const API_BASE = '/api/billing';
const getAuthToken = () => localStorage.getItem('auth_token');

class BillingService {
  
  // =============================================
  // DASHBOARD & CONFIGURATION
  // =============================================
  
  async getFinancialDashboard(): Promise<FinancialDashboard> {
    const response = await fetch(`${API_BASE}/dashboard`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!response.ok) throw new Error('Failed to fetch financial dashboard');
    return response.json();
  }

  async getCompanyConfig(): Promise<CompanyConfig> {
    const response = await fetch(`${API_BASE}/config`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!response.ok) throw new Error('Failed to fetch company config');
    return response.json();
  }

  async updateCompanyConfig(config: Partial<CompanyConfig>): Promise<CompanyConfig> {
    const response = await fetch(`${API_BASE}/config`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(config)
    });
    if (!response.ok) throw new Error('Failed to update company config');
    return response.json();
  }

  // =============================================
  // INVOICES (FACTURAS)
  // =============================================

  async getInvoices(filters?: InvoiceFilters): Promise<PaginatedBillingResponse<Invoice>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = `${API_BASE}/invoices${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!response.ok) throw new Error('Failed to fetch invoices');
    return response.json();
  }

  async getInvoiceById(id: string): Promise<Invoice> {
    const response = await fetch(`${API_BASE}/invoices/${id}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!response.ok) throw new Error('Failed to fetch invoice');
    return response.json();
  }

  async createInvoice(invoice: CreateInvoiceRequest): Promise<Invoice> {
    const response = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(invoice)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create invoice');
    }
    return response.json();
  }

  // =============================================
  // RECEIPTS (RECIBOS)
  // =============================================

  async getReceipts(filters?: ReceiptFilters): Promise<PaginatedBillingResponse<Receipt>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    
    const url = `${API_BASE}/receipts${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!response.ok) throw new Error('Failed to fetch receipts');
    return response.json();
  }

  async registerPayment(payment: RegisterPaymentRequest): Promise<{
    receipt: Receipt;
    invoice_status: string;
    total_paid: number;
  }> {
    const response = await fetch(`${API_BASE}/receipts`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(payment)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to register payment');
    }
    return response.json();
  }

  // =============================================
  // CREDIT NOTES (NOTAS DE CRÉDITO)
  // =============================================

  async getCreditNotes(): Promise<CreditNote[]> {
    const response = await fetch(`${API_BASE}/credit-notes`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!response.ok) throw new Error('Failed to fetch credit notes');
    return response.json();
  }

  async createCreditNote(creditNote: CreateCreditNoteRequest): Promise<CreditNote> {
    const response = await fetch(`${API_BASE}/credit-notes`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(creditNote)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create credit note');
    }
    return response.json();
  }

  async getMemberCredits(memberId: string): Promise<any[]> {
    const response = await fetch(`${API_BASE}/member-credits/${memberId}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!response.ok) throw new Error('Failed to fetch member credits');
    return response.json();
  }

  async payInvoiceWithCredits(paymentData: {
    factura_id: string;
    valor_pago?: number;
    metodo_pagamento: string;
    referencia_pagamento?: string;
    descricao?: string;
    aplicar_creditos?: boolean;
  }): Promise<any> {
    const response = await fetch(`${API_BASE}/pay-invoice-with-credits`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(paymentData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to process payment with credits');
    }
    return response.json();
  }

  // =============================================
  // JOBS & AUTOMATION
  // =============================================

  async triggerDailyInvoiceGeneration(): Promise<any> {
    const response = await fetch(`${API_BASE}/jobs/daily-invoices`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to trigger daily invoice generation');
    }
    return response.json();
  }

  // =============================================
  // REPORTS
  // =============================================

  async getBillingSummary(startDate: string, endDate: string): Promise<BillingSummary> {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate
    });
    
    const response = await fetch(`${API_BASE}/reports/summary?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!response.ok) throw new Error('Failed to fetch billing summary');
    return response.json();
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  formatCurrency(amount: number, currency: string = 'MT'): string {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: currency === 'MT' ? 'MZN' : currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'paga':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencida':
        return 'bg-red-100 text-red-800';
      case 'cancelada':
        return 'bg-gray-100 text-gray-800';
      case 'parcialmente_paga':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'paga':
        return 'Paga';
      case 'pendente':
        return 'Pendente';
      case 'vencida':
        return 'Vencida';
      case 'cancelada':
        return 'Cancelada';
      case 'parcialmente_paga':
        return 'Parcialmente Paga';
      default:
        return status;
    }
  }

  getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'mpesa':
        return 'M-Pesa';
      case 'emola':
        return 'E-Mola';
      case 'bci':
        return 'BCI';
      case 'dinheiro':
        return 'Dinheiro';
      case 'transferencia':
        return 'Transferência';
      default:
        return method;
    }
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(date));
  }

  formatDateTime(date: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }
}

// Export singleton instance
export const billingService = new BillingService();
export default billingService; 