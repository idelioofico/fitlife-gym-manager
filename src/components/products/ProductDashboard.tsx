import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/types/product';

const ProductDashboard = () => {
  const { products } = useProducts();

  // KPIs calculados
  const kpis = useMemo(() => {
    const data: Product[] = products.data || [];
    const ativos = data.filter((p) => p.isActive).length;
    const estoqueTotal = data.reduce((sum, p) => sum + (p.stock || 0), 0);
    const baixoEstoque = data.filter((p) => p.stock !== undefined && p.stock <= (p.minStock || 0)).length;
    // Produto mais vendido: mock (poderia ser calculado por vendas)
    const maisVendido = data.length > 0 ? data[0].name : '-';
    return [
      { label: 'Produtos Ativos', value: ativos },
      { label: 'Estoque Total', value: estoqueTotal },
      { label: 'Produtos em Falta', value: baixoEstoque },
      { label: 'Produto Mais Vendido', value: maisVendido },
    ];
  }, [products.data]);

  // Produtos com baixo estoque
  const lowStock = useMemo(() => {
    const data: Product[] = products.data || [];
    return data.filter((p) => p.stock !== undefined && p.stock <= (p.minStock || 0));
  }, [products.data]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard de Produtos</h1>
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader>
              <CardTitle>{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{kpi.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Filtros básicos */}
      <div className="flex gap-2 items-end">
        <Input placeholder="Buscar produto..." className="max-w-xs" />
        <Button variant="outline">Filtrar</Button>
      </div>
      {/* Gráfico de estoque (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Estoque por Categoria (Gráfico)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <span>Gráfico de estoque (Recharts)</span>
          </div>
        </CardContent>
      </Card>
      {/* Tabela de produtos com baixo estoque */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos com Baixo Estoque</CardTitle>
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
                  {lowStock.map((prod) => (
                    <tr key={prod.id} className="border-b">
                      <td className="p-2">{prod.name}</td>
                      <td className="p-2 text-red-600 font-bold">{prod.stock}</td>
                      <td className="p-2">{prod.minStock}</td>
                      <td className="p-2">
                        <Button size="sm" variant="outline">Reposição</Button>
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

export default ProductDashboard; 