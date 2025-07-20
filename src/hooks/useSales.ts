// useSales.ts
// Hook para CRUD de vendas

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Sale } from '../types/product';

import { env } from '../config/env';

const API_URL = env.API_URL;
const getAuthToken = () => localStorage.getItem('auth_token');

// Mock data for testing
const mockSales: Sale[] = [
  {
    id: '1',
    saleNumber: 'VND-001',
    customerName: 'João Silva',
    customerEmail: 'joao@email.com',
    customerPhone: '+258 84 123 4567',
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Proteína Whey',
        quantity: 2,
        unitPrice: 2500,
        discount: 0,
        total: 5000
      }
    ],
    subtotal: 5000,
    discountAmount: 0,
    discountPercent: 0,
    taxAmount: 850,
    total: 5850,
    paymentMethod: 'mpesa',
    paymentStatus: 'paid',
    saleStatus: 'completed',
    saleDate: '2024-06-15',
    sellerId: 'user1',
    sellerName: 'Maria Santos',
    notes: 'Cliente fidelizado',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    saleNumber: 'VND-002',
    customerName: 'Ana Costa',
    customerEmail: 'ana@email.com',
    customerPhone: '+258 85 987 6543',
    items: [
      {
        id: '2',
        productId: '2',
        productName: 'Creatina',
        quantity: 1,
        unitPrice: 1200,
        discount: 0,
        total: 1200
      },
      {
        id: '3',
        productId: '3',
        productName: 'Camiseta Hefel',
        quantity: 1,
        unitPrice: 800,
        discount: 80,
        total: 720
      }
    ],
    subtotal: 1920,
    discountAmount: 80,
    discountPercent: 4.2,
    taxAmount: 326,
    total: 2246,
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    saleStatus: 'completed',
    saleDate: '2024-06-16',
    sellerId: 'user1',
    sellerName: 'Maria Santos',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    saleNumber: 'VND-003',
    customerName: 'Pedro Oliveira',
    customerEmail: 'pedro@email.com',
    customerPhone: '+258 86 555 7890',
    items: [
      {
        id: '4',
        productId: '1',
        productName: 'Proteína Whey',
        quantity: 1,
        unitPrice: 2500,
        discount: 0,
        total: 2500
      }
    ],
    subtotal: 2500,
    discountAmount: 0,
    discountPercent: 0,
    taxAmount: 425,
    total: 2925,
    paymentMethod: 'emola',
    paymentStatus: 'pending',
    saleStatus: 'confirmed',
    saleDate: '2024-06-17',
    sellerId: 'user1',
    sellerName: 'Maria Santos',
    notes: 'Aguardando confirmação do pagamento',
    createdAt: new Date().toISOString()
  }
];

const fetchSales = async (): Promise<Sale[]> => {
  try {
    const res = await fetch(`${API_URL}/sales`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar vendas');
    return res.json();
  } catch (error) {
    console.warn('Using mock sales data:', error);
    return mockSales;
  }
};

const fetchSaleById = async (id: string): Promise<Sale | null> => {
  try {
    const res = await fetch(`${API_URL}/sales/${id}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar venda');
    return res.json();
  } catch (error) {
    console.warn('Using mock sale data:', error);
    return mockSales.find(s => s.id === id) || null;
  }
};

const createSale = async (sale: Partial<Sale>): Promise<Sale> => {
  try {
    const res = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
      body: JSON.stringify(sale)
    });
    if (!res.ok) throw new Error('Erro ao criar venda');
    return res.json();
  } catch (error) {
    console.warn('Mock create sale:', error);
    throw error;
  }
};

const updateSale = async (id: string, sale: Partial<Sale>): Promise<Sale> => {
  try {
    const res = await fetch(`${API_URL}/sales/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
      body: JSON.stringify(sale)
    });
    if (!res.ok) throw new Error('Erro ao atualizar venda');
    return res.json();
  } catch (error) {
    console.warn('Mock update sale:', error);
    throw error;
  }
};

const deleteSale = async (id: string): Promise<void> => {
  try {
    const res = await fetch(`${API_URL}/sales/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!res.ok) throw new Error('Erro ao excluir venda');
  } catch (error) {
    console.warn('Mock delete sale:', error);
    throw error;
  }
};

export function useSales() {
  const queryClient = useQueryClient();
  const sales = useQuery(['sales'], fetchSales);

  const create = useMutation(createSale, {
    onSuccess: () => queryClient.invalidateQueries(['sales'])
  });
  const update = useMutation(({ id, data }: { id: string; data: Partial<Sale> }) => updateSale(id, data), {
    onSuccess: () => queryClient.invalidateQueries(['sales'])
  });
  const remove = useMutation(deleteSale, {
    onSuccess: () => queryClient.invalidateQueries(['sales'])
  });

  return { sales, create, update, remove };
} 