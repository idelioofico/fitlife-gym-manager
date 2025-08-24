import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Receipt, DollarSign, TrendingDown, AlertTriangle, Search, Calendar, FileText } from 'lucide-react';

interface Expense {
  id: string;
  number: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  supplier?: string;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mpesa';
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  receiptUrl?: string;
  notes?: string;
  approvedBy?: string;
  approvedDate?: string;
  createdBy: string;
  createdAt: string;
}

const ExpensesFixed = () => {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      number: 'EXP2025001',
      description: 'Aluguel do ginásio - Julho 2025',
      category: 'Aluguel',
      amount: 15000,
      date: '2025-07-01',
      supplier: 'Proprietário do Edifício',
      paymentMethod: 'transfer',
      status: 'paid',
      notes: 'Pagamento mensal do aluguel',
      approvedBy: 'admin@hefel.com',
      approvedDate: '2025-07-01',
      createdBy: 'admin@hefel.com',
      createdAt: '2025-07-01T08:00:00Z'
    },
    {
      id: '2',
      number: 'EXP2025002',
      description: 'Equipamento de musculação',
      category: 'Equipamentos',
      amount: 8500,
      date: '2025-07-01',
      supplier: 'FitEquip Moçambique',
      paymentMethod: 'cash',
      status: 'approved',
      notes: 'Halteres e barras novas',
      approvedBy: 'admin@hefel.com',
      approvedDate: '2025-07-01',
      createdBy: 'admin@hefel.com',
      createdAt: '2025-07-01T09:30:00Z'
    },
    {
      id: '3',
      number: 'EXP2025003',
      description: 'Material de limpeza',
      category: 'Limpeza',
      amount: 1200,
      date: '2025-07-01',
      supplier: 'Limpeza Total Lda',
      paymentMethod: 'cash',
      status: 'pending',
      notes: 'Detergentes e produtos de higiene',
      createdBy: 'admin@hefel.com',
      createdAt: '2025-07-01T11:00:00Z'
    },
    {
      id: '4',
      number: 'EXP2025004',
      description: 'Conta de electricidade',
      category: 'Utilidades',
      amount: 3200,
      date: '2025-06-30',
      supplier: 'EDM',
      paymentMethod: 'transfer',
      status: 'paid',
      notes: 'Conta de junho 2025',
      approvedBy: 'admin@hefel.com',
      approvedDate: '2025-06-30',
      createdBy: 'admin@hefel.com',
      createdAt: '2025-06-30T16:00:00Z'
    }
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Nova despesa form state
  const [newExpense, setNewExpense] = useState({
    description: '',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    supplier: '',
    paymentMethod: 'cash' as Expense['paymentMethod'],
    notes: ''
  });

  const categories = [
    'Aluguel',
    'Equipamentos',
    'Limpeza',
    'Utilidades',
    'Marketing',
    'Salários',
    'Manutenção',
    'Suplementos',
    'Seguros',
    'Outros'
  ];

  const getStatusColor = (status: Expense['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodLabel = (method: Expense['paymentMethod']) => {
    switch (method) {
      case 'cash': return 'Dinheiro';
      case 'card': return 'Cartão';
      case 'transfer': return 'Transferência';
      case 'mpesa': return 'Mpesa';
      default: return method;
    }
  };

  const createExpense = () => {
    const expenseNumber = `EXP${new Date().getFullYear()}${String(expenses.length + 1).padStart(3, '0')}`;
    
    const expense: Expense = {
      id: String(expenses.length + 1),
      number: expenseNumber,
      description: newExpense.description,
      category: newExpense.category,
      amount: newExpense.amount,
      date: newExpense.date,
      supplier: newExpense.supplier,
      paymentMethod: newExpense.paymentMethod,
      status: 'pending',
      notes: newExpense.notes,
      createdBy: 'admin@hefel.com',
      createdAt: new Date().toISOString()
    };

    setExpenses(prev => [expense, ...prev]);
    setIsCreateModalOpen(false);
    
    // Reset form
    setNewExpense({
      description: '',
      category: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      supplier: '',
      paymentMethod: 'cash',
      notes: ''
    });
  };

  const approveExpense = (expenseId: string) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === expenseId 
        ? { 
            ...expense, 
            status: 'approved',
            approvedBy: 'admin@hefel.com',
            approvedDate: new Date().toISOString()
          }
        : expense
    ));
  };

  const markAsPaid = (expenseId: string) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === expenseId 
        ? { ...expense, status: 'paid' }
        : expense
    ));
  };

  const rejectExpense = (expenseId: string) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === expenseId 
        ? { ...expense, status: 'rejected' }
        : expense
    ));
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Cálculos de estatísticas
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const currentDate = new Date();
    return expenseDate.getMonth() === currentDate.getMonth() && 
           expenseDate.getFullYear() === currentDate.getFullYear();
  });
  
  const monthlyTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingTotal = expenses.filter(expense => expense.status === 'pending').reduce((sum, expense) => sum + expense.amount, 0);
  const paidTotal = expenses.filter(expense => expense.status === 'paid').reduce((sum, expense) => sum + expense.amount, 0);

  // Análise por categoria
  const categoryTotals = categories.map(category => ({
    category,
    total: expenses.filter(e => e.category === category && e.status === 'paid').reduce((sum, e) => sum + e.amount, 0),
    count: expenses.filter(e => e.category === category && e.status === 'paid').length
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  return (
    <MainLayout title="Gestão de Despesas">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestão de Despesas</h1>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nova Despesa</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label>Descrição</Label>
                  <Input 
                    value={newExpense.description}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da despesa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={newExpense.category} onValueChange={(value) => 
                      setNewExpense(prev => ({ ...prev, category: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Valor (MZN)</Label>
                    <Input 
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data</Label>
                    <Input 
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Método de Pagamento</Label>
                    <Select value={newExpense.paymentMethod} onValueChange={(value: Expense['paymentMethod']) => 
                      setNewExpense(prev => ({ ...prev, paymentMethod: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="card">Cartão</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                        <SelectItem value="mpesa">Mpesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Fornecedor</Label>
                  <Input 
                    value={newExpense.supplier}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, supplier: e.target.value }))}
                    placeholder="Nome do fornecedor"
                  />
                </div>

                <div>
                  <Label>Observações</Label>
                  <Textarea 
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Observações adicionais"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={createExpense}>
                    Registrar Despesa
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
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {monthlyTotal.toLocaleString('pt-MZ')} MZN
                  </div>
                  <div className="text-sm text-gray-600">Despesas Mês</div>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {pendingTotal.toLocaleString('pt-MZ')} MZN
                  </div>
                  <div className="text-sm text-gray-600">Pendentes</div>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {paidTotal.toLocaleString('pt-MZ')} MZN
                  </div>
                  <div className="text-sm text-gray-600">Pagas</div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {expenses.filter(e => e.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-600">Aguardando</div>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análise por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryTotals.map(({ category, total, count }) => (
                <div key={category} className="flex justify-between items-center">
                  <div>
                    <span className="font-medium">{category}</span>
                    <span className="text-sm text-gray-500 ml-2">({count} despesas)</span>
                  </div>
                  <div className="font-bold">{total.toLocaleString('pt-MZ')} MZN</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filtros */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar por descrição, número ou fornecedor..."
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
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lista de Despesas */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{expense.number}</div>
                        <div className="text-sm text-gray-600">{expense.description}</div>
                        <div className="text-xs text-gray-500">
                          {expense.category} • {expense.supplier} • {getPaymentMethodLabel(expense.paymentMethod)}
                        </div>
                      </div>
                      <Badge className={getStatusColor(expense.status)}>
                        {expense.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">-{expense.amount.toLocaleString('pt-MZ')} MZN</div>
                    <div className="text-sm text-gray-600">{new Date(expense.date).toLocaleDateString('pt-MZ')}</div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {expense.status === 'pending' && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => approveExpense(expense.id)}>
                          Aprovar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => rejectExpense(expense.id)}>
                          Rejeitar
                        </Button>
                      </>
                    )}
                    {expense.status === 'approved' && (
                      <Button size="sm" variant="outline" onClick={() => markAsPaid(expense.id)}>
                        Marcar Pago
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      Ver Detalhes
                    </Button>
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

export default ExpensesFixed; 