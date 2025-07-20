// SalesHistory.tsx
// Histórico de vendas

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSales } from '@/hooks/useSales';
import { Sale } from '@/types/product';
import SaleForm from './SaleForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

const SalesHistory = () => {
  const { sales, remove } = useSales();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Sale | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredSales = useMemo(() => {
    let data: Sale[] = sales.data || [];
    if (search) {
      data = data.filter((s) =>
        (s.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
        s.saleNumber.toLowerCase().includes(search.toLowerCase())
      );
    }
    return data;
  }, [sales.data, search]);

  const handleEdit = (sale: Sale) => {
    setEditing(sale);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Tem certeza que deseja excluir esta venda?')) {
      remove.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Histórico de Vendas</h1>
        <Button>Nova Venda</Button>
      </div>
      <div className="flex gap-2 items-end">
        <Input placeholder="Buscar venda..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <Button variant="outline">Filtrar</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Vendas</CardTitle>
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
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b">
                      <td className="p-2">{sale.saleNumber}</td>
                      <td className="p-2">{sale.customerName}</td>
                      <td className="p-2">{sale.total?.toLocaleString('pt-MZ')} MZN</td>
                      <td className="p-2">
                        <span className={sale.paymentStatus === 'paid' ? 'text-green-600' : sale.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-muted-foreground'}>
                          {sale.paymentStatus === 'paid' ? 'Pago' : sale.paymentStatus === 'pending' ? 'Pendente' : sale.paymentStatus}
                        </span>
                      </td>
                      <td className="p-2">{sale.saleDate}</td>
                      <td className="p-2 flex gap-2">
                        {isAdmin && <Button size="sm" variant="outline" onClick={() => handleEdit(sale)}>Editar</Button>}
                        {isAdmin && <Button size="sm" variant="destructive" onClick={() => handleDelete(sale.id)} disabled={remove.isLoading}>Excluir</Button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Venda</DialogTitle>
          </DialogHeader>
          {editing && (
            <SaleForm
              initialData={editing}
              isEditing
              onSubmit={handleCloseModal}
              onCancel={handleCloseModal}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesHistory; 