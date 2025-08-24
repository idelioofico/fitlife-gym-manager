import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePdfGenerator } from '@/hooks/usePdfGenerator';
import { db, Sale, SaleItem } from '@/lib/database';
import { 
  Plus, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Search, 
  Filter, 
  Receipt, 
  FileText, 
  Download,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  User,
  Phone,
  Mail
} from 'lucide-react';

const SalesFixed = () => {
  const { generateReceipt, generateInvoice } = usePdfGenerator();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showSaleDetail, setShowSaleDetail] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Novo venda form state
  const [newSale, setNewSale] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    paymentMethod: 'cash' as Sale['paymentMethod'],
    notes: '',
    items: [
      {
        productName: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0
      }
    ]
  });

  // Carregar dados da base de dados
  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    const dbSales = db.getAll('sales');
    setSales(dbSales);
    
    // Se não houver vendas, adicionar algumas de exemplo
    if (dbSales.length === 0) {
      const sampleSales = [
        {
          number: db.generateSaleNumber(),
          customerName: 'João Silva',
          customerEmail: 'joao@email.com',
          customerPhone: '+258 84 123 4567',
          date: new Date().toISOString().split('T')[0],
          items: [
            {
              id: '1',
              productName: 'Mensalidade Academia - Janeiro',
              quantity: 1,
              unitPrice: 2500,
              discount: 0,
              total: 2500
            }
          ],
          subtotal: 2500,
          discountAmount: 0,
          taxAmount: 425,
          total: 2925,
          paymentMethod: 'cash' as Sale['paymentMethod'],
          paymentStatus: 'paid' as Sale['paymentStatus'],
          notes: 'Pagamento mensalidade',
          createdBy: 'admin@hefel.com',
          invoiceGenerated: false,
          receiptGenerated: false
        }
      ];

      sampleSales.forEach(sale => {
        db.create('sales', sale);
      });
      
      loadSales(); // Recarregar após adicionar dados de exemplo
    }
  };

  const getPaymentMethodLabel = (method: Sale['paymentMethod']) => {
    switch (method) {
      case 'cash': return 'Dinheiro';
      case 'card': return 'Cartão';
      case 'transfer': return 'Transferência';
      case 'mpesa': return 'M-Pesa';
      default: return method;
    }
  };

  const getStatusColor = (status: Sale['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Sale['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'partial': return 'Parcial';
      default: return status;
    }
  };

  // Função para gerar PDF de recibo
  const handleGenerateReceipt = (sale: Sale) => {
    const receiptData = {
      number: sale.number,
      customerName: sale.customerName,
      customerEmail: sale.customerEmail,
      customerPhone: sale.customerPhone,
      items: sale.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.unitPrice,
        total: item.total
      })),
      subtotal: sale.subtotal,
      tax: sale.taxAmount,
      total: sale.total,
      paymentMethod: getPaymentMethodLabel(sale.paymentMethod),
      date: sale.date
    };
    
    generateReceipt(receiptData);
    
    // Marcar recibo como gerado
    db.update('sales', sale.id, { receiptGenerated: true });
    setSales(db.getAll('sales'));
  };

  // Função para gerar PDF de fatura
  const handleGenerateInvoice = (sale: Sale) => {
    const invoiceData = {
      number: sale.number.replace('VD', 'FT'),
      customerName: sale.customerName,
      customerEmail: sale.customerEmail || '',
      customerNuit: '', // Campo para NUIT se necessário
      items: sale.items.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.unitPrice,
        total: item.total
      })),
      subtotal: sale.subtotal,
      tax: sale.taxAmount,
      total: sale.total,
      date: sale.date
    };
    
    generateInvoice(invoiceData);
    
    // Marcar como gerado
    db.update('sales', sale.id, { invoiceGenerated: true });
    setSales(db.getAll('sales'));
  };

  const addItemToNewSale = () => {
    setNewSale(prev => ({
      ...prev,
      items: [...prev.items, {
        productName: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0
      }]
    }));
  };

  const updateSaleItem = (index: number, field: string, value: any) => {
    setNewSale(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateItemTotal = (item: any) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = item.discount;
    return subtotal - discountAmount;
  };

  const calculateSaleTotals = () => {
    const subtotal = newSale.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
    const discountAmount = newSale.items.reduce((sum, item) => 
      sum + item.discount, 0
    );
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = Math.round(taxableAmount * 0.17);
    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const createSale = () => {
    try {
      const totals = calculateSaleTotals();
      const saleNumber = db.generateSaleNumber();
      
      const sale = {
        number: saleNumber,
        customerName: newSale.customerName,
        customerEmail: newSale.customerEmail,
        customerPhone: newSale.customerPhone,
        date: new Date().toISOString().split('T')[0],
        items: newSale.items.map((item, index) => ({
          id: index.toString(),
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: calculateItemTotal(item)
        })),
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        taxAmount: totals.taxAmount,
        total: totals.total,
        paymentMethod: newSale.paymentMethod,
        paymentStatus: 'paid' as Sale['paymentStatus'],
        notes: newSale.notes,
        createdBy: 'admin@hefel.com',
        invoiceGenerated: false,
        receiptGenerated: false
      };

      db.create('sales', sale);
      setSales(db.getAll('sales'));
      setIsCreateModalOpen(false);
      setNewSale({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        paymentMethod: 'cash',
        notes: '',
        items: [{ productName: '', quantity: 1, unitPrice: 0, discount: 0 }]
      });
      alert('Venda registrada com sucesso!');
    } catch (error) {
      alert('Erro ao registrar venda: ' + error);
    }
  };

  const markAsPaid = (saleId: string) => {
    try {
      db.update('sales', saleId, { paymentStatus: 'paid' });
      setSales(db.getAll('sales'));
      alert('Venda marcada como paga!');
    } catch (error) {
      alert('Erro ao atualizar venda: ' + error);
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sale.paymentStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || sale.paymentMethod === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const totalRevenue = sales.filter(s => s.paymentStatus === 'paid').reduce((sum, sale) => sum + sale.total, 0);
  const pendingRevenue = sales.filter(s => s.paymentStatus === 'pending').reduce((sum, sale) => sum + sale.total, 0);
  const todaySales = sales.filter(s => s.date === new Date().toISOString().split('T')[0]);

  const SaleDetail = ({ sale }: { sale: Sale }) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Venda {sale.number}</h2>
            <p className="text-gray-600">Data: {new Date(sale.date).toLocaleDateString('pt-MZ')}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-green-600">{sale.total.toLocaleString('pt-MZ')} MZN</p>
            <Badge className={getStatusColor(sale.paymentStatus)}>
              {getStatusLabel(sale.paymentStatus)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span>{sale.customerName}</span>
              </div>
              {sale.customerPhone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span>{sale.customerPhone}</span>
                </div>
              )}
              {sale.customerEmail && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{sale.customerEmail}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <span>{getPaymentMethodLabel(sale.paymentMethod)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span>{new Date(sale.date).toLocaleDateString('pt-MZ')}</span>
              </div>
              <div>
                <Badge className={getStatusColor(sale.paymentStatus)}>
                  {getStatusLabel(sale.paymentStatus)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Itens da Venda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sale.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      Qtd: {item.quantity} x {item.unitPrice.toLocaleString('pt-MZ')} MZN
                      {item.discount > 0 && ` (Desconto: ${item.discount.toLocaleString('pt-MZ')} MZN)`}
                    </p>
                  </div>
                  <div className="font-bold">
                    {item.total.toLocaleString('pt-MZ')} MZN
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{sale.subtotal.toLocaleString('pt-MZ')} MZN</span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Desconto:</span>
                  <span>-{sale.discountAmount.toLocaleString('pt-MZ')} MZN</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>IVA (17%):</span>
                <span>{sale.taxAmount.toLocaleString('pt-MZ')} MZN</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{sale.total.toLocaleString('pt-MZ')} MZN</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {sale.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{sale.notes}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <div className="flex space-x-2">
            <Button
              onClick={() => handleGenerateReceipt(sale)}
              disabled={sale.receiptGenerated}
            >
              <Receipt className="w-4 h-4 mr-2" />
              {sale.receiptGenerated ? 'Recibo Gerado' : 'Gerar Recibo'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleGenerateInvoice(sale)}
              disabled={sale.invoiceGenerated}
            >
              <FileText className="w-4 h-4 mr-2" />
              {sale.invoiceGenerated ? 'Fatura Gerada' : 'Gerar Fatura'}
            </Button>
          </div>
          {sale.paymentStatus !== 'paid' && (
            <Button onClick={() => markAsPaid(sale.id)}>
              Marcar como Pago
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <MainLayout title="Histórico de Vendas">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Histórico de Vendas</h1>
            <p className="text-gray-600">Gestão de transações e vendas do ginásio Hefel</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Venda
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nova Venda</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Nome do Cliente *</Label>
                    <Input
                      id="customerName"
                      value={newSale.customerName}
                      onChange={(e) => setNewSale({...newSale, customerName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Email do Cliente</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={newSale.customerEmail}
                      onChange={(e) => setNewSale({...newSale, customerEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Telefone do Cliente</Label>
                    <Input
                      id="customerPhone"
                      value={newSale.customerPhone}
                      onChange={(e) => setNewSale({...newSale, customerPhone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                    <Select value={newSale.paymentMethod} onValueChange={(value) => setNewSale({...newSale, paymentMethod: value as Sale['paymentMethod']})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="card">Cartão</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                        <SelectItem value="mpesa">M-Pesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Itens da Venda</h3>
                    <Button type="button" variant="outline" onClick={addItemToNewSale}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {newSale.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-4 border rounded">
                        <div>
                          <Label>Produto/Serviço</Label>
                          <Input
                            value={item.productName}
                            onChange={(e) => updateSaleItem(index, 'productName', e.target.value)}
                            placeholder="Nome do produto"
                          />
                        </div>
                        <div>
                          <Label>Quantidade</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateSaleItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            min="1"
                          />
                        </div>
                        <div>
                          <Label>Preço Unitário (MZN)</Label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateSaleItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label>Desconto (MZN)</Label>
                          <Input
                            type="number"
                            value={item.discount}
                            onChange={(e) => updateSaleItem(index, 'discount', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <Label>Total</Label>
                          <div className="p-2 bg-gray-100 rounded text-right font-medium">
                            {calculateItemTotal(item).toLocaleString('pt-MZ')} MZN
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{calculateSaleTotals().subtotal.toLocaleString('pt-MZ')} MZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Desconto Total:</span>
                        <span>-{calculateSaleTotals().discountAmount.toLocaleString('pt-MZ')} MZN</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IVA (17%):</span>
                        <span>{calculateSaleTotals().taxAmount.toLocaleString('pt-MZ')} MZN</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{calculateSaleTotals().total.toLocaleString('pt-MZ')} MZN</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={newSale.notes}
                    onChange={(e) => setNewSale({...newSale, notes: e.target.value})}
                    placeholder="Observações adicionais..."
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createSale}>
                    Registrar Venda
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {totalRevenue.toLocaleString('pt-MZ')} MZN
                  </div>
                  <div className="text-sm text-gray-600">Receita Total</div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {pendingRevenue.toLocaleString('pt-MZ')} MZN
                  </div>
                  <div className="text-sm text-gray-600">Receita Pendente</div>
                </div>
                <Calendar className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{sales.length}</div>
              <div className="text-sm text-gray-600">Total de Vendas</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{todaySales.length}</div>
              <div className="text-sm text-gray-600">Vendas Hoje</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por cliente ou número da venda..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                  <SelectItem value="mpesa">M-Pesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Vendas */}
        <div className="space-y-4">
          {filteredSales.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma venda encontrada</h3>
                <p className="text-gray-500">Tente ajustar os filtros ou registre uma nova venda.</p>
              </CardContent>
            </Card>
          ) : (
            filteredSales.map((sale) => (
              <Card key={sale.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{sale.number}</h3>
                        <p className="text-sm text-gray-600">{sale.customerName}</p>
                        <p className="text-xs text-gray-500">{new Date(sale.date).toLocaleDateString('pt-MZ')}</p>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Badge className={getStatusColor(sale.paymentStatus)}>
                          {getStatusLabel(sale.paymentStatus)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getPaymentMethodLabel(sale.paymentMethod)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        {sale.total.toLocaleString('pt-MZ')} MZN
                      </p>
                      <p className="text-sm text-gray-600">
                        {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedSale(sale);
                          setShowSaleDetail(true);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateReceipt(sale)}
                        disabled={sale.receiptGenerated}
                      >
                        <Receipt className="w-4 h-4 mr-1" />
                        {sale.receiptGenerated ? 'Recibo' : 'Gerar Recibo'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateInvoice(sale)}
                        disabled={sale.invoiceGenerated}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        {sale.invoiceGenerated ? 'Fatura' : 'Gerar Fatura'}
                      </Button>
                      {sale.paymentStatus !== 'paid' && (
                        <Button size="sm" onClick={() => markAsPaid(sale.id)}>
                          Marcar Pago
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Dialog de Detalhes da Venda */}
        <Dialog open={showSaleDetail} onOpenChange={setShowSaleDetail}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Venda</DialogTitle>
            </DialogHeader>
            {selectedSale && <SaleDetail sale={selectedSale} />}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default SalesFixed; 