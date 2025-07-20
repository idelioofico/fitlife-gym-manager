// SaleForm.tsx
// Formulário para nova venda

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSales } from '@/hooks/useSales';
import { Sale } from '@/types/product';

interface SaleFormProps {
  initialData?: Sale | null;
  onSubmit?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const SaleForm: React.FC<SaleFormProps> = ({ initialData, onSubmit, onCancel, isEditing }) => {
  const { create, update } = useSales();
  const [form, setForm] = useState<Partial<Sale>>(initialData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'total' ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEditing && initialData) {
        await update.mutateAsync({ id: initialData.id, data: form });
      } else {
        await create.mutateAsync(form);
      }
      if (onSubmit) onSubmit();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar venda');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        name="customerName"
        placeholder="Cliente"
        value={form.customerName || ''}
        onChange={handleChange}
        required
      />
      <Input
        name="saleNumber"
        placeholder="Referência"
        value={form.saleNumber || ''}
        onChange={handleChange}
        required
      />
      <Input
        name="total"
        placeholder="Valor Total"
        type="number"
        value={form.total || ''}
        onChange={handleChange}
        required
      />
      <Input
        name="saleDate"
        placeholder="Data"
        type="date"
        value={form.saleDate || ''}
        onChange={handleChange}
        required
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
        )}
        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Venda'}</Button>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </form>
  );
};

export default SaleForm; 