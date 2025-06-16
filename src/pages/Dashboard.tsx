import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { RecentActivityItem, ActivityType } from '@/components/dashboard/RecentActivityItem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, CreditCard, Calendar, TrendingUp, LogIn } from 'lucide-react';
import { getDashboardStats, getRecentCheckIns, getPayments } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  todayCheckins: number;
  monthlyRevenue: number;
  comparisons: {
    totalMembers: { value: number; isPositive: boolean };
    activeMembers: { value: number; isPositive: boolean };
    todayCheckins: { value: number; isPositive: boolean };
    monthlyRevenue: { value: number; isPositive: boolean };
  };
}

const Dashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, checkInsData, paymentsData] = await Promise.all([
        getDashboardStats(),
        getRecentCheckIns(),
        getPayments()
      ]);

      setStats(statsData);

      // Combine check-ins and payments into recent activities
      const activities = [
        ...checkInsData.map(checkIn => ({
          type: 'check-in' as ActivityType,
          user: { name: checkIn.member_name, avatar: '' },
          timestamp: format(new Date(checkIn.check_time), 'HH:mm'),
          details: `${checkIn.check_type} registrado`,
          status: 'success' as const,
        })),
        ...paymentsData.slice(0, 5).map(payment => ({
          type: 'payment' as ActivityType,
          user: { name: payment.member_name, avatar: '' },
          timestamp: format(new Date(payment.payment_date), 'HH:mm'),
          details: `Pagamento de ${payment.amount.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })} realizado`,
          status: payment.status === 'Pago' ? 'success' : 'failed',
        }))
      ].sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return timeB - timeA;
      }).slice(0, 5);

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            value={stats?.totalMembers.toString() || "0"}
            trend={stats?.comparisons.totalMembers || { value: 0, isPositive: true }}
            icon={<Users className="h-5 w-5 text-primary" />}
            loading={loading}
          />
          <StatsCard
            title="Receita Mensal"
            value={stats?.monthlyRevenue.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' }) || "0 MZN"}
            trend={stats?.comparisons.monthlyRevenue || { value: 0, isPositive: true }}
            icon={<CreditCard className="h-5 w-5 text-primary" />}
            loading={loading}
          />
          <StatsCard
            title="Utentes Ativos"
            value={stats?.activeMembers.toString() || "0"}
            trend={stats?.comparisons.activeMembers || { value: 0, isPositive: true }}
            icon={<Calendar className="h-5 w-5 text-primary" />}
            loading={loading}
          />
          <StatsCard
            title="Check-ins Hoje"
            value={stats?.todayCheckins.toString() || "0"}
            trend={stats?.comparisons.todayCheckins || { value: 0, isPositive: true }}
            icon={<LogIn className="h-5 w-5 text-primary" />}
            loading={loading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>Últimas atividades registradas no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Carregando atividades...</p>
                  </div>
                ) : recentActivities.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
                  </div>
                ) : (
                  recentActivities.map((activity, index) => (
                    <RecentActivityItem
                      key={index}
                      type={activity.type}
                      user={activity.user}
                      timestamp={activity.timestamp}
                      details={activity.details}
                      status={activity.status}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
              <CardDescription>Visão geral das finanças do ginásio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Receita Total</span>
                  <span className="font-medium">
                    {stats?.monthlyRevenue.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' }) || "0 MZN"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Média por Utente</span>
                  <span className="font-medium">
                    {stats?.activeMembers ? 
                      (stats.monthlyRevenue / stats.activeMembers).toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' }) : 
                      "0 MZN"
                    }
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Taxa de Ocupação</span>
                  <span className="font-medium">
                    {stats?.activeMembers && stats?.totalMembers ? 
                      `${Math.round((stats.activeMembers / stats.totalMembers) * 100)}%` : 
                      "0%"
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
