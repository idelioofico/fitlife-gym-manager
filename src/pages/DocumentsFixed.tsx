import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Document, DocumentItem } from '@/types/document';
import { Plus, FileText, Download, Eye, Edit, Trash2, Search } from 'lucide-react';

const DocumentsFixed = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      type: 'invoice',
      number: 'FT2025001',
      prefix: 'FT',
      customerName: 'João Silva',
      customerEmail: 'joao@email.com',
      customerAddress: 'Rua da Liberdade, 123, Maputo',
      customerTaxNumber: '123456789',
      issueDate: '2025-07-01',
      dueDate: '2025-07-15',
      items: [
        {
          id: '1',
          description: 'Mensalidade Academia - Julho 2025',
          quantity: 1,
          unitPrice: 2500,
          discount: 0,
          taxRate: 17,
          total: 2925
        }
      ],
      subtotal: 2500,
      discountAmount: 0,
      taxAmount: 425,
      total: 2925,
      status: 'sent',
      paymentTerms: '15 dias',
      issuedBy: 'admin@hefel.com',
      createdAt: '2025-07-01T10:00:00Z'
    },
    {
      id: '2',
      type: 'receipt',
      number: 'RC2025001',
      prefix: 'RC',
      customerName: 'Maria Santos',
      customerEmail: 'maria@email.com',
      issueDate: '2025-07-01',
      items: [
        {
          id: '1',
          description: 'Proteína Whey',
          quantity: 1,
          unitPrice: 2500,
          discount: 0,
          taxRate: 17,
          total: 2925
        }
      ],
      subtotal: 2500,
      discountAmount: 0,
      taxAmount: 425,
      total: 2925,
      status: 'paid',
      issuedBy: 'admin@hefel.com',
      createdAt: '2025-07-01T11:00:00Z'
    }
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Novo documento form state
  const [newDocument, setNewDocument] = useState({
    type: 'invoice' as Document['type'],
    customerName: '',
    customerEmail: '',
    customerAddress: '',
    customerTaxNumber: '',
    dueDate: '',
    paymentTerms: '30 dias',
    notes: '',
    items: [
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 17
      }
    ]
  });

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: Document['type']) => {
    switch (type) {
      case 'invoice': return 'Fatura';
      case 'receipt': return 'Recibo';
      case 'quotation': return 'Orçamento';
      case 'credit_note': return 'Nota de Crédito';
      case 'debit_note': return 'Nota de Débito';
      default: return type;
    }
  };

  const addItemToNewDocument = () => {
    setNewDocument(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 17
      }]
    }));
  };

  const updateDocumentItem = (index: number, field: string, value: any) => {
    setNewDocument(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateItemTotal = (item: any) => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discount / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (item.taxRate / 100);
    return taxableAmount + taxAmount;
  };

  const calculateDocumentTotals = () => {
    const subtotal = newDocument.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0
    );
    const discountAmount = newDocument.items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice * (item.discount / 100)), 0
    );
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = newDocument.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = itemSubtotal * (item.discount / 100);
      const itemTaxable = itemSubtotal - itemDiscount;
      return sum + (itemTaxable * (item.taxRate / 100));
    }, 0);
    const total = taxableAmount + taxAmount;

    return { subtotal, discountAmount, taxAmount, total };
  };

  const createDocument = () => {
    const totals = calculateDocumentTotals();
    const docNumber = `${newDocument.type === 'invoice' ? 'FT' : 'RC'}${new Date().getFullYear()}${String(documents.length + 1).padStart(3, '0')}`;
    
    const document: Document = {
      id: String(documents.length + 1),
      type: newDocument.type,
      number: docNumber,
      prefix: newDocument.type === 'invoice' ? 'FT' : 'RC',
      customerName: newDocument.customerName,
      customerEmail: newDocument.customerEmail,
      customerAddress: newDocument.customerAddress,
      customerTaxNumber: newDocument.customerTaxNumber,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: newDocument.dueDate,
      items: newDocument.items.map((item, index) => ({
        id: String(index + 1),
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        taxRate: item.taxRate,
        total: calculateItemTotal(item)
      })),
      subtotal: totals.subtotal,
      discountAmount: totals.discountAmount,
      taxAmount: totals.taxAmount,
      total: totals.total,
      status: 'draft',
      paymentTerms: newDocument.paymentTerms,
      notes: newDocument.notes,
      issuedBy: 'admin@hefel.com',
      createdAt: new Date().toISOString()
    };

    setDocuments(prev => [document, ...prev]);
    setIsCreateModalOpen(false);
    
    // Reset form
    setNewDocument({
      type: 'invoice',
      customerName: '',
      customerEmail: '',
      customerAddress: '',
      customerTaxNumber: '',
      dueDate: '',
      paymentTerms: '30 dias',
      notes: '',
      items: [{
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 17
      }]
    });
  };

  const generatePDF = (document: Document) => {
    // Simulação de geração de PDF
    alert(`PDF gerado para ${getTypeLabel(document.type)} ${document.number}`);
  };

  const sendDocument = (document: Document) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === document.id 
        ? { ...doc, status: 'sent', sentDate: new Date().toISOString() }
        : doc
    ));
  };

  const markAsPaid = (document: Document) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === document.id 
        ? { ...doc, status: 'paid' }
        : doc
    ));
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totals = calculateDocumentTotals();

  return (
    <MainLayout title="Gestão de Documentos">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestão de Documentos</h1>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Criar Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Criar Novo Documento</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Documento</Label>
                    <Select value={newDocument.type} onValueChange={(value: Document['type']) => 
                      setNewDocument(prev => ({ ...prev, type: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invoice">Fatura</SelectItem>
                        <SelectItem value="receipt">Recibo</SelectItem>
                        <SelectItem value="quotation">Orçamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Data de Vencimento</Label>
                    <Input 
                      type="date"
                      value={newDocument.dueDate}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Cliente</Label>
                    <Input 
                      value={newDocument.customerName}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input 
                      type="email"
                      value={newDocument.customerEmail}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <Label>Endereço</Label>
                  <Input 
                    value={newDocument.customerAddress}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, customerAddress: e.target.value }))}
                    placeholder="Endereço completo"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>NUIT</Label>
                    <Input 
                      value={newDocument.customerTaxNumber}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, customerTaxNumber: e.target.value }))}
                      placeholder="Número fiscal"
                    />
                  </div>
                  <div>
                    <Label>Condições de Pagamento</Label>
                    <Select value={newDocument.paymentTerms} onValueChange={(value) => 
                      setNewDocument(prev => ({ ...prev, paymentTerms: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="À vista">À vista</SelectItem>
                        <SelectItem value="15 dias">15 dias</SelectItem>
                        <SelectItem value="30 dias">30 dias</SelectItem>
                        <SelectItem value="60 dias">60 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Label className="text-lg font-semibold">Itens</Label>
                    <Button type="button" variant="outline" onClick={addItemToNewDocument}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {newDocument.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end border p-4 rounded">
                        <div className="col-span-4">
                          <Label>Descrição</Label>
                          <Input 
                            value={item.description}
                            onChange={(e) => updateDocumentItem(index, 'description', e.target.value)}
                            placeholder="Descrição do item"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Qtd</Label>
                          <Input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateDocumentItem(index, 'quantity', Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Preço Unit.</Label>
                          <Input 
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateDocumentItem(index, 'unitPrice', Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Desconto %</Label>
                          <Input 
                            type="number"
                            value={item.discount}
                            onChange={(e) => updateDocumentItem(index, 'discount', Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Total</Label>
                          <div className="p-2 bg-gray-50 rounded text-right font-medium">
                            {calculateItemTotal(item).toLocaleString('pt-MZ')} MZN
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Observações</Label>
                  <Textarea 
                    value={newDocument.notes}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Observações adicionais"
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total do Documento:</span>
                    <span>{totals.total.toLocaleString('pt-MZ')} MZN</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    <div>Subtotal: {totals.subtotal.toLocaleString('pt-MZ')} MZN</div>
                    <div>IVA (17%): {totals.taxAmount.toLocaleString('pt-MZ')} MZN</div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createDocument}>
                    Criar Documento
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {documents.filter(d => d.type === 'invoice').length}
              </div>
              <div className="text-sm text-gray-600">Faturas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {documents.filter(d => d.type === 'receipt').length}
              </div>
              <div className="text-sm text-gray-600">Recibos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {documents.filter(d => d.status === 'sent').length}
              </div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {documents.reduce((sum, d) => sum + d.total, 0).toLocaleString('pt-MZ')} MZN
              </div>
              <div className="text-sm text-gray-600">Total Faturado</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por cliente ou número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="sent">Enviado</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Documentos */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{document.number}</div>
                        <div className="text-sm text-gray-600">{document.customerName}</div>
                      </div>
                      <Badge className={getStatusColor(document.status)}>
                        {document.status}
                      </Badge>
                      <Badge variant="outline">
                        {getTypeLabel(document.type)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{document.total.toLocaleString('pt-MZ')} MZN</div>
                    <div className="text-sm text-gray-600">{new Date(document.issueDate).toLocaleDateString('pt-MZ')}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" onClick={() => generatePDF(document)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    {document.status === 'draft' && (
                      <Button size="sm" variant="outline" onClick={() => sendDocument(document)}>
                        Enviar
                      </Button>
                    )}
                    {document.status === 'sent' && document.type === 'invoice' && (
                      <Button size="sm" variant="outline" onClick={() => markAsPaid(document)}>
                        Marcar Pago
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DocumentsFixed; 