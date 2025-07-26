import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Receipt as ReceiptIcon, 
  FileText, 
  CreditCard, 
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar,
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Printer,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import billingService from '@/services/billingService';
import { InvoicePDFButton } from '@/components/billing/InvoicePDF';
import { ReceiptPDFButton } from '@/components/billing/ReceiptPDF';
import { InvoicePreviewButton } from '@/components/billing/InvoicePreviewButton';
import PayInvoiceForm from '@/components/billing/PayInvoiceForm';
import TestBilling from '@/components/billing/TestBilling';
import { 
  Invoice, 
  Receipt, 
  FinancialDashboard, 
  InvoiceFilters,
  CreateInvoiceRequest 
} from '@/types/billing';

const BillingPage = () => {
  const [dashboard, setDashboard] = useState<FinancialDashboard | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [companyConfig, setCompanyConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [invoiceFilters, setInvoiceFilters] = useState<InvoiceFilters>({});
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showPayInvoice, setShowPayInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const { toast } = useToast();

  const loadDashboard = async () => {
    try {
      const data = await billingService.getFinancialDashboard();
      setDashboard(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dashboard financeiro.',
        variant: 'destructive',
      });
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await billingService.getInvoices(invoiceFilters);
      setInvoices(response.data);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar faturas.',
        variant: 'destructive',
      });
    }
  };

  const loadReceipts = async () => {
    try {
      const response = await billingService.getReceipts();
      setReceipts(response.data);
    } catch (error) {
      console.error('Error loading receipts:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar recibos.',
        variant: 'destructive',
      });
    }
  };

  const loadCompanyConfig = async () => {
    try {
      const config = await billingService.getCompanyConfig();
      setCompanyConfig(config);
    } catch (error) {
      console.error('Error loading company config:', error);
      // Don't show error toast for company config as it's not critical for display
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadDashboard(),
        loadInvoices(),
        loadReceipts(),
        loadCompanyConfig()
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleTriggerDailyJobs = async () => {
    try {
      const result = await billingService.triggerDailyInvoiceGeneration();
      toast({
        title: 'Sucesso',
        description: `Geração diária executada: ${result.result.success} faturas criadas`,
      });
      await loadAllData();
    } catch (error) {
      console.error('Error triggering daily jobs:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao executar geração diária.',
        variant: 'destructive',
      });
    }
  };

  const renderDashboardCards = () => {
    if (!dashboard) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Today's Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {billingService.formatCurrency(dashboard.valor_recebido_hoje)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboard.pagamentos_hoje} pagamentos recebidos
            </p>
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturas Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard.facturas_pendentes}</div>
            <p className="text-xs text-muted-foreground">
              {billingService.formatCurrency(dashboard.valor_pendente)} em aberto
            </p>
          </CardContent>
        </Card>

        {/* Overdue Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturas Vencidas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboard.facturas_vencidas}</div>
            <p className="text-xs text-muted-foreground">
              {billingService.formatCurrency(dashboard.valor_vencido)} vencidos
            </p>
          </CardContent>
        </Card>

        {/* Expiring Plans */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planos Expirando</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dashboard.planos_expirando}</div>
            <p className="text-xs text-muted-foreground">
              Próximos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderInvoicesTable = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Faturas Comerciais
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadInvoices}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
            <Dialog open={showCreateInvoice} onOpenChange={setShowCreateInvoice}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Nova Fatura
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Fatura</DialogTitle>
                </DialogHeader>
                {/* TODO: Implement CreateInvoiceForm component */}
                <p>Formulário de criação de fatura em desenvolvimento...</p>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por número ou cliente..."
                className="pl-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="paga">Paga</SelectItem>
                <SelectItem value="vencida">Vencida</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Invoices List */}
          <div className="space-y-2">
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma fatura encontrada
              </div>
            ) : (
              invoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-medium">{invoice.numero}</h3>
                        <p className="text-sm text-muted-foreground">
                          {invoice.member?.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {billingService.formatCurrency(invoice.total)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Vence: {billingService.formatDate(invoice.data_vencimento)}
                      </p>
                    </div>
                    
                    <Badge className={billingService.getStatusBadgeColor(invoice.estado)}>
                      {billingService.getStatusLabel(invoice.estado)}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <InvoicePreviewButton 
                        invoice={invoice} 
                        companyConfig={companyConfig}
                      />
                      {companyConfig && (
                        <InvoicePDFButton 
                          invoice={invoice} 
                          companyConfig={companyConfig}
                        />
                      )}
                      {invoice.estado === 'pendente' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowPayInvoice(true);
                          }}
                          className="text-green-600 border-green-200 hover:bg-green-50"
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Pagar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderReceiptsTable = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ReceiptIcon className="h-5 w-5" />
          Recibos de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {receipts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum recibo encontrado
            </div>
          ) : (
            receipts.map((receipt) => (
              <div key={receipt.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{receipt.numero}</h3>
                  <p className="text-sm text-muted-foreground">
                    Fatura: {receipt.factura_id}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">
                      {billingService.formatCurrency(receipt.valor_pago)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {billingService.getPaymentMethodLabel(receipt.metodo_pagamento)}
                    </p>
                  </div>
                  
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Pago
                  </Badge>
                  
                  <div className="flex gap-1">
                    {companyConfig && (
                      <ReceiptPDFButton 
                        receipt={receipt} 
                        companyConfig={companyConfig}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Pay Invoice Modal
  if (showPayInvoice && selectedInvoice) {
    return (
      <PayInvoiceForm
        invoice={selectedInvoice}
        onSuccess={() => {
          setShowPayInvoice(false);
          setSelectedInvoice(null);
          loadAllData();
        }}
        onCancel={() => {
          setShowPayInvoice(false);
          setSelectedInvoice(null);
        }}
      />
    );
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando dados financeiros...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Sistema de Faturação</h1>
            <p className="text-muted-foreground">
              Gestão completa de documentos fiscais e pagamentos
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAllData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Atualizar
            </Button>
            <Button onClick={handleTriggerDailyJobs}>
              <TrendingUp className="h-4 w-4 mr-1" />
              Gerar Faturas
            </Button>
          </div>
        </div>

        {/* Dashboard Cards */}
        {renderDashboardCards()}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="invoices">Faturas</TabsTrigger>
            <TabsTrigger value="receipts">Recibos</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="test">Teste</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Receita Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {dashboard ? billingService.formatCurrency(dashboard.receita_mensal) : '0,00 MT'}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total facturado este mês
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Fatura Manual
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ReceiptIcon className="h-4 w-4 mr-2" />
                    Registar Pagamento
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Relatórios
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="invoices">
            {renderInvoicesTable()}
          </TabsContent>

          <TabsContent value="receipts">
            {renderReceiptsTable()}
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Financeiros</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Relatórios detalhados em desenvolvimento...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test">
            <TestBilling />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default BillingPage; 