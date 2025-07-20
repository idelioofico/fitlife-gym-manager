// ExpenseForm.tsx
// Formulário para criar/editar despesas

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useExpenses } from '@/hooks/useExpenses';

const ExpenseForm = () => {
  const { create, categories } = useExpenses();
  const [referenceNumber, setReferenceNumber] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('pending');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    create.mutate({
      referenceNumber,
      category,
      amount: Number(amount),
      date,
      status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, {
      onSuccess: () => setSuccess(true)
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Despesa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Referência" value={referenceNumber} onChange={e => setReferenceNumber(e.target.value)} required />
            <Input placeholder="Categoria" value={category} onChange={e => setCategory(e.target.value)} required />
            <Input placeholder="Valor" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
            <Input placeholder="Data" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            <Input placeholder="Status" value={status} onChange={e => setStatus(e.target.value)} required />
            <Button type="submit" disabled={create.isLoading}>Salvar Despesa</Button>
          </form>
          {create.isLoading && <div className="text-muted-foreground">Salvando...</div>}
          {success && <div className="text-green-600">Despesa salva com sucesso!</div>}
          {create.isError && <div className="text-red-600">Erro ao salvar despesa</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseForm; 