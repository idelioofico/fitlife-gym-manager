// useExpenses.ts
// Hook para CRUD de despesas

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Expense, ExpenseCategory, Supplier } from '../types/expense';

import { env } from '../config/env';

const API_URL = env.API_URL;
const getAuthToken = () => localStorage.getItem('auth_token');

// Mock data for testing
const mockExpenses: Expense[] = [
  {
    id: '1',
    referenceNumber: 'EXP-001',
    category: 'Aluguel',
    categoryId: '1',
    description: 'Aluguel mensal do ginásio',
    amount: 25000,
    currency: 'MZN',
    date: '2024-06-01',
    dueDate: '2024-06-05',
    supplierId: '1',
    supplierName: 'Imobiliária Central',
    paymentMethod: 'bank_transfer',
    status: 'paid',
    taxAmount: 4250,
    notes: 'Pagamento referente ao mês de junho',
    attachments: [],
    createdBy: 'user1',
    approvedBy: 'admin1',
    approvalDate: '2024-06-01',
    tags: ['aluguel', 'fixo'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    referenceNumber: 'EXP-002',
    category: 'Equipamentos',
    categoryId: '2',
    description: 'Manutenção das máquinas de musculação',
    amount: 8500,
    currency: 'MZN',
    date: '2024-06-03',
    dueDate: '2024-06-10',
    supplierId: '2',
    supplierName: 'TechFit Equipamentos',
    paymentMethod: 'mpesa',
    status: 'pending',
    taxAmount: 1445,
    notes: 'Manutenção preventiva mensal',
    attachments: [],
    createdBy: 'user1',
    tags: ['manutenção', 'equipamentos'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    referenceNumber: 'EXP-003',
    category: 'Limpeza',
    categoryId: '3',
    description: 'Produtos de limpeza e higienização',
    amount: 3200,
    currency: 'MZN',
    date: '2024-06-05',
    supplierId: '3',
    supplierName: 'Clean Pro',
    paymentMethod: 'cash',
    status: 'paid',
    taxAmount: 544,
    notes: 'Compra mensal de produtos de limpeza',
    attachments: [],
    createdBy: 'user1',
    approvedBy: 'admin1',
    approvalDate: '2024-06-05',
    tags: ['limpeza', 'higiene'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const fetchExpenses = async (): Promise<Expense[]> => {
  try {
    const res = await fetch(`${API_URL}/expenses`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar despesas');
    return res.json();
  } catch (error) {
    console.warn('Using mock expenses data:', error);
    return mockExpenses;
  }
};

const fetchExpenseById = async (id: string): Promise<Expense | null> => {
  try {
    const res = await fetch(`${API_URL}/expenses/${id}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar despesa');
    return res.json();
  } catch (error) {
    console.warn('Using mock expense data:', error);
    return mockExpenses.find(e => e.id === id) || null;
  }
};

const createExpense = async (expense: Partial<Expense>): Promise<Expense> => {
  try {
    const res = await fetch(`${API_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
      body: JSON.stringify(expense)
    });
    if (!res.ok) throw new Error('Erro ao criar despesa');
    return res.json();
  } catch (error) {
    console.warn('Mock create expense:', error);
    throw error;
  }
};

const updateExpense = async (id: string, expense: Partial<Expense>): Promise<Expense> => {
  try {
    const res = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
      body: JSON.stringify(expense)
    });
    if (!res.ok) throw new Error('Erro ao atualizar despesa');
    return res.json();
  } catch (error) {
    console.warn('Mock update expense:', error);
    throw error;
  }
};

const deleteExpense = async (id: string): Promise<void> => {
  try {
    const res = await fetch(`${API_URL}/expenses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!res.ok) throw new Error('Erro ao excluir despesa');
  } catch (error) {
    console.warn('Mock delete expense:', error);
    throw error;
  }
};

const fetchCategories = async (): Promise<ExpenseCategory[]> => [];
const fetchSuppliers = async (): Promise<Supplier[]> => [];

export function useExpenses() {
  const queryClient = useQueryClient();
  const expenses = useQuery(['expenses'], fetchExpenses);
  const categories = useQuery(['expenseCategories'], fetchCategories);
  const suppliers = useQuery(['suppliers'], fetchSuppliers);

  const create = useMutation(createExpense, {
    onSuccess: () => queryClient.invalidateQueries(['expenses'])
  });
  const update = useMutation(({ id, data }: { id: string; data: Partial<Expense> }) => updateExpense(id, data), {
    onSuccess: () => queryClient.invalidateQueries(['expenses'])
  });
  const remove = useMutation(deleteExpense, {
    onSuccess: () => queryClient.invalidateQueries(['expenses'])
  });

  return { expenses, categories, suppliers, create, update, remove };
} 