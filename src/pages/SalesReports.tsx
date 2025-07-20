import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePdfGenerator } from '@/hooks/usePdfGenerator';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Download, 
  Filter,
  FileText,
  Users,
  ShoppingCart,
  CreditCard,
  Target,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const SalesReports = () => {
  const { generateFinancialReport } = usePdfGenerator();
  const [dateFilter, setDateFilter] = useState('current_month');
  const [reportType, setReportType] = useState('overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Dados simulados para relatórios
  const salesData = {
    totalRevenue: 485000,
    totalExpenses: 185000,
    netProfit: 300000,
    transactionCount: 247,
    averageTicket: 1964,
    growthRate: 15.8,
    profitMargin: 61.9
  };

  const monthlyData = [
    { month: 'Jan', revenue: 385000, expenses: 155000, profit: 230000, transactions: 198 },
    { month: 'Fev', revenue: 420000, expenses: 165000, profit: 255000, transactions: 215 },
    { month: 'Mar', revenue: 445000, expenses: 170000, profit: 275000, transactions: 228 },
    { month: 'Abr', revenue: 465000, expenses: 175000, profit: 290000, transactions: 235 },
    { month: 'Mai', revenue: 472000, expenses: 180000, profit: 292000, transactions: 241 },
    { month: 'Jun', revenue: 485000, expenses: 185000, profit: 300000, transactions: 247 },
  ];

  const revenueCategories = [
    { category: 'Mensalidades', amount: 325000, percentage: 67.0, transactions: 180, growth: 12.5 },
    { category: 'Suplementos', amount: 85000, percentage: 17.5, transactions: 45, growth: 25.3 },
    { category: 'Personal Training', amount: 45000, percentage: 9.3, transactions: 15, growth: 18.7 },
    { category: 'Produtos Fitness', amount: 20000, percentage: 4.1, transactions: 25, growth: 8.2 },
    { category: 'Serviços Extras', amount: 10000, percentage: 2.1, transactions: 8, growth: -5.1 },
  ];

  const expenseCategories = [
    { category: 'Aluguel', amount: 65000, percentage: 35.1, budget: 65000, variance: 0 },
    { category: 'Salários', amount: 55000, percentage: 29.7, budget: 50000, variance: 10.0 },
    { category: 'Equipamentos', amount: 25000, percentage: 13.5, budget: 30000, variance: -16.7 },
    { category: 'Utilidades', amount: 18000, percentage: 9.7, budget: 20000, variance: -10.0 },
    { category: 'Marketing', amount: 12000, percentage: 6.5, budget: 15000, variance: -20.0 },
    { category: 'Outros', amount: 10000, percentage: 5.4, budget: 8000, variance: 25.0 },
  ];

  const topProducts = [
    { product: 'Mensalidade Premium', sales: 85, revenue: 212500, growth: 15.2, margin: 85.0 },
    { product: 'Mensalidade Básica', sales: 95, revenue: 142500, growth: 8.5, margin: 90.0 },
    { product: 'Proteína Whey', sales: 28, revenue: 70000, growth: 32.1, margin: 45.0 },
    { product: 'Personal Training', sales: 15, revenue: 45000, growth: 18.7, margin: 75.0 },
    { product: 'Creatina', sales: 22, revenue: 26400, growth: 28.5, margin: 50.0 },
  ];

  const paymentMethods = [
    { method: 'Cartão', amount: 291000, percentage: 60.0, transactions: 148, avgTicket: 1966 },
    { method: 'Dinheiro', amount: 116400, percentage: 24.0, transactions: 62, avgTicket: 1877 },
    { method: 'Transferência', amount: 58200, percentage: 12.0, transactions: 25, avgTicket: 2328 },
    { method: 'M-Pesa', amount: 19400, percentage: 4.0, transactions: 12, avgTicket: 1617 },
  ];

  const membershipAnalysis = [
    { plan: 'Premium Mensal', members: 156, revenue: 390000, retention: 92.3, churn: 7.7 },
    { plan: 'Básico Mensal', members: 98, revenue: 147000, retention: 89.8, churn: 10.2 },
    { plan: 'Anual Premium', members: 45, revenue: 135000, retention: 96.7, churn: 3.3 },
    { plan: 'Estudante', members: 35, revenue: 52500, retention: 85.2, churn: 14.8 },
  ];

  const weeklyTrends = [
    { day: 'Segunda', revenue: 75000, transactions: 42, avgTicket: 1786 },
    { day: 'Terça', revenue: 68000, transactions: 38, avgTicket: 1789 },
    { day: 'Quarta', revenue: 72000, transactions: 40, avgTicket: 1800 },
    { day: 'Quinta', revenue: 78000, transactions: 43, avgTicket: 1814 },
    { day: 'Sexta', revenue: 85000, transactions: 48, avgTicket: 1771 },
    { day: 'Sábado', revenue: 92000, transactions: 52, avgTicket: 1769 },
    { day: 'Domingo', revenue: 55000, transactions: 32, avgTicket: 1719 },
  ];

  const generateReport = () => {
    const periodLabel = dateFilter === 'current_month' ? 'Mês Atual' : 
                       dateFilter === 'last_month' ? 'Mês Passado' :
                       dateFilter === 'current_quarter' ? 'Trimestre Atual' :
                       dateFilter === 'current_year' ? 'Ano Atual' : 'Período Personalizado';
    
    const reportData = {
      period: periodLabel,
      totalRevenue: salesData.totalRevenue,
      totalExpenses: salesData.totalExpenses,
      netProfit: salesData.netProfit,
      transactionCount: salesData.transactionCount,
      averageTicket: salesData.averageTicket,
      growthRate: salesData.growthRate,
      profitMargin: salesData.profitMargin,
      topCategories: revenueCategories.slice(0, 5),
      paymentMethods: paymentMethods,
      monthlyTrends: monthlyData
    };
    
    generateFinancialReport(reportData, periodLabel);
  };

  const exportData = (type: string) => {
    let data = '';
    let filename = '';

    switch (type) {
      case 'revenue':
        data = revenueCategories.map(cat => 
          `${cat.category},${cat.amount},${cat.percentage},${cat.transactions},${cat.growth}`
        ).join('\n');
        filename = 'Receitas_por_Categoria.csv';
        break;
      case 'expenses':
        data = expenseCategories.map(cat => 
          `${cat.category},${cat.amount},${cat.percentage},${cat.budget},${cat.variance}`
        ).join('\n');
        filename = 'Despesas_por_Categoria.csv';
        break;
      case 'products':
        data = topProducts.map(prod => 
          `${prod.product},${prod.sales},${prod.revenue},${prod.growth},${prod.margin}`
        ).join('\n');
        filename = 'Top_Produtos.csv';
        break;
      case 'payments':
        data = paymentMethods.map(method => 
          `${method.method},${method.amount},${method.percentage},${method.transactions},${method.avgTicket}`
        ).join('\n');
        filename = 'Metodos_Pagamento.csv';
        break;
    }

    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);

    alert(`Dados exportados: ${filename}`);
  };

  return (
    <MainLayout title="Relatórios de Vendas">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
            <p className="text-gray-600">Análises e insights do desempenho financeiro do ginásio Hefel</p>
          </div>
          <div className="flex gap-2">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Mês Atual</SelectItem>
                <SelectItem value="last_month">Mês Passado</SelectItem>
                <SelectItem value="current_quarter">Trimestre Atual</SelectItem>
                <SelectItem value="current_year">Ano Atual</SelectItem>
                <SelectItem value="custom">Período Personalizado</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generateReport}>
              <Download className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </div>

        {dateFilter === 'custom' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4 items-end">
                <div>
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Aplicar Filtro
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {salesData.totalRevenue.toLocaleString('pt-MZ')} MZN
                  </div>
                  <div className="text-sm text-gray-600">Receita Total</div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {salesData.totalExpenses.toLocaleString('pt-MZ')} MZN
                  </div>
                  <div className="text-sm text-gray-600">Despesas Total</div>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {salesData.netProfit.toLocaleString('pt-MZ')} MZN
                  </div>
                  <div className="text-sm text-gray-600">Lucro Líquido</div>
                </div>
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {salesData.transactionCount}
              </div>
              <div className="text-sm text-gray-600">Transações</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {salesData.averageTicket.toLocaleString('pt-MZ')} MZN
              </div>
              <div className="text-sm text-gray-600">Ticket Médio</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-green-600">
                  +{salesData.growthRate}%
                </div>
                <TrendingUp className="w-6 h-6 text-green-600 ml-2" />
              </div>
              <div className="text-sm text-gray-600">Crescimento</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-indigo-600">
                {salesData.profitMargin}%
              </div>
              <div className="text-sm text-gray-600">Margem Lucro</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="revenue">Receitas</TabsTrigger>
            <TabsTrigger value="expenses">Despesas</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Gráfico de Evolução Mensal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Evolução Mensal - Receitas vs Despesas vs Lucro</span>
                  <Button variant="outline" size="sm" onClick={() => exportData('monthly')}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="font-medium min-w-[60px]">{data.month}</div>
                      <div className="flex gap-8 flex-1">
                        <div className="text-green-600">
                          <span className="text-sm">Receita:</span>
                          <span className="font-bold ml-2">{data.revenue.toLocaleString('pt-MZ')} MZN</span>
                        </div>
                        <div className="text-red-600">
                          <span className="text-sm">Despesas:</span>
                          <span className="font-bold ml-2">{data.expenses.toLocaleString('pt-MZ')} MZN</span>
                        </div>
                        <div className="text-blue-600">
                          <span className="text-sm">Lucro:</span>
                          <span className="font-bold ml-2">{data.profit.toLocaleString('pt-MZ')} MZN</span>
                        </div>
                        <div className="text-purple-600">
                          <span className="text-sm">Transações:</span>
                          <span className="font-bold ml-2">{data.transactions}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Margem:</div>
                        <div className="font-bold">{Math.round((data.profit / data.revenue) * 100)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Análise de Membership */}
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Planos de Membership</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {membershipAnalysis.map((plan, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{plan.plan}</h4>
                          <Badge className="bg-blue-100 text-blue-800">{plan.members} membros</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Receita:</span>
                            <span className="font-bold ml-2">{plan.revenue.toLocaleString('pt-MZ')} MZN</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Retenção:</span>
                            <span className={`font-bold ml-2 ${plan.retention >= 90 ? 'text-green-600' : plan.retention >= 85 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {plan.retention}%
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${plan.retention >= 90 ? 'bg-green-500' : plan.retention >= 85 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${plan.retention}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tendências Semanais */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Semanal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {weeklyTrends.map((day, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="font-medium min-w-[80px]">{day.day}</div>
                        <div className="flex gap-4 text-sm">
                          <div className="text-green-600">
                            {day.revenue.toLocaleString('pt-MZ')} MZN
                          </div>
                          <div className="text-blue-600">
                            {day.transactions} vendas
                          </div>
                          <div className="text-purple-600">
                            Ticket: {day.avgTicket.toLocaleString('pt-MZ')} MZN
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Análise de Receitas por Categoria</span>
                  <Button variant="outline" size="sm" onClick={() => exportData('revenue')}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueCategories.map((category, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold">{category.category}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{category.percentage}%</Badge>
                          <Badge className={category.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {category.growth >= 0 ? '+' : ''}{category.growth}%
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Receita:</span>
                          <div className="font-bold text-lg">{category.amount.toLocaleString('pt-MZ')} MZN</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Transações:</span>
                          <div className="font-bold text-lg">{category.transactions}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Ticket Médio:</span>
                          <div className="font-bold text-lg">{Math.round(category.amount / category.transactions).toLocaleString('pt-MZ')} MZN</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-500 h-3 rounded-full"
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Análise de Despesas vs Orçamento</span>
                  <Button variant="outline" size="sm" onClick={() => exportData('expenses')}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseCategories.map((category, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold">{category.category}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{category.percentage}%</Badge>
                          <Badge className={
                            category.variance <= 0 ? 'bg-green-100 text-green-800' : 
                            category.variance <= 10 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }>
                            {category.variance >= 0 ? '+' : ''}{category.variance}%
                          </Badge>
                          {category.variance <= 0 ? 
                            <CheckCircle className="w-4 h-4 text-green-600" /> : 
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          }
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Gasto Real:</span>
                          <div className="font-bold text-lg">{category.amount.toLocaleString('pt-MZ')} MZN</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Orçamento:</span>
                          <div className="font-bold text-lg">{category.budget.toLocaleString('pt-MZ')} MZN</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Diferença:</span>
                          <div className={`font-bold text-lg ${category.variance <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {category.variance >= 0 ? '+' : ''}{(category.amount - category.budget).toLocaleString('pt-MZ')} MZN
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${category.variance <= 0 ? 'bg-green-500' : category.variance <= 10 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min((category.amount / category.budget) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Top Produtos/Serviços por Performance</span>
                  <Button variant="outline" size="sm" onClick={() => exportData('products')}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                            {index + 1}
                          </div>
                          <h3 className="font-semibold">{product.product}</h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-100 text-green-800">
                            +{product.growth}% crescimento
                          </Badge>
                          <Badge variant="outline">
                            {product.margin}% margem
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Vendas:</span>
                          <div className="font-bold text-lg">{product.sales}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Receita:</span>
                          <div className="font-bold text-lg">{product.revenue.toLocaleString('pt-MZ')} MZN</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Ticket Médio:</span>
                          <div className="font-bold text-lg">{Math.round(product.revenue / product.sales).toLocaleString('pt-MZ')} MZN</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Lucro Estimado:</span>
                          <div className="font-bold text-lg text-green-600">
                            {Math.round(product.revenue * (product.margin / 100)).toLocaleString('pt-MZ')} MZN
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Análise de Métodos de Pagamento</span>
                  <Button variant="outline" size="sm" onClick={() => exportData('payments')}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Dados
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paymentMethods.map((method, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold">{method.method}</h3>
                        </div>
                        <Badge variant="outline">{method.percentage}%</Badge>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <span className="text-gray-600">Volume:</span>
                          <div className="font-bold text-xl">{method.amount.toLocaleString('pt-MZ')} MZN</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Transações:</span>
                            <div className="font-bold">{method.transactions}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Ticket Médio:</span>
                            <div className="font-bold">{method.avgTicket.toLocaleString('pt-MZ')} MZN</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-blue-500 h-3 rounded-full"
                            style={{ width: `${method.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Insights de Pagamento:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Cartão é o método preferido (60% do volume)</li>
                    <li>• Transferências têm o maior ticket médio (2.328 MZN)</li>
                    <li>• M-Pesa representa oportunidade de crescimento</li>
                    <li>• Dinheiro ainda representa 24% das transações</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tendências de Crescimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-green-800">Receita Total</h4>
                          <p className="text-2xl font-bold text-green-600">+{salesData.growthRate}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-sm text-green-700 mt-2">Crescimento consistente nos últimos 6 meses</p>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-blue-800">Margem de Lucro</h4>
                          <p className="text-2xl font-bold text-blue-600">{salesData.profitMargin}%</p>
                        </div>
                        <Target className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-sm text-blue-700 mt-2">Margem saudável acima de 60%</p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-purple-800">Ticket Médio</h4>
                          <p className="text-2xl font-bold text-purple-600">{salesData.averageTicket.toLocaleString('pt-MZ')} MZN</p>
                        </div>
                        <Activity className="w-8 h-8 text-purple-600" />
                      </div>
                      <p className="text-sm text-purple-700 mt-2">Valor por transação em crescimento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alertas e Recomendações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border-l-4 border-green-500 bg-green-50">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h5 className="font-semibold text-green-800">Excelente Performance</h5>
                      </div>
                      <p className="text-sm text-green-700 mt-1">Suplementos com crescimento de 25.3%</p>
                    </div>
                    
                    <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <h5 className="font-semibold text-yellow-800">Atenção Necessária</h5>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">Salários 10% acima do orçamento</p>
                    </div>
                    
                    <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <h5 className="font-semibold text-blue-800">Oportunidade</h5>
                      </div>
                      <p className="text-sm text-blue-700 mt-1">Expandir ofertas de M-Pesa (apenas 4% do volume)</p>
                    </div>
                    
                    <div className="p-3 border-l-4 border-red-500 bg-red-50">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h5 className="font-semibold text-red-800">Monitorar</h5>
                      </div>
                      <p className="text-sm text-red-700 mt-1">Plano Estudante com alta taxa de churn (14.8%)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default SalesReports; 