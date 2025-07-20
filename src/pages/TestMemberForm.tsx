import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MemberForm from '@/components/members/MemberForm';
import { useToast } from '@/hooks/use-toast';
import { getMembers } from '@/lib/api';

const TestMemberForm = () => {
  const [showForm, setShowForm] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const membersData = await getMembers();
      setMembers(membersData);
      console.log('Membros carregados:', membersData);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar membros',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    fetchMembers();
    toast({
      title: 'Sucesso',
      description: 'Membro criado com sucesso!',
    });
  };

  React.useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Teste - Formulário de Membros</h1>
            <p className="text-muted-foreground">
              Página de teste para verificar a funcionalidade do formulário de membros
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            Criar Novo Membro
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Membros Existentes ({members.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando membros...</p>
            ) : members.length === 0 ? (
              <p>Nenhum membro encontrado.</p>
            ) : (
              <div className="space-y-4">
                {members.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {member.status} | Plano: {member.plan_name || 'N/A'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Criado em: {new Date(member.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Membro</DialogTitle>
            </DialogHeader>
            <MemberForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default TestMemberForm; 