// DocumentHistory.tsx
// Histórico de documentos fiscais

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDocuments } from '@/hooks/useDocuments';
import { Document } from '@/types/document';
import InvoiceForm from './InvoiceForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

const DocumentHistory = () => {
  const { documents, remove } = useDocuments();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Document | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredDocuments = useMemo(() => {
    let data: Document[] = documents.data || [];
    if (search) {
      data = data.filter((d) =>
        d.number.toLowerCase().includes(search.toLowerCase()) ||
        d.customerName.toLowerCase().includes(search.toLowerCase()) ||
        d.type.toLowerCase().includes(search.toLowerCase())
      );
    }
    return data;
  }, [documents.data, search]);

  const handleEdit = (doc: Document) => {
    setEditing(doc);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
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
        <h1 className="text-2xl font-bold">Histórico de Documentos</h1>
        <Button>Novo Documento</Button>
      </div>
      <div className="flex gap-2 items-end">
        <Input placeholder="Buscar documento..." className="max-w-xs" value={search} onChange={e => setSearch(e.target.value)} />
        <Button variant="outline">Filtrar</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Documentos Fiscais</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : documents.isError ? (
            <div className="text-center py-8 text-red-600">Erro ao carregar documentos</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-left p-2">Número</th>
                    <th className="text-left p-2">Cliente</th>
                    <th className="text-left p-2">Valor</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Data</th>
                    <th className="text-left p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b">
                      <td className="p-2">{doc.type}</td>
                      <td className="p-2">{doc.number}</td>
                      <td className="p-2">{doc.customerName}</td>
                      <td className="p-2">{doc.total?.toLocaleString('pt-MZ')} MZN</td>
                      <td className="p-2">
                        <span className={doc.status === 'paid' ? 'text-green-600' : doc.status === 'pending' ? 'text-yellow-600' : 'text-muted-foreground'}>
                          {doc.status === 'paid' ? 'Pago' : doc.status === 'pending' ? 'Pendente' : doc.status}
                        </span>
                      </td>
                      <td className="p-2">{doc.issueDate}</td>
                      <td className="p-2 flex gap-2">
                        {isAdmin && <Button size="sm" variant="outline" onClick={() => handleEdit(doc)}>Editar</Button>}
                        {isAdmin && <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)} disabled={remove.isLoading}>Excluir</Button>}
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
            <DialogTitle>Editar Documento</DialogTitle>
          </DialogHeader>
          {editing && (
            <InvoiceForm
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

export default DocumentHistory; 