
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivityItem, ActivityType } from '@/components/dashboard/RecentActivityItem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, CreditCard, Calendar, TrendingUp, LogIn } from 'lucide-react';

// Simulated data
const activities = [
  {
    type: 'check-in' as ActivityType,
    user: { name: 'João Silva', avatar: '' },
    timestamp: '14:32',
    details: 'Realizou check-in no ginásio',
    status: 'success' as const,
  },
  {
    type: 'payment' as ActivityType,
    user: { name: 'Maria Costa', avatar: '' },
    timestamp: '13:15',
    details: 'Pagamento mensal de 2.500 MZN realizado',
    status: 'success' as const,
  },
  {
    type: 'membership' as ActivityType,
    user: { name: 'Pedro Machava', avatar: '' },
    timestamp: '11:42',
    details: 'Novo plano trimestral contratado',
    status: 'success' as const,
  },
  {
    type: 'booking' as ActivityType,
    user: { name: 'Ana Fonseca', avatar: '' },
    timestamp: '10:20',
    details: 'Agendou aula de Pilates para amanhã',
    status: 'success' as const,
  },
  {
    type: 'payment' as ActivityType,
    user: { name: 'Carlos Nuvunga', avatar: '' },
    timestamp: '09:45',
    details: 'Tentativa de pagamento falhou',
    status: 'failed' as const,
  },
];

const Dashboard = () => {
  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <div className="flex items-center mt-2 sm:mt-0">
            <Select defaultValue="today">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total de Utentes"
            value="248"
            trend={{ value: 12, isPositive: true }}
            icon={<Users className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Receita Mensal"
            value="65.750 MZN"
            trend={{ value: 8, isPositive: true }}
            icon={<CreditCard className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Aulas Agendadas"
            value="36"
            trend={{ value: 5, isPositive: true }}
            icon={<Calendar className="h-5 w-5 text-primary" />}
          />
          <StatsCard
            title="Check-ins Hoje"
            value="57"
            trend={{ value: 3, isPositive: false }}
            icon={<LogIn className="h-5 w-5 text-primary" />}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="analytics">Análise</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Desempenho do Mês</CardTitle>
                  <CardDescription>Visualização de métricas chave do período</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground ml-2">Gráficos de desempenho serão exibidos aqui</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                  <CardDescription>Últimas ações registadas no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {activities.map((activity, index) => (
                      <RecentActivityItem key={index} {...activity} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Aulas Mais Populares</CardTitle>
                  <CardDescription>Aulas com maior número de inscrições</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
                    <p className="text-muted-foreground">Dados de popularidade de aulas serão exibidos aqui</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Planos</CardTitle>
                  <CardDescription>Segmentação de clientes por plano</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
                    <p className="text-muted-foreground">Gráfico de distribuição de planos será exibido aqui</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Desempenho</CardTitle>
                <CardDescription>Dados detalhados para análise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">Ferramentas de análise avançada serão implementadas aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios</CardTitle>
                <CardDescription>Exportação e visualização de relatórios</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">Geração e download de relatórios serão implementados aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
