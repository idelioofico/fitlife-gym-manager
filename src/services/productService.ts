// productService.ts
// Service para produtos

import { Product, ProductCategory } from '../types/product';

export async function getProducts(): Promise<Product[]> {
  // TODO: Implementar chamada real à API
  return [];
}

export async function getProductById(id: string): Promise<Product | null> {
  // TODO: Implementar chamada real à API
  return null;
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  // TODO: Implementar chamada real à API
  return { ...product, id: 'mock' } as Product;
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  // TODO: Implementar chamada real à API
  return { ...product, id } as Product;
}

export async function deleteProduct(id: string): Promise<void> {
  // TODO: Implementar chamada real à API
}

export async function getCategories(): Promise<ProductCategory[]> {
  // TODO: Implementar chamada real à API
  return [];
} 