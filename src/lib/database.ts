// This file should only be used in the backend
// Frontend should use the API endpoints instead

// Local Database Service using localStorage
export interface DatabaseSchema {
  products: Product[];
  sales: Sale[];
  members: Member[];
  classes: Class[];
  checkins: CheckIn[];
  expenses: Expense[];
  documents: Document[];
  categories: Category[];
  settings: AppSettings;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  sku: string;
  barcode?: string;
  supplier?: string;
  image?: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  number: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mpesa';
  paymentStatus: 'paid' | 'pending' | 'partial';
  notes?: string;
  createdBy: string;
  invoiceGenerated: boolean;
  receiptGenerated: boolean;
}

export interface SaleItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Member {
  id: string;
  memberNumber: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  gender: 'male' | 'female';
  emergencyContact: string;
  emergencyPhone: string;
  plan: string;
  status: 'active' | 'inactive' | 'suspended';
  joinDate: string;
  lastPayment: string;
  nextPayment: string;
  qrCode: string;
  fitnessGoals: string[];
  medicalRestrictions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  name: string;
  instructor: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  capacity: number;
  schedule: ClassSchedule[];
  description: string;
  equipment: string[];
  price: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface ClassSchedule {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
}

export interface CheckIn {
  id: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  timestamp: string;
  area: string;
  status: 'entered' | 'exited';
  duration?: number;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  supplier?: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mpesa';
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  receiptNumber?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  number: string;
  type: 'invoice' | 'receipt' | 'quote';
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerNuit?: string;
  date: string;
  dueDate?: string;
  items: DocumentItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  type: 'product' | 'expense' | 'class';
}

export interface AppSettings {
  gymName: string;
  gymAddress: string;
  gymPhone: string;
  gymEmail: string;
  gymNuit: string;
  taxRate: number;
  currency: string;
  timezone: string;
  language: string;
  theme: 'light' | 'dark';
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  backup: {
    autoBackup: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    lastBackup?: string;
  };
}

class LocalDatabase {
  private static instance: LocalDatabase;
  private dbName = 'hefel_gym_db';

  private constructor() {
    this.initializeDatabase();
  }

  public static getInstance(): LocalDatabase {
    if (!LocalDatabase.instance) {
      LocalDatabase.instance = new LocalDatabase();
    }
    return LocalDatabase.instance;
  }

  private initializeDatabase(): void {
    if (!localStorage.getItem(this.dbName)) {
      const initialData: DatabaseSchema = {
        products: [],
        sales: [],
        members: [],
        classes: [],
        checkins: [],
        expenses: [],
        documents: [],
        categories: [
          { id: 'suplementos', name: 'Suplementos', description: 'Suplementos alimentares e proteínas', color: 'bg-blue-100 text-blue-800', type: 'product' },
          { id: 'vestuario', name: 'Vestuário', description: 'Roupas e uniformes', color: 'bg-green-100 text-green-800', type: 'product' },
          { id: 'acessorios', name: 'Acessórios', description: 'Acessórios fitness e utilitários', color: 'bg-purple-100 text-purple-800', type: 'product' },
          { id: 'equipamentos', name: 'Equipamentos', description: 'Equipamentos de treino', color: 'bg-orange-100 text-orange-800', type: 'product' },
          { id: 'aluguel', name: 'Aluguel', description: 'Custos de aluguel', color: 'bg-red-100 text-red-800', type: 'expense' },
          { id: 'salarios', name: 'Salários', description: 'Folha de pagamento', color: 'bg-yellow-100 text-yellow-800', type: 'expense' },
          { id: 'utilidades', name: 'Utilidades', description: 'Água, luz, internet', color: 'bg-indigo-100 text-indigo-800', type: 'expense' },
          { id: 'limpeza', name: 'Limpeza', description: 'Produtos de limpeza', color: 'bg-teal-100 text-teal-800', type: 'expense' }
        ],
        settings: {
          gymName: 'Ginásio Hefel',
          gymAddress: 'Maputo, Moçambique',
          gymPhone: '+258 84 000 0000',
          gymEmail: 'info@hefel.co.mz',
          gymNuit: '123456789',
          taxRate: 0.17,
          currency: 'MZN',
          timezone: 'Africa/Maputo',
          language: 'pt-MZ',
          theme: 'light',
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          backup: {
            autoBackup: true,
            frequency: 'daily'
          }
        }
      };
      
      localStorage.setItem(this.dbName, JSON.stringify(initialData));
    }
  }

  private getData(): DatabaseSchema {
    const data = localStorage.getItem(this.dbName);
    return data ? JSON.parse(data) : null;
  }

  private saveData(data: DatabaseSchema): void {
    localStorage.setItem(this.dbName, JSON.stringify(data));
  }

  // Generic CRUD operations
  public getAll<T extends keyof DatabaseSchema>(table: T): DatabaseSchema[T] {
    const data = this.getData();
    return data[table];
  }

  public getById<T extends keyof DatabaseSchema>(table: T, id: string): any {
    const data = this.getData();
    const items = data[table] as any[];
    return items.find(item => item.id === id);
  }

  public create<T extends keyof DatabaseSchema>(table: T, item: any): any {
    const data = this.getData();
    const items = data[table] as any[];
    
    const newItem = {
      ...item,
      id: item.id || this.generateId(),
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    items.push(newItem);
    data[table] = items as any;
    this.saveData(data);
    
    return newItem;
  }

  public update<T extends keyof DatabaseSchema>(table: T, id: string, updates: Partial<any>): any {
    const data = this.getData();
    const items = data[table] as any[];
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;
    
    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    data[table] = items as any;
    this.saveData(data);
    
    return items[index];
  }

  public delete<T extends keyof DatabaseSchema>(table: T, id: string): boolean {
    const data = this.getData();
    const items = data[table] as any[];
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) return false;
    
    data[table] = filteredItems as any;
    this.saveData(data);
    
    return true;
  }

  // Specialized methods
  public generateSaleNumber(): string {
    const sales = this.getAll('sales');
    const year = new Date().getFullYear();
    const count = sales.filter(s => s.number.includes(year.toString())).length + 1;
    return `VD${year}${String(count).padStart(3, '0')}`;
  }

  public generateMemberNumber(): string {
    const members = this.getAll('members');
    const count = members.length + 1;
    return `M${String(count).padStart(4, '0')}`;
  }

  public generateDocumentNumber(type: 'invoice' | 'receipt' | 'quote'): string {
    const documents = this.getAll('documents');
    const year = new Date().getFullYear();
    const prefix = type === 'invoice' ? 'FT' : type === 'receipt' ? 'RC' : 'OR';
    const count = documents.filter(d => d.number.startsWith(prefix + year)).length + 1;
    return `${prefix}${year}${String(count).padStart(3, '0')}`;
  }

  public getActiveMembers(): Member[] {
    return this.getAll('members').filter(m => m.status === 'active');
  }

  public getLowStockProducts(): Product[] {
    return this.getAll('products').filter(p => p.stock <= p.minStock && p.status === 'active');
  }

  public getTodayCheckins(): CheckIn[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getAll('checkins').filter(c => c.timestamp.startsWith(today));
  }

  public getSalesByDateRange(startDate: string, endDate: string): Sale[] {
    return this.getAll('sales').filter(s => s.date >= startDate && s.date <= endDate);
  }

  public getExpensesByDateRange(startDate: string, endDate: string): Expense[] {
    return this.getAll('expenses').filter(e => e.date >= startDate && e.date <= endDate);
  }

  // Backup and restore
  public exportData(): string {
    return JSON.stringify(this.getData(), null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      this.saveData(data);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  public clearAllData(): void {
    localStorage.removeItem(this.dbName);
    this.initializeDatabase();
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Statistics and analytics
  public getStatistics() {
    const products = this.getAll('products');
    const sales = this.getAll('sales');
    const members = this.getAll('members');
    const expenses = this.getAll('expenses');
    const checkins = this.getAll('checkins');

    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().substr(0, 7);

    return {
      products: {
        total: products.length,
        active: products.filter(p => p.status === 'active').length,
        lowStock: products.filter(p => p.stock <= p.minStock).length,
        outOfStock: products.filter(p => p.stock === 0).length,
        totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0)
      },
      sales: {
        total: sales.length,
        today: sales.filter(s => s.date === today).length,
        thisMonth: sales.filter(s => s.date.startsWith(thisMonth)).length,
        totalRevenue: sales.filter(s => s.paymentStatus === 'paid').reduce((sum, s) => sum + s.total, 0),
        pendingRevenue: sales.filter(s => s.paymentStatus === 'pending').reduce((sum, s) => sum + s.total, 0)
      },
      members: {
        total: members.length,
        active: members.filter(m => m.status === 'active').length,
        inactive: members.filter(m => m.status === 'inactive').length,
        suspended: members.filter(m => m.status === 'suspended').length
      },
      expenses: {
        total: expenses.length,
        thisMonth: expenses.filter(e => e.date.startsWith(thisMonth)).length,
        totalAmount: expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0),
        pendingAmount: expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0)
      },
      checkins: {
        today: checkins.filter(c => c.timestamp.startsWith(today)).length,
        thisMonth: checkins.filter(c => c.timestamp.startsWith(thisMonth)).length,
        currentOccupancy: checkins.filter(c => c.status === 'entered' && c.timestamp.startsWith(today)).length
      }
    };
  }
}

export const db = LocalDatabase.getInstance();
