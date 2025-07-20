// SalesReports.tsx
// Relatórios de vendas

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSales } from '@/hooks/useSales';
import { Sale } from '@/types/product';

const SalesReports = () => {
  const { sales } = useSales();
  const [period, setPeriod] = useState('');

  // Filtro local por período (YYYY-MM)
  const filteredSales = useMemo(() => {
    let data: Sale[] = sales.data || [];
    if (period) {
      data = data.filter((s) => s.saleDate.startsWith(period));
    }
    return data;
  }, [sales.data, period]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Relatórios de Vendas</h1>
      <div className="flex gap-2 items-end">
        <Input placeholder="Período..." className="max-w-xs" type="month" value={period} onChange={e => setPeriod(e.target.value)} />
        <Button variant="outline">Filtrar</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Vendas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <span>Gráfico de vendas (Recharts)</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tabela de Vendas</CardTitle>
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
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
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

export default SalesReports; 