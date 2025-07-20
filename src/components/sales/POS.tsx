// POS.tsx
// Ponto de venda (Point of Sale)

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/product';

const POS = () => {
  const { products } = useProducts();
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');

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

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Grid de produtos */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-4">POS - Ponto de Venda</h1>
        <div className="mb-4 flex gap-2">
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        {products.isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : products.isError ? (
          <div className="text-center py-8 text-red-600">Erro ao carregar produtos</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="cursor-pointer hover:shadow-lg" onClick={() => addToCart(product)}>
                <CardHeader>
                  <CardTitle className="text-base">{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-lg">{product.price.toLocaleString('pt-MZ')} MZN</span>
                    <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>Adicionar</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      {/* Carrinho */}
      <div className="w-full lg:w-1/3 xl:w-1/4">
        <Card>
          <CardHeader>
            <CardTitle>Carrinho</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">Carrinho vazio</div>
            ) : (
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="block text-xs text-muted-foreground">Qtd: {item.qty}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{(item.price * item.qty).toLocaleString('pt-MZ')} MZN</span>
                      <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.id)}>-</Button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-4">
                  <span>Total</span>
                  <span>{total.toLocaleString('pt-MZ')} MZN</span>
                </div>
                <Button className="w-full mt-4">Finalizar Venda</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default POS; 