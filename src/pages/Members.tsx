
import React from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Search } from 'lucide-react';

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
  return (
    <MainLayout title="Utentes">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Gestão de Utentes</h2>
          <div className="flex items-center mt-2 sm:mt-0">
            <Button className="ml-2">
              <Plus className="h-4 w-4 mr-2" />
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
                  {members.map((member) => (
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Renovar Plano</DropdownMenuItem>
                            <DropdownMenuItem>Ver Histórico</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Desativar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Members;
