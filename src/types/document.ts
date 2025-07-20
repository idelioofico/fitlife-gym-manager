export interface Document {
  id: string;
  type: 'quotation' | 'invoice' | 'receipt' | 'credit_note' | 'debit_note' | 'advance_payment';
  number: string;
  prefix: string;
  saleId?: string;
  customerId?: string;
  customerName: string;
  customerEmail?: string;
  customerAddress?: string;
  customerTaxNumber?: string;
  issueDate: string;
  dueDate?: string;
  validUntil?: string;
  items: DocumentItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentTerms?: string;
  notes?: string;
  terms?: string;
  parentDocumentId?: string;
  issuedBy: string;
  pdfUrl?: string;
  sentDate?: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
} 