// ProductCatalog.tsx
// Grid de produtos

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/product';
import ProductForm from './ProductForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

const ProductCatalog = () => {
  const { products, remove } = useProducts();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let data: Product[] = products.data || [];
    if (search) {
      data = data.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    return data;
  }, [products.data, search]);

  const handleEdit = (prod: Product) => {
    setEditing(prod);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      remove.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Catálogo de Produtos</h1>
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button variant="outline">Filtrar</Button>
      </div>
      {products.isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : products.isError ? (
        <div className="text-center py-8 text-red-600">Erro ao carregar produtos</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">{product.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <span className="font-bold text-lg">{product.price.toLocaleString('pt-MZ')} MZN</span>
                  <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                  <span className="text-xs text-muted-foreground">Categoria: {product.category}</span>
                  <div className="flex gap-2 mt-2">
                    {isAdmin && (
                      <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>Editar</Button>
                    )}
                    {isAdmin && (
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)} disabled={remove.isLoading}>Excluir</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editing && (
            <ProductForm
              initialData={editing}
              isEditing
              onSubmit={handleCloseModal}
              onCancel={handleCloseModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCatalog; 