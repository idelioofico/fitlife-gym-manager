import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  DollarSign, 
  Activity, 
  UserCheck, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  CreditCard,
  ShoppingCart,
  Target,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  // Dados simulados para o dashboard
  const dashboardData = {
    totalMembers: 324,
    monthlyRevenue: 485000,
    activeMembers: 289,
    todayCheckins: 47,
    
    // Comparações com período anterior
    membersGrowth: 8.2,
    revenueGrowth: 12.5,
    activeMembersGrowth: 5.8,
    checkinsGrowth: -3.2,
    
    // Dados financeiros
    totalRevenue: 485000,
    averagePerMember: 1678,
    occupancyRate: 72.5,
    
    // Metas
    monthlyTarget: 500000,
    targetProgress: 97.0
  };

  const recentActivities = [
    {
      id: 1,
      type: 'member_joined',
      description: 'João Silva se inscreveu no plano Premium',
      time: '2 minutos atrás',
      icon: Users,
      color: 'text-green-600'
    },
    {
      id: 2,
      type: 'payment',
      description: 'Maria Santos pagou mensalidade - 1.500 MZN',
      time: '15 minutos atrás',
      icon: CreditCard,
      color: 'text-blue-600'
    },
    {
      id: 3,
      type: 'checkin',
      description: 'Pedro Costa fez check-in',
      time: '23 minutos atrás',
      icon: UserCheck,
      color: 'text-purple-600'
    },
    {
      id: 4,
      type: 'sale',
      description: 'Venda: Proteína Whey - 2.500 MZN',
      time: '1 hora atrás',
      icon: ShoppingCart,
      color: 'text-orange-600'
    },
    {
      id: 5,
      type: 'class',
      description: 'Aula de Yoga iniciada com 15 participantes',
      time: '2 horas atrás',
      icon: Activity,
      color: 'text-indigo-600'
    }
  ];

  const monthlyStats = [
    { month: 'Jan', revenue: 420000, members: 298 },
    { month: 'Fev', revenue: 445000, members: 305 },
    { month: 'Mar', revenue: 438000, members: 312 },
    { month: 'Abr', revenue: 465000, members: 318 },
    { month: 'Mai', revenue: 472000, members: 321 },
    { month: 'Jun', revenue: 485000, members: 324 }
  ];

  const topPlans = [
    { name: 'Premium Mensal', members: 156, revenue: 234000, percentage: 48.2 },
    { name: 'Básico Mensal', members: 98, revenue: 147000, percentage: 30.3 },
    { name: 'Anual Premium', members: 45, revenue: 67500, percentage: 13.9 },
    { name: 'Estudante', members: 25, revenue: 25000, percentage: 7.6 }
  ];

  const renderMetricCard = (title: string, value: string | number, growth: number, icon: React.ElementType, description: string) => {
    const isPositive = growth >= 0;
    const IconComponent = icon;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl font-bold">{value}</h3>
                <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">{Math.abs(growth)}%</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
            <div className={`p-3 rounded-full ${isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
              <IconComponent className={`w-6 h-6 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Hefel</h1>
            <p className="text-gray-600">Visão geral do ginásio - {new Date().toLocaleDateString('pt-MZ')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Hoje
            </Button>
            <Button>
              Ver Relatórios
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderMetricCard(
            "Total de Utentes",
            dashboardData.totalMembers,
            dashboardData.membersGrowth,
            Users,
            "vs. mês anterior"
          )}
          {renderMetricCard(
            "Receita Mensal",
            `${dashboardData.monthlyRevenue.toLocaleString('pt-MZ')} MZN`,
            dashboardData.revenueGrowth,
            DollarSign,
            "vs. mês anterior"
          )}
          {renderMetricCard(
            "Utentes Ativos",
            dashboardData.activeMembers,
            dashboardData.activeMembersGrowth,
            Activity,
            "frequentaram no último mês"
          )}
          {renderMetricCard(
            "Check-ins Hoje",
            dashboardData.todayCheckins,
            dashboardData.checkinsGrowth,
            UserCheck,
            "vs. ontem"
          )}
        </div>

        {/* Meta Mensal */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Meta Mensal</h3>
                <p className="text-sm text-gray-600">Progresso da receita mensal</p>
              </div>
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Atual: {dashboardData.totalRevenue.toLocaleString('pt-MZ')} MZN</span>
                <span>Meta: {dashboardData.monthlyTarget.toLocaleString('pt-MZ')} MZN</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${dashboardData.targetProgress}%` }}
                ></div>
              </div>
              <p className="text-right text-sm font-medium text-blue-600">
                {dashboardData.targetProgress}% concluído
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumo Financeiro */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData.totalRevenue.toLocaleString('pt-MZ')} MZN
                  </div>
                  <div className="text-sm text-gray-600">Receita Total</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData.averagePerMember.toLocaleString('pt-MZ')} MZN
                  </div>
                  <div className="text-sm text-gray-600">Média por Utente</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData.occupancyRate}%
                  </div>
                  <div className="text-sm text-gray-600">Taxa de Ocupação</div>
                </div>
              </div>

              {/* Evolução Mensal */}
              <div>
                <h4 className="font-semibold mb-3">Evolução Mensal</h4>
                <div className="space-y-2">
                  {monthlyStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <span className="font-medium">{stat.month}</span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-600">{stat.revenue.toLocaleString('pt-MZ')} MZN</span>
                        <span className="text-blue-600">{stat.members} membros</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Atividade Recente */}
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Ver Todas as Atividades
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Planos Mais Populares */}
        <Card>
          <CardHeader>
            <CardTitle>Planos Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {topPlans.map((plan, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{plan.name}</h4>
                    <Badge variant="outline">{plan.percentage}%</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>{plan.members} membros</div>
                    <div className="font-medium text-green-600">
                      {plan.revenue.toLocaleString('pt-MZ')} MZN
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas e Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas e Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">5 membros com mensalidade em atraso</p>
                  <p className="text-sm text-yellow-600">Valor total: 7.500 MZN</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">3 produtos com estoque baixo</p>
                  <p className="text-sm text-red-600">Proteína Whey, Creatina, Toalhas</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Meta de check-ins diários atingida</p>
                  <p className="text-sm text-green-600">47/45 check-ins hoje</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
