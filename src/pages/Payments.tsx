import React, { useState, useEffect, useRef } from 'react';
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
import { CreditCard, Download, FileSpreadsheet, Search, Plus } from 'lucide-react';
import { TableRowActions } from '@/components/common/TableRowActions';
import { useToast } from '@/hooks/use-toast';
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
} from "@/components/ui/sheet";
import { getPayments, getPaymentById, updatePayment, getSettings } from '@/lib/api';
import NewPaymentForm from '@/components/payments/NewPaymentForm';
import PaymentDetail from '@/components/payments/PaymentDetail';
import PaymentReceipt from '@/components/payments/PaymentReceipt';
import { useReactToPrint } from 'react-to-print';
import { utils, writeFile } from 'xlsx';

const Payments = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [dialogAction, setDialogAction] = useState<{type: string; payment: any} | null>(null);
  const [sheetContent, setSheetContent] = useState<{type: string; payment?: any} | null>(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gymSettings, setGymSettings] = useState(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Calcular totais para os cards de resumo
  const calculateTotals = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return payments.reduce((acc, payment) => {
      const paymentDate = new Date(payment.payment_date);
      const amount = parseFloat(payment.amount);

      // Total geral
      acc.total += amount;

      // Total do mês
      if (paymentDate >= firstDayOfMonth && paymentDate <= lastDayOfMonth) {
        acc.monthly += amount;
      }

      // Total pendente
      if (payment.status === 'Pendente') {
        acc.pending += amount;
      }

      // Total pago
      if (payment.status === 'Pago') {
        acc.paid += amount;
      }

      return acc;
    }, { total: 0, monthly: 0, pending: 0, paid: 0 });
  };

  useEffect(() => {
    fetchPayments();
    fetchGymSettings();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    const data = await getPayments(searchTerm);
    setPayments(data);
    setLoading(false);
  };

  const fetchGymSettings = async () => {
    const settings = await getSettings();
    setGymSettings(settings);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments();
  };

  const handlePaymentAction = async (action: string, payment: any) => {
    switch(action) {
      case 'view':
        try {
          const paymentData = await getPaymentById(payment.id);
          console.log('Payment data:', paymentData); // Debug
          if (paymentData) {
            setSelectedPayment(paymentData);
            setSheetContent({type: 'view', payment: paymentData});
          }
        } catch (error) {
          console.error('Error fetching payment details:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os detalhes do pagamento.",
            variant: "destructive",
          });
        }
        break;
      case 'receipt':
        try {
          const receiptData = await getPaymentById(payment.id);
          console.log('Receipt data:', receiptData); // Debug
          if (receiptData) {
            setSelectedPayment(receiptData);
            setSheetContent({type: 'receipt', payment: receiptData});
          }
        } catch (error) {
          console.error('Error fetching receipt data:', error);
          toast({
            title: "Erro",
            description: "Não foi possível carregar os dados do recibo.",
            variant: "destructive",
          });
        }
        break;
      case 'retry':
        setDialogAction({type: 'retry', payment});
        break;
      case 'cancel':
        setDialogAction({type: 'cancel', payment});
        break;
      default:
        break;
    }
  };

  const confirmAction = async () => {
    if (dialogAction) {
      try {
        const updatedStatus = dialogAction.type === 'retry' ? 'Pendente' : 'Cancelado';
        await updatePayment(dialogAction.payment.id, { status: updatedStatus });
        fetchPayments();
        setDialogAction(null);
        
        toast({
          title: dialogAction.type === 'retry' ? "Pagamento Reprocessado" : "Pagamento Cancelado",
          description: `A ação foi concluída para o pagamento ${dialogAction.payment.reference_id}`,
        });
      } catch (error) {
        console.error("Error updating payment:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o pagamento.",
          variant: "destructive"
        });
      }
    }
  };

  const handleNewPayment = () => {
    setSheetContent({type: 'add'});
  };

  const handleFormSuccess = () => {
    setSheetContent(null);
    setSelectedPayment(null);
    fetchPayments();
  };

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
    documentTitle: `Recibo_${selectedPayment?.reference_id || 'Pagamento'}`,
    onAfterPrint: () => {
      toast({
        title: "Recibo gerado",
        description: "O recibo foi gerado para impressão com sucesso.",
      });
    },
    onPrintError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o recibo. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const handlePrintButtonClick = () => {
    if (receiptRef.current) {
      handlePrint();
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o recibo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    try {
      // Prepare data for export
      const exportData = payments.map(payment => ({
        'Referência': payment.reference_id,
        'Cliente': payment.members?.name || 'N/A',
        'Plano': payment.plan,
        'Valor (MZN)': payment.amount,
        'Data': payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A',
        'Método': payment.method,
        'Estado': payment.status,
      }));
      
      // Create workbook and add worksheet
      const wb = utils.book_new();
      const ws = utils.json_to_sheet(exportData);
      
      // Set column widths
      const colWidths = [
        { wch: 10 }, // Referência
        { wch: 25 }, // Cliente
        { wch: 15 }, // Plano
        { wch: 15 }, // Valor
        { wch: 12 }, // Data
        { wch: 12 }, // Método
        { wch: 10 }, // Estado
      ];
      
      ws['!cols'] = colWidths;
      
      // Add worksheet to workbook
      utils.book_append_sheet(wb, ws, 'Pagamentos');
      
      // Generate filename with current date
      const today = new Date().toISOString().slice(0, 10);
      const fileName = `Pagamentos_${today}.xlsx`;
      
      // Write and download file
      writeFile(wb, fileName);
      
      toast({
        title: "Exportação concluída",
        description: `Os dados foram exportados para ${fileName}`,
      });
    } catch (error) {
      console.error("Error exporting payments:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados de pagamentos.",
        variant: "destructive"
      });
    }
  };

  const renderSheetContent = () => {
    if (!sheetContent) return null;
    
    switch (sheetContent.type) {
      case 'add':
        return (
          <>
            <SheetHeader>
              <SheetTitle>Novo Pagamento</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <NewPaymentForm onSuccess={handleFormSuccess} />
            </div>
          </>
        );
      case 'view':
        if (!selectedPayment) {
          return (
            <div className="flex items-center justify-center h-full">
              <p>Carregando detalhes do pagamento...</p>
            </div>
          );
        }
        return (
          <>
            <SheetHeader>
              <SheetTitle>Detalhes do Pagamento</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <PaymentDetail 
                payment={selectedPayment} 
                onClose={() => setSheetContent(null)}
                onGenerateReceipt={() => {
                  setSheetContent({type: 'receipt', payment: selectedPayment});
                }}
              />
            </div>
          </>
        );
      case 'receipt':
        if (!selectedPayment) {
          return (
            <div className="flex items-center justify-center h-full">
              <p>Carregando dados do recibo...</p>
            </div>
          );
        }
        return (
          <>
            <SheetHeader>
              <SheetTitle>Recibo de Pagamento</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <div className="flex justify-end mb-4">
                <Button onClick={handlePrintButtonClick}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF / Imprimir
                </Button>
              </div>
              <div className="border rounded-lg p-4">
                <PaymentReceipt 
                  ref={receiptRef}
                  payment={selectedPayment}
                  gymSettings={gymSettings}
                />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout title="Pagamentos">
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Pagamentos</h1>
          <Button onClick={() => setSheetContent({type: 'add'})}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Pagamento
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateTotals().total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Média por Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calculateTotals().total.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <CardDescription>
              Todos os pagamentos registrados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:items-center pb-4 gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Pesquisar pagamentos..."
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
                    <TableHead>Referência</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Nenhum pagamento encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.reference_id}</TableCell>
                        <TableCell>{payment.members?.name}</TableCell>
                        <TableCell>{payment.plan}</TableCell>
                        <TableCell>{payment.amount} MZN</TableCell>
                        <TableCell>
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{payment.method}</TableCell>
                        <TableCell>
                          <Badge variant={
                            payment.status === 'Pago' ? 'default' :
                            payment.status === 'Pendente' ? 'warning' :
                            payment.status === 'Cancelado' ? 'destructive' :
                            'secondary'
                          }>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <TableRowActions
                            onView={() => handlePaymentAction('view', payment)}
                            onReceipt={() => handlePaymentAction('receipt', payment)}
                            onRetry={payment.status === 'Falhou' ? () => handlePaymentAction('retry', payment) : undefined}
                            onCancel={payment.status === 'Pendente' ? () => handlePaymentAction('cancel', payment) : undefined}
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
        
        <Sheet open={!!sheetContent} onOpenChange={(open) => {
          if (!open) {
            setSheetContent(null);
            setSelectedPayment(null);
          }
        }}>
          <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
            {renderSheetContent()}
          </SheetContent>
        </Sheet>

        <Dialog open={!!dialogAction} onOpenChange={() => setDialogAction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogAction?.type === 'retry' ? 'Reprocessar Pagamento' : 'Cancelar Pagamento'}
              </DialogTitle>
              <DialogDescription>
                {dialogAction?.type === 'retry' 
                  ? 'Tem certeza que deseja reprocessar este pagamento?'
                  : 'Tem certeza que deseja cancelar este pagamento?'}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogAction(null)}>
                Cancelar
              </Button>
              <Button onClick={confirmAction}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Payments;
