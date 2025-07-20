// ExpenseReports.tsx
// Relatórios e exportação de despesas

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense } from '@/types/expense';

const ExpenseReports = () => {
  const { expenses } = useExpenses();
  const [period, setPeriod] = useState('');

  // Filtro local por período (YYYY-MM)
  const filteredExpenses = useMemo(() => {
    let data: Expense[] = expenses.data || [];
    if (period) {
      data = data.filter((e) => e.date.startsWith(period));
    }
    return data;
  }, [expenses.data, period]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Relatórios de Despesas</h1>
      <div className="flex gap-2 items-end">
        <Input placeholder="Período..." className="max-w-xs" type="month" value={period} onChange={e => setPeriod(e.target.value)} />
        <Button variant="outline">Filtrar</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Gráfico de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <span>Gráfico de despesas (Recharts)</span>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Tabela de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : expenses.isError ? (
            <div className="text-center py-8 text-red-600">Erro ao carregar despesas</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Ref</th>
                    <th className="text-left p-2">Categoria</th>
                    <th className="text-left p-2">Valor</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="border-b">
                      <td className="p-2">{exp.referenceNumber}</td>
                      <td className="p-2">{exp.category}</td>
                      <td className="p-2">{exp.amount.toLocaleString('pt-MZ')} MZN</td>
                      <td className="p-2">
                        <span className={exp.status === 'paid' ? 'text-green-600' : exp.status === 'pending' ? 'text-yellow-600' : 'text-muted-foreground'}>
                          {exp.status === 'paid' ? 'Pago' : exp.status === 'pending' ? 'Pendente' : exp.status}
                        </span>
                      </td>
                      <td className="p-2">{exp.date}</td>
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

export default ExpenseReports; 