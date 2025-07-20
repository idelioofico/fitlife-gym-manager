export interface Expense {
  id: string;
  referenceNumber: string;
  category: string;
  categoryId: string;
  description: string;
  amount: number;
  currency: 'MZN' | 'USD' | 'EUR';
  date: string;
  dueDate?: string;
  supplierId?: string;
  supplierName?: string;
  paymentMethod: 'mpesa' | 'emola' | 'netshop' | 'cash' | 'bank_transfer';
  status: 'pending' | 'approved' | 'paid' | 'overdue' | 'cancelled';
  receiptUrl?: string;
  taxAmount: number;
  notes?: string;
  attachments: string[];
  createdBy: string;
  approvedBy?: string;
  approvalDate?: string;
  recurring?: {
    frequency: 'monthly' | 'quarterly' | 'yearly';
    endDate?: string;
    nextDate: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  budgetLimit?: number;
  monthlyBudget?: number;
  isActive: boolean;
  parentId?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  taxNumber?: string;
  paymentTerms: number;
  contactPerson?: string;
  isActive: boolean;
  totalSpent: number;
  lastPurchaseDate?: string;
  createdAt: string;
} 