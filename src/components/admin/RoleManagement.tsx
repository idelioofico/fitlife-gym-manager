
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getRoles, createRole, updateRole, deleteRole } from '@/lib/api';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';

const roleFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'Pelo menos uma permissão é obrigatória'),
});

const availablePermissions = [
  { id: 'all', label: 'Acesso Total', description: 'Acesso completo ao sistema' },
  { id: 'read', label: 'Leitura', description: 'Visualizar dados' },
  { id: 'write', label: 'Escrita', description: 'Criar novos registos' },
  { id: 'update', label: 'Atualização', description: 'Editar registos existentes' },
  { id: 'delete', label: 'Eliminação', description: 'Eliminar registos' },
  { id: 'manage_users', label: 'Gestão de Utilizadores', description: 'Criar e gerir utilizadores' },
  { id: 'manage_payments', label: 'Gestão de Pagamentos', description: 'Gerir pagamentos e planos' },
  { id: 'manage_classes', label: 'Gestão de Aulas', description: 'Gerir horários e aulas' },
  { id: 'manage_workouts', label: 'Gestão de Treinos', description: 'Criar e gerir treinos' },
  { id: 'view_reports', label: 'Relatórios', description: 'Visualizar relatórios e estatísticas' },
];

const RoleManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof roleFormSchema>>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar roles.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewRoleDialog = () => {
    form.reset({
      name: '',
      description: '',
      permissions: [],
    });
    setEditingRole(null);
    setIsDialogOpen(true);
  };

  const handleEditRole = (role) => {
    form.reset({
      name: role.name,
      description: role.description || '',
      permissions: Array.isArray(role.permissions) ? role.permissions : [],
    });
    setEditingRole(role);
    setIsDialogOpen(true);
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (roleName === 'admin') {
      toast({
        title: 'Erro',
        description: 'Não é possível eliminar a role de administrador.',
        variant: 'destructive',
      });
      return;
    }

    if (confirm(`Tem certeza que deseja eliminar a role "${roleName}"?`)) {
      try {
        await deleteRole(roleId);
        toast({
          title: 'Sucesso',
          description: 'Role eliminada com sucesso.',
        });
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao eliminar role.',
          variant: 'destructive',
        });
      }
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const roleData = {
        name: data.name,
        description: data.description,
        permissions: data.permissions,
      };

      if (editingRole) {
        await updateRole(editingRole.id, roleData);
        toast({
          title: 'Sucesso',
          description: 'Role atualizada com sucesso.',
        });
      } else {
        await createRole(roleData);
        toast({
          title: 'Sucesso',
          description: 'Nova role criada com sucesso.',
        });
      }
      
      setIsDialogOpen(false);
      fetchRoles();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao processar o formulário.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground mt-2">Carregando roles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Roles</h2>
          <p className="text-muted-foreground">Crie e gerencie roles e permissões</p>
        </div>
        <Button onClick={handleOpenNewRoleDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles do Sistema</CardTitle>
          <CardDescription>Lista de todas as roles disponíveis</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Permissões</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell>{role.description}</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {Array.isArray(role.permissions) 
                        ? role.permissions.join(', ') 
                        : 'Nenhuma permissão'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {role.name !== 'admin' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteRole(role.id, role.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Editar Role' : 'Nova Role'}
            </DialogTitle>
            <DialogDescription>
              {editingRole 
                ? 'Atualize os detalhes da role' 
                : 'Crie uma nova role com permissões específicas'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Role</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permissões</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {availablePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-start space-x-3">
                          <Checkbox
                            id={permission.id}
                            checked={field.value?.includes(permission.id)}
                            onCheckedChange={(checked) => {
                              const updatedPermissions = checked
                                ? [...(field.value || []), permission.id]
                                : (field.value || []).filter((p) => p !== permission.id);
                              field.onChange(updatedPermissions);
                            }}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label 
                              htmlFor={permission.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.label}
                            </label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingRole ? 'Atualizando...' : 'Criando...'}
                    </>
                  ) : (
                    editingRole ? 'Salvar Alterações' : 'Criar Role'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoleManagement;
