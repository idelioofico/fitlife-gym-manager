
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
import { CreditCard, Download, FileSpreadsheet, Search } from 'lucide-react';
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
        const paymentData = await getPaymentById(payment.id);
        if (paymentData) {
          setSelectedPayment(paymentData);
          setSheetContent({type: 'view', payment: paymentData});
        }
        break;
      case 'receipt':
        const receiptData = await getPaymentById(payment.id);
        if (receiptData) {
          setSelectedPayment(receiptData);
          setSheetContent({type: 'receipt', payment: receiptData});
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
    documentTitle: `Recibo_${selectedPayment?.reference_id || 'Pagamento'}`,
    onAfterPrint: () => {
      toast({
        title: "Recibo gerado",
        description: "O recibo foi gerado para impressão com sucesso.",
      });
    },
  });

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

  // Fix for react-to-print button click
  const handlePrintButtonClick = () => {
    if (handlePrint && receiptRef.current) {
      handlePrint();
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
        return (
          <>
            <SheetHeader>
              <SheetTitle>Detalhes do Pagamento</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <PaymentDetail 
                payment={selectedPayment} 
                onClose={() => setSheetContent(null)}
                onGenerateReceipt={() => setSheetContent({type: 'receipt', payment: selectedPayment})}
              />
            </div>
          </>
        );
      case 'receipt':
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
              <div className="border rounded-lg">
                <PaymentReceipt 
                  ref={receiptRef} 
                  payment={selectedPayment}
                  gymSettings={gymSettings}
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={() => setSheetContent({type: 'view', payment: selectedPayment})}>
                  Voltar
                </Button>
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Gestão Financeira</h2>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <Button variant="outline" onClick={handleExport}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleNewPayment}>
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-sm text-muted-foreground">Carregando pagamentos...</p>
                      </TableCell>
                    </TableRow>
                  ) : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-sm text-muted-foreground">Nenhum pagamento encontrado</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.reference_id}</TableCell>
                        <TableCell>{payment.members?.name || 'N/A'}</TableCell>
                        <TableCell>{payment.plan}</TableCell>
                        <TableCell>{Number(payment.amount).toLocaleString('pt-MZ')} MZN</TableCell>
                        <TableCell>
                          {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
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
                          <TableRowActions
                            onView={() => handlePaymentAction('view', payment)}
                            customActions={[
                              {
                                label: "Gerar Recibo",
                                icon: Download,
                                onClick: () => handlePaymentAction('receipt', payment)
                              },
                              ...(payment.status === 'Falhado' ? [{
                                label: "Tentar Novamente",
                                icon: CreditCard,
                                onClick: () => handlePaymentAction('retry', payment)
                              }] : []),
                              ...(payment.status === 'Pendente' ? [{
                                label: "Cancelar",
                                icon: CreditCard,
                                onClick: () => handlePaymentAction('cancel', payment),
                                destructive: true
                              }] : [])
                            ]}
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
              {dialogAction?.type === 'retry' 
                ? `Deseja tentar processar o pagamento ${dialogAction?.payment?.reference_id} novamente?` 
                : `Deseja cancelar o pagamento ${dialogAction?.payment?.reference_id}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogAction(null)}>Cancelar</Button>
            <Button onClick={confirmAction}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sheet for various payment actions */}
      <Sheet 
        open={!!sheetContent} 
        onOpenChange={(open) => !open && setSheetContent(null)}
      >
        <SheetContent className="overflow-y-auto w-full sm:max-w-xl">
          {renderSheetContent()}
        </SheetContent>
      </Sheet>
      
      {/* Hidden receipt for printing */}
      <div className="hidden">
        <PaymentReceipt 
          ref={receiptRef} 
          payment={selectedPayment}
          gymSettings={gymSettings}
        />
      </div>
    </MainLayout>
  );
};

export default Payments;
