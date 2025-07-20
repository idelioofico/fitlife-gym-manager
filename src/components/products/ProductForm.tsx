// ProductForm.tsx
// Formulário para criar/editar produto

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/product';

interface ProductFormProps {
  initialData?: Product | null;
  onSubmit?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onCancel, isEditing }) => {
  const { create, update } = useProducts();
  const [form, setForm] = useState<Partial<Product>>(initialData || {});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'price' || name === 'stock' ? Number(value) : value }));
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
      setError(err.message || 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        name="name"
        placeholder="Nome do Produto"
        value={form.name || ''}
        onChange={handleChange}
        required
      />
      <Input
        name="category"
        placeholder="Categoria"
        value={form.category || ''}
        onChange={handleChange}
        required
      />
      <Input
        name="price"
        placeholder="Preço"
        type="number"
        value={form.price || ''}
        onChange={handleChange}
        required
      />
      <Input
        name="stock"
        placeholder="Stock"
        type="number"
        value={form.stock || ''}
        onChange={handleChange}
        required
      />
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancelar</Button>
        )}
        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Produto'}</Button>
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </form>
  );
};

export default ProductForm; 