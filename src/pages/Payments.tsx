
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, MoreHorizontal, Search } from 'lucide-react';

// Mock payment data
const payments = [
  { id: 'P001', client: 'Ana Maria', plan: 'Premium', amount: '2.500 MZN', date: '05/04/2025', status: 'Pago', method: 'Mpesa' },
  { id: 'P002', client: 'João Silva', plan: 'Básico', amount: '1.200 MZN', date: '03/04/2025', status: 'Pago', method: 'Card' },
  { id: 'P003', client: 'Carlos Nuvunga', plan: 'Premium', amount: '2.500 MZN', date: '01/04/2025', status: 'Falhado', method: 'Emola' },
  { id: 'P004', client: 'Maria Costa', plan: 'Standard', amount: '1.800 MZN', date: '01/04/2025', status: 'Pago', method: 'Cash' },
  { id: 'P005', client: 'Pedro Machava', plan: 'Premium', amount: '2.500 MZN', date: '28/03/2025', status: 'Pendente', method: 'NetShop' },
];

const Payments = () => {
  return (
    <MainLayout title="Pagamentos">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Gestão Financeira</h2>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Novo Pagamento
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Recebido</CardTitle>
              <CardDescription>Mês atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">65.750 MZN</div>
              <p className="text-xs text-muted-foreground mt-1">+12% em relação ao mês anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pagamentos Pendentes</CardTitle>
              <CardDescription>Mês atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.400 MZN</div>
              <p className="text-xs text-muted-foreground mt-1">8 pagamentos aguardando</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Projeção Mensal</CardTitle>
              <CardDescription>Abril 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78.150 MZN</div>
              <p className="text-xs text-muted-foreground mt-1">Baseado em 255 assinaturas ativas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <CardDescription>
              Todos os pagamentos registados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center pb-4 gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Pesquisar pagamentos..."
                  className="pl-8 w-full"
                />
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[80px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.id}</TableCell>
                      <TableCell>{payment.client}</TableCell>
                      <TableCell>{payment.plan}</TableCell>
                      <TableCell>{payment.amount}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            payment.status === 'Pago' ? "default" :
                            payment.status === 'Pendente' ? "outline" :
                            "destructive"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
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

export default Payments;
