
import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus } from 'lucide-react';
import { TableRowActions } from '@/components/common/TableRowActions';
import { useToast } from '@/hooks/use-toast';

// Mock data
const members = [
  { id: 1, name: 'Ana Maria', email: 'ana@example.com', phone: '84 123 4567', plan: 'Premium', status: 'Ativo', joinDate: '15/01/2023' },
  { id: 2, name: 'João Silva', email: 'joao@example.com', phone: '85 234 5678', plan: 'Básico', status: 'Ativo', joinDate: '22/03/2023' },
  { id: 3, name: 'Carlos Nuvunga', email: 'carlos@example.com', phone: '86 345 6789', plan: 'Premium', status: 'Inativo', joinDate: '10/04/2022' },
  { id: 4, name: 'Maria Costa', email: 'maria@example.com', phone: '87 456 7890', plan: 'Standard', status: 'Ativo', joinDate: '05/07/2023' },
  { id: 5, name: 'Pedro Machava', email: 'pedro@example.com', phone: '84 567 8901', plan: 'Premium', status: 'Ativo', joinDate: '18/09/2023' },
  { id: 6, name: 'Sofia Langa', email: 'sofia@example.com', phone: '85 678 9012', plan: 'Básico', status: 'Pendente', joinDate: '30/11/2023' },
];

const Members = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogAction, setDialogAction] = useState<{type: string; member: any} | null>(null);

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  const handleAction = (action: string, member: any) => {
    switch(action) {
      case 'view':
        toast({
          title: "Ver Detalhes",
          description: `Visualizando detalhes de ${member.name}`,
        });
        break;
      case 'edit':
        toast({
          title: "Editar",
          description: `Editando dados de ${member.name}`,
        });
        break;
      case 'renew':
        toast({
          title: "Renovar Plano",
          description: `Renovando plano para ${member.name}`,
        });
        break;
      case 'history':
        toast({
          title: "Histórico",
          description: `Visualizando histórico de ${member.name}`,
        });
        break;
      case 'deactivate':
        setDialogAction({type: 'deactivate', member});
        break;
      default:
        break;
    }
  };

  const confirmAction = () => {
    if (dialogAction) {
      toast({
        title: dialogAction.type === 'deactivate' ? "Utente Desativado" : "Ação Realizada",
        description: `A ação foi concluída para ${dialogAction.member.name}`,
      });
      setDialogAction(null);
    }
  };

  const handleAddNewMember = () => {
    toast({
      title: "Novo Utente",
      description: "Formulário para adicionar novo utente foi aberto.",
    });
  };

  return (
    <MainLayout title="Utentes">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Gestão de Utentes</h2>
          <div className="flex items-center mt-2 sm:mt-0">
            <Button className="ml-2" onClick={handleAddNewMember}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Utente
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Utentes</CardTitle>
            <CardDescription>
              Gerencie os dados dos utentes do ginásio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center pb-4 gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Pesquisar utentes..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Data de Registo</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.plan}</TableCell>
                      <TableCell>
                        <Badge variant={member.status === 'Ativo' ? 'default' : member.status === 'Inativo' ? 'destructive' : 'outline'}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.joinDate}</TableCell>
                      <TableCell>
                        <TableRowActions
                          onView={() => handleAction('view', member)}
                          onEdit={() => handleAction('edit', member)}
                          onRenew={() => handleAction('renew', member)}
                          onHistory={() => handleAction('history', member)}
                          onDeactivate={() => handleAction('deactivate', member)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de confirmação */}
      <Dialog open={!!dialogAction} onOpenChange={(open) => !open && setDialogAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Ação</DialogTitle>
            <DialogDescription>
              {dialogAction?.type === 'deactivate' 
                ? `Tem certeza que deseja desativar o utente ${dialogAction?.member?.name}?` 
                : 'Deseja confirmar esta ação?'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>Cancelar</Button>
            <Button onClick={confirmAction}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Members;
