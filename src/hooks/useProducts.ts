// useProducts.ts
// Hook para CRUD de produtos

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, ProductCategory } from '../types/product';

import { env } from '../config/env';

const API_URL = env.API_URL;
const getAuthToken = () => localStorage.getItem('auth_token');

// Mock data for testing
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Proteína Whey',
    description: 'Suplemento proteico de alta qualidade',
    shortDescription: 'Proteína para ganho de massa muscular',
    categoryId: '1',
    category: 'Suplementos',
    price: 2500,
    costPrice: 1800,
    marginPercent: 38.9,
    stock: 50,
    minStock: 10,
    sku: 'WHEY001',
    images: [],
    isActive: true,
    taxRate: 17,
    tags: ['proteína', 'suplemento'],
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Creatina',
    description: 'Creatina monohidratada para performance',
    shortDescription: 'Melhora performance nos treinos',
    categoryId: '1',
    category: 'Suplementos',
    price: 1200,
    costPrice: 800,
    marginPercent: 50,
    stock: 30,
    minStock: 5,
    sku: 'CREAT001',
    images: [],
    isActive: true,
    taxRate: 17,
    tags: ['creatina', 'performance'],
    isFeatured: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
          name: 'Camiseta Hefel',
    description: 'Camiseta oficial do ginásio',
    shortDescription: 'Camiseta de algodão premium',
    categoryId: '2',
    category: 'Vestuário',
    price: 800,
    costPrice: 400,
    marginPercent: 100,
    stock: 25,
    minStock: 5,
    sku: 'SHIRT001',
    images: [],
    isActive: true,
    taxRate: 17,
    tags: ['camiseta', 'vestuário'],
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const fetchProducts = async (): Promise<Product[]> => {
  try {
    const res = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar produtos');
    return res.json();
  } catch (error) {
    console.warn('Using mock products data:', error);
    return mockProducts;
  }
};

const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar produto');
    return res.json();
  } catch (error) {
    console.warn('Using mock product data:', error);
    return mockProducts.find(p => p.id === id) || null;
  }
};

const createProduct = async (product: Partial<Product>): Promise<Product> => {
  try {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Erro ao criar produto');
    return res.json();
  } catch (error) {
    console.warn('Mock create product:', error);
    throw error;
  }
};

const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Erro ao atualizar produto');
    return res.json();
  } catch (error) {
    console.warn('Mock update product:', error);
    throw error;
  }
};

const deleteProduct = async (id: string): Promise<void> => {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    if (!res.ok) throw new Error('Erro ao excluir produto');
  } catch (error) {
    console.warn('Mock delete product:', error);
    throw error;
  }
};

const fetchCategories = async (): Promise<ProductCategory[]> => [];

export function useProducts() {
  const queryClient = useQueryClient();
  const products = useQuery(['products'], fetchProducts);
  const categories = useQuery(['productCategories'], fetchCategories);

  const create = useMutation(createProduct, {
    onSuccess: () => queryClient.invalidateQueries(['products'])
  });
  const update = useMutation(({ id, data }: { id: string; data: Partial<Product> }) => updateProduct(id, data), {
    onSuccess: () => queryClient.invalidateQueries(['products'])
  });
  const remove = useMutation(deleteProduct, {
    onSuccess: () => queryClient.invalidateQueries(['products'])
  });

  return { products, categories, create, update, remove };
} 