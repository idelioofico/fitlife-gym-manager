// ExpenseList.tsx
// Listagem de despesas com filtros

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense } from '@/types/expense';

const ExpenseList = () => {
  const { expenses, remove } = useExpenses();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Expense | null>(null);

  const filteredExpenses = useMemo(() => {
    let data: Expense[] = expenses.data || [];
    if (search) {
      data = data.filter(
        (e) =>
          e.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
          e.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    return data;
  }, [expenses.data, search]);

  // Placeholder para formulário de edição inline
  const handleEdit = (exp: Expense) => {
    setEditing(exp);
    // Em produção, abrir modal ou navegar para ExpenseForm com dados
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      remove.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Lista de Despesas</h1>
      <div className="flex gap-2 items-end">
        <Input placeholder="Buscar por referência ou categoria..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <Button variant="outline">Filtrar</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Despesas</CardTitle>
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
                    <th className="text-left p-2">Ações</th>
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
                      <td className="p-2 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(exp)}>Editar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(exp.id)} disabled={remove.isLoading}>Excluir</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Exemplo de edição inline (pode ser modal ou navegação) */}
      {editing && (
        <div className="p-4 border rounded bg-muted mt-4">
          <div className="mb-2 font-bold">Editar Despesa: {editing.referenceNumber}</div>
          <div className="text-xs text-muted-foreground">(Implementar formulário de edição real ou navegação para ExpenseForm)</div>
          <Button size="sm" className="mt-2" onClick={() => setEditing(null)}>Fechar</Button>
        </div>
      )}
    </div>
  );
};

export default ExpenseList; 