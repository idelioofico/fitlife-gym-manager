// useDocuments.ts
// Hook para CRUD de documentos fiscais

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document } from '../types/document';

import { env } from '../config/env';

const API_URL = env.API_URL;
const getAuthToken = () => localStorage.getItem('auth_token');

// Mock data for testing
const mockDocuments: Document[] = [
  {
    id: '1',
    type: 'invoice',
    number: 'FT-001/2024',
    customerName: 'João Silva',
    customerEmail: 'joao@email.com',
    customerPhone: '+258 84 123 4567',
    customerAddress: 'Rua da Paz, 123, Maputo',
    items: [
      {
        description: 'Proteína Whey',
        quantity: 2,
        unitPrice: 2500,
        total: 5000
      }
    ],
    subtotal: 5000,
    taxAmount: 850,
    discountAmount: 0,
    total: 5850,
    status: 'paid',
    issueDate: '2024-06-15',
    dueDate: '2024-06-30',
    paymentMethod: 'mpesa',
    notes: 'Fatura referente à compra de suplementos',
    createdBy: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    type: 'quote',
    number: 'ORC-002/2024',
    customerName: 'Ana Costa',
    customerEmail: 'ana@email.com',
    customerPhone: '+258 85 987 6543',
    customerAddress: 'Av. Julius Nyerere, 456, Maputo',
    items: [
      {
        description: 'Plano Premium - 6 meses',
        quantity: 1,
        unitPrice: 15000,
        total: 15000
      },
      {
        description: 'Personal Trainer - 10 sessões',
        quantity: 1,
        unitPrice: 8000,
        total: 8000
      }
    ],
    subtotal: 23000,
    taxAmount: 3910,
    discountAmount: 1150,
    total: 25760,
    status: 'pending',
    issueDate: '2024-06-16',
    dueDate: '2024-06-23',
    notes: 'Orçamento para plano premium com personal trainer',
    createdBy: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    type: 'receipt',
    number: 'REC-003/2024',
    customerName: 'Pedro Oliveira',
    customerEmail: 'pedro@email.com',
    customerPhone: '+258 86 555 7890',
    customerAddress: 'Rua dos Trabalhadores, 789, Matola',
    items: [
      {
        description: 'Mensalidade Junho 2024',
        quantity: 1,
        unitPrice: 1500,
        total: 1500
      }
    ],
    subtotal: 1500,
    taxAmount: 255,
    discountAmount: 0,
    total: 1755,
    status: 'paid',
    issueDate: '2024-06-17',
    paymentMethod: 'cash',
    notes: 'Recibo de pagamento da mensalidade',
    createdBy: 'user1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const fetchDocuments = async (): Promise<Document[]> => {
  try {
    const res = await fetch(`${API_URL}/documents`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar documentos');
    return res.json();
  } catch (error) {
    console.warn('Using mock documents data:', error);
    return mockDocuments;
  }
};

const fetchDocumentById = async (id: string): Promise<Document | null> => {
  try {
    const res = await fetch(`${API_URL}/documents/${id}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar documento');
    return res.json();
  } catch (error) {
    console.warn('Using mock document data:', error);
    return mockDocuments.find(d => d.id === id) || null;
  }
};

const createDocument = async (doc: Partial<Document>): Promise<Document> => {
  try {
    const res = await fetch(`${API_URL}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
      body: JSON.stringify(doc)
    });
    if (!res.ok) throw new Error('Erro ao criar documento');
    return res.json();
  } catch (error) {
    console.warn('Mock create document:', error);
    throw error;
  }
};

const updateDocument = async (id: string, doc: Partial<Document>): Promise<Document> => {
  try {
    const res = await fetch(`${API_URL}/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
      body: JSON.stringify(doc)
    });
    if (!res.ok) throw new Error('Erro ao atualizar documento');
    return res.json();
  } catch (error) {
    console.warn('Mock update document:', error);
    throw error;
  }
};

const deleteDocument = async (id: string): Promise<void> => {
  try {
    const res = await fetch(`${API_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!res.ok) throw new Error('Erro ao excluir documento');
  } catch (error) {
    console.warn('Mock delete document:', error);
    throw error;
  }
};

export function useDocuments() {
  const queryClient = useQueryClient();
  const documents = useQuery(['documents'], fetchDocuments);

  const create = useMutation(createDocument, {
    onSuccess: () => queryClient.invalidateQueries(['documents'])
  });
  const update = useMutation(({ id, data }: { id: string; data: Partial<Document> }) => updateDocument(id, data), {
    onSuccess: () => queryClient.invalidateQueries(['documents'])
  });
  const remove = useMutation(deleteDocument, {
    onSuccess: () => queryClient.invalidateQueries(['documents'])
  });

  return { documents, create, update, remove };
} 