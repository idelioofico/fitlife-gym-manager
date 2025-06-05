import React, { useState, useEffect } from 'react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus } from 'lucide-react';
import { TableRowActions } from '@/components/common/TableRowActions';
import { useToast } from '@/hooks/use-toast';
import MemberForm from '@/components/members/MemberForm';
import MemberDetail from '@/components/members/MemberDetail';
import MemberRenewal from '@/components/members/MemberRenewal';
import { getMembers, getMemberById, updateMember } from '@/lib/api';

const Members = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogAction, setDialogAction] = useState<{type: string; member: any} | null>(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetContent, setSheetContent] = useState<{type: string; member: any} | null>(null);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const data = await getMembers(searchTerm);
    setMembers(data);
    setLoading(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  const handleAction = async (action: string, member: any) => {
    switch(action) {
      case 'view':
        const memberData = await getMemberById(member.id);
        if (memberData) {
          setSelectedMember(memberData);
          setSheetContent({type: 'view', member: memberData});
        }
        break;
      case 'edit':
        const memberToEdit = await getMemberById(member.id);
        if (memberToEdit) {
          setSelectedMember(memberToEdit);
          setSheetContent({type: 'edit', member: memberToEdit});
        }
        break;
      case 'renew':
        const memberToRenew = await getMemberById(member.id);
        if (memberToRenew) {
          setSelectedMember(memberToRenew);
          setSheetContent({type: 'renew', member: memberToRenew});
        }
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

  const confirmAction = async () => {
    if (dialogAction && dialogAction.type === 'deactivate') {
      try {
        await updateMember(dialogAction.member.id, { status: 'Inativo' });
        fetchMembers();
        setDialogAction(null);
      } catch (error) {
        console.error("Error deactivating member:", error);
        toast({
          title: "Erro",
          description: "Não foi possível desativar o utente.",
          variant: "destructive"
        });
      }
    }
  };

  const handleAddNewMember = () => {
    setSheetContent({type: 'add', member: null});
  };

  const handleFormSuccess = () => {
    setSheetContent(null);
    setSelectedMember(null);
    fetchMembers();
  };

  const renderSheetContent = () => {
    if (!sheetContent) return null;
    
    switch (sheetContent.type) {
      case 'add':
        return (
          <>
            <SheetHeader>
              <SheetTitle>Adicionar Novo Utente</SheetTitle>
              <SheetDescription>
                Preencha os detalhes do novo utente
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <MemberForm onSuccess={handleFormSuccess} />
            </div>
          </>
        );
      case 'edit':
        return (
          <>
            <SheetHeader>
              <SheetTitle>Editar Utente</SheetTitle>
              <SheetDescription>
                Atualize os detalhes do utente
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <MemberForm 
                onSuccess={handleFormSuccess} 
                initialData={selectedMember} 
                isEditing 
              />
            </div>
          </>
        );
      case 'view':
        return (
          <>
            <SheetHeader>
              <SheetTitle>Detalhes do Utente</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <MemberDetail 
                member={selectedMember} 
                onClose={() => setSheetContent(null)}
                onEdit={() => setSheetContent({type: 'edit', member: selectedMember})}
                onRenew={() => setSheetContent({type: 'renew', member: selectedMember})}
              />
            </div>
          </>
        );
      case 'renew':
        return (
          <>
            <SheetHeader>
              <SheetTitle>Renovar Plano</SheetTitle>
              <SheetDescription>
                Renove o plano do utente
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <MemberRenewal 
                member={selectedMember}
                onSuccess={handleFormSuccess}
              />
            </div>
          </>
        );
      default:
        return null;
    }
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
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:items-center pb-4 gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Pesquisar utentes..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <Button type="submit" className="sm:w-auto">Pesquisar</Button>
            </form>
            
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
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Nenhum utente encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell>{member.plan_name}</TableCell>
                        <TableCell>
                          <Badge variant={member.status === 'Ativo' ? 'default' : 'secondary'}>
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(member.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <TableRowActions
                            onView={() => handleAction('view', member)}
                            onEdit={() => handleAction('edit', member)}
                            onRenew={() => handleAction('renew', member)}
                            onHistory={() => handleAction('history', member)}
                            onDeactivate={() => handleAction('deactivate', member)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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

      {/* Sheet for various member actions */}
      <Sheet 
        open={!!sheetContent} 
        onOpenChange={(open) => !open && setSheetContent(null)}
      >
        <SheetContent className="overflow-y-auto w-full sm:max-w-xl">
          {renderSheetContent()}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
};

export default Members;
