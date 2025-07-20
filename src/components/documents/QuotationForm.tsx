// QuotationForm.tsx
// Formulário de cotação

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';

const QuotationForm = () => {
  const { create } = useDocuments();
  const [cliente, setCliente] = useState('');
  const [itens, setItens] = useState('');
  const [total, setTotal] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    create.mutate({
      type: 'quotation',
      customerName: cliente,
      items: [], // parse itens string para array real em produção
      total: Number(total),
      number: '', // será gerado no backend
      prefix: 'COT',
      issueDate: new Date().toISOString().slice(0, 10),
      status: 'draft',
      createdAt: new Date().toISOString(),
    }, {
      onSuccess: () => setSuccess(true)
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nova Cotação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Cliente" value={cliente} onChange={e => setCliente(e.target.value)} required />
            <Input placeholder="Itens (ex: Produto A x2, Produto B x1)" value={itens} onChange={e => setItens(e.target.value)} required />
            <Input placeholder="Total" type="number" value={total} onChange={e => setTotal(e.target.value)} required />
            <Button type="submit" disabled={create.isLoading}>Salvar Cotação</Button>
          </form>
          {create.isLoading && <div className="text-muted-foreground">Salvando...</div>}
          {success && <div className="text-green-600">Cotação salva com sucesso!</div>}
          {create.isError && <div className="text-red-600">Erro ao salvar cotação</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuotationForm; 