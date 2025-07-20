// SalesDashboard.tsx
// Dashboard de vendas

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSales } from '@/hooks/useSales';
import { Sale } from '@/types/product';

const SalesDashboard = () => {
  const { sales } = useSales();

  // KPIs calculados
  const kpis = useMemo(() => {
    const data: Sale[] = sales.data || [];
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const thisYear = now.getFullYear().toString();
    let totalMonth = 0, totalYear = 0, tickets = 0, countMonth = 0, produtosVendidos = 0;
    data.forEach((s) => {
      if (s.saleDate.startsWith(thisMonth)) {
        totalMonth += s.total;
        countMonth++;
        produtosVendidos += s.items.reduce((sum, i) => sum + i.quantity, 0);
      }
      if (s.saleDate.startsWith(thisYear)) {
        totalYear += s.total;
      }
    });
    return [
      { label: 'Vendas no Mês', value: `${totalMonth.toLocaleString('pt-MZ')} MZN` },
      { label: 'Vendas no Ano', value: `${totalYear.toLocaleString('pt-MZ')} MZN` },
      { label: 'Tickets Médios', value: countMonth ? `${(totalMonth / countMonth).toLocaleString('pt-MZ')} MZN` : '0 MZN' },
      { label: 'Produtos Vendidos', value: produtosVendidos },
    ];
  }, [sales.data]);

  // Últimas vendas
  const lastSales = useMemo(() => {
    const data: Sale[] = sales.data || [];
    return data.slice(0, 5);
  }, [sales.data]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard de Vendas</h1>
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
        <Input placeholder="Buscar venda..." className="max-w-xs" />
        <Button variant="outline">Filtrar</Button>
      </div>
      {/* Gráfico de vendas mensais (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas por Mês (Gráfico)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <span>Gráfico de vendas (Recharts)</span>
          </div>
        </CardContent>
      </Card>
      {/* Tabela de últimas vendas */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : sales.isError ? (
            <div className="text-center py-8 text-red-600">Erro ao carregar vendas</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Ref</th>
                    <th className="text-left p-2">Cliente</th>
                    <th className="text-left p-2">Valor</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lastSales.map((sale) => (
                    <tr key={sale.id} className="border-b">
                      <td className="p-2">{sale.saleNumber}</td>
                      <td className="p-2">{sale.customerName}</td>
                      <td className="p-2">{sale.total.toLocaleString('pt-MZ')} MZN</td>
                      <td className="p-2">
                        <span className={sale.paymentStatus === 'paid' ? 'text-green-600' : sale.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-muted-foreground'}>
                          {sale.paymentStatus === 'paid' ? 'Pago' : sale.paymentStatus === 'pending' ? 'Pendente' : sale.paymentStatus}
                        </span>
                      </td>
                      <td className="p-2">{sale.saleDate}</td>
                      <td className="p-2">
                        <Button size="sm" variant="outline">Ver</Button>
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

export default SalesDashboard; 