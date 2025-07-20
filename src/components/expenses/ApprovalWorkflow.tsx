// ApprovalWorkflow.tsx
// Workflow de aprovação de despesas

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense } from '@/types/expense';

const APPROVAL_LIMITS = {
  autoApprove: 5000,
  managerApprove: 50000,
};

const ApprovalWorkflow = () => {
  const { expenses, update } = useExpenses();

  // Filtrar despesas pendentes
  const pendingExpenses = useMemo(() => {
    return (expenses.data || []).filter((e: Expense) => e.status === 'pending');
  }, [expenses.data]);

  // Lógica de aprovação
  const handleApprove = (exp: Expense) => {
    let newStatus = 'approved';
    if (exp.amount < APPROVAL_LIMITS.autoApprove) {
      newStatus = 'approved'; // auto-aprovada
    } else if (exp.amount < APPROVAL_LIMITS.managerApprove) {
      newStatus = 'approved'; // manager
    } else {
      newStatus = 'approved'; // admin
    }
    update.mutate({ id: exp.id, data: { status: newStatus, approvalDate: new Date().toISOString() } });
  };

  const handleReject = (exp: Expense) => {
    update.mutate({ id: exp.id, data: { status: 'cancelled' } });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Aprovação de Despesas</h1>
      <Card>
        <CardHeader>
          <CardTitle>Despesas Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : expenses.isError ? (
            <div className="text-center py-8 text-red-600">Erro ao carregar despesas</div>
          ) : pendingExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhuma despesa pendente</div>
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
                  {pendingExpenses.map((exp) => (
                    <tr key={exp.id} className="border-b">
                      <td className="p-2">{exp.referenceNumber}</td>
                      <td className="p-2">{exp.category}</td>
                      <td className="p-2">{exp.amount.toLocaleString('pt-MZ')} MZN</td>
                      <td className="p-2">
                        <span className="text-yellow-600 font-semibold">Pendente</span>
                      </td>
                      <td className="p-2">{exp.date}</td>
                      <td className="p-2 flex gap-2">
                        <Button size="sm" variant="success" onClick={() => handleApprove(exp)} disabled={update.isLoading}>Aprovar</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(exp)} disabled={update.isLoading}>Rejeitar</Button>
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

export default ApprovalWorkflow; 