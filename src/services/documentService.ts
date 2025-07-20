// documentService.ts
// Service para documentos fiscais

import { Document } from '../types/document';

export async function getDocuments(): Promise<Document[]> {
  // TODO: Implementar chamada real à API
  return [];
}

export async function getDocumentById(id: string): Promise<Document | null> {
  // TODO: Implementar chamada real à API
  return null;
}

export async function createDocument(doc: Partial<Document>): Promise<Document> {
  // TODO: Implementar chamada real à API
  return { ...doc, id: 'mock' } as Document;
}

export async function updateDocument(id: string, doc: Partial<Document>): Promise<Document> {
  // TODO: Implementar chamada real à API
  return { ...doc, id } as Document;
}

export async function deleteDocument(id: string): Promise<void> {
  // TODO: Implementar chamada real à API
} 