// ExpenseDashboard.tsx
// Dashboard de despesas: KPIs, gráficos, resumo

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
// import { BarChart } from 'recharts'; // Placeholder para gráfico

const mockKPIs = [
  { label: 'Total Mensal', value: '45.000 MZN' },
  { label: 'Total Anual', value: '320.000 MZN' },
  { label: 'Média Mensal', value: '26.700 MZN' },
  { label: 'Despesas Pendentes', value: '3.200 MZN' },
];

const mockExpenses = [
  { id: '1', ref: 'EXP-001', categoria: 'Aluguel', valor: '20.000 MZN', status: 'paid', data: '2024-06-01' },
  { id: '2', ref: 'EXP-002', categoria: 'Salários', valor: '15.000 MZN', status: 'pending', data: '2024-06-05' },
  { id: '3', ref: 'EXP-003', categoria: 'Limpeza', valor: '2.000 MZN', status: 'paid', data: '2024-06-07' },
  { id: '4', ref: 'EXP-004', categoria: 'Marketing', valor: '8.000 MZN', status: 'paid', data: '2024-06-10' },
];

const ExpenseDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard de Despesas</h1>
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockKPIs.map((kpi) => (
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
        <Input placeholder="Buscar por referência ou categoria..." className="max-w-xs" />
        <Input type="month" className="w-40" />
        <Button variant="outline">Filtrar</Button>
      </div>
      {/* Gráfico de despesas mensais (placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Mês (Gráfico)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            {/* <BarChart ... /> */}
            <span>Gráfico de despesas (Recharts)</span>
          </div>
        </CardContent>
      </Card>
      {/* Tabela de últimas despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Últimas Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Ref</th>
                  <th className="text-left p-2">Categoria</th>
                  <th className="text-left p-2">Valor</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockExpenses.map((exp) => (
                  <tr key={exp.id} className="border-b">
                    <td className="p-2">{exp.ref}</td>
                    <td className="p-2">{exp.categoria}</td>
                    <td className="p-2">{exp.valor}</td>
                    <td className="p-2">
                      <span className={exp.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                        {exp.status === 'paid' ? 'Pago' : 'Pendente'}
                      </span>
                    </td>
                    <td className="p-2">{exp.data}</td>
                    <td className="p-2">
                      <Button size="sm" variant="outline">Ver</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseDashboard; 