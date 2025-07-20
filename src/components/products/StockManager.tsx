// StockManager.tsx
// Controle de stock

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/product';

const StockManager = () => {
  const { products } = useProducts();
  const [search, setSearch] = useState('');

  const filteredStock = useMemo(() => {
    let data: Product[] = products.data || [];
    if (search) {
      data = data.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    return data;
  }, [products.data, search]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Gestão de Stock</h1>
      <div className="flex gap-2 items-end">
        <Input placeholder="Buscar produto..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <Button variant="outline">Filtrar</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Produtos em Estoque</CardTitle>
        </CardHeader>
        <CardContent>
          {products.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : products.isError ? (
            <div className="text-center py-8 text-red-600">Erro ao carregar produtos</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Produto</th>
                    <th className="text-left p-2">Estoque</th>
                    <th className="text-left p-2">Mínimo</th>
                    <th className="text-left p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStock.map((prod) => (
                    <tr key={prod.id} className="border-b">
                      <td className="p-2">{prod.name}</td>
                      <td className="p-2">{prod.stock}</td>
                      <td className="p-2">{prod.minStock}</td>
                      <td className="p-2">
                        <Button size="sm" variant="outline">Ajustar</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockManager; 