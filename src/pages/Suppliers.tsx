import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import SupplierForm from '@/components/expenses/SupplierForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const SuppliersPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
            <p className="text-muted-foreground">
              Gerir fornecedores e contactos comerciais
            </p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Adicionar Fornecedor</DialogTitle>
              </DialogHeader>
              <SupplierForm onSuccess={() => setShowForm(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Lista de Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum fornecedor cadastrado ainda.</p>
              <p className="text-sm">Clique em "Novo Fornecedor" para começar.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SuppliersPage; 