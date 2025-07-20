// InvoiceForm.tsx
// Formulário de factura

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';
import { Document } from '@/types/document';

interface InvoiceFormProps {
  initialData?: Document | null;
  onSubmit?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ initialData, onSubmit, onCancel, isEditing }) => {
  const { create, update } = useDocuments();
  const [form, setForm] = useState<Partial<Document>>(initialData || {});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'total' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      if (isEditing && initialData) {
        await update.mutateAsync({ id: initialData.id, data: form });
      } else {
        await create.mutateAsync(form);
      }
      setSuccess(true);
      if (onSubmit) onSubmit();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar documento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Factura</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              name="customerName"
              placeholder="Cliente"
              value={form.customerName || ''}
              onChange={handleChange}
              required
            />
            <Input
              name="number"
              placeholder="Número"
              value={form.number || ''}
              onChange={handleChange}
              required
              disabled={isEditing}
            />
            <Input
              name="total"
              placeholder="Total"
              type="number"
              value={form.total || ''}
              onChange={handleChange}
              required
            />
            <Input
              name="issueDate"
              placeholder="Data de Emissão"
              type="date"
              value={form.issueDate || ''}
              onChange={handleChange}
              required
            />
            <div className="flex gap-2 justify-end">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
              )}
              <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Documento'}</Button>
            </div>
          </form>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">Documento salvo com sucesso!</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceForm; 