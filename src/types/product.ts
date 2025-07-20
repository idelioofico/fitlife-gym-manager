export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  category: string;
  price: number;
  costPrice: number;
  marginPercent: number;
  stock: number;
  minStock: number;
  maxStock?: number;
  barcode?: string;
  sku: string;
  images: string[];
  isActive: boolean;
  supplierId?: string;
  taxRate: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  tags: string[];
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  image?: string;
  isActive: boolean;
  parentId?: string;
  sortOrder: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  taxAmount: number;
  total: number;
  paymentMethod: 'mpesa' | 'emola' | 'netshop' | 'cash' | 'card';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded';
  saleStatus: 'draft' | 'confirmed' | 'completed' | 'cancelled';
  saleDate: string;
  sellerId: string;
  sellerName: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
} 