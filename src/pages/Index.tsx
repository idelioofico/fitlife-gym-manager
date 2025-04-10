
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Users, Calendar, CreditCard, Dumbbell, QrCode } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Animate cards when component mounts
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('animate-fade-in');
      }, index * 100);
    });
  }, []);

  return (
    <MainLayout title="FitLife - Sistema de Gestão de Ginásio">
      <section className="mb-12 mt-6">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Bem-vindo ao FitLife
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema completo para gestão moderna e eficiente do seu ginásio
          </p>
        </div>
      </section>

      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="feature-card opacity-0">
            <CardHeader>
              <div className="bg-primary/10 p-3 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Gestão de Utentes</CardTitle>
              <CardDescription>Administre os dados dos seus clientes com facilidade</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Registe novos membros, acompanhe o histórico de pagamentos e planos contratados, e gerencie avaliações físicas.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/members')}>Ver Utentes</Button>
            </CardFooter>
          </Card>

          <Card className="feature-card opacity-0">
            <CardHeader>
              <div className="bg-primary/10 p-3 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Controlo de Acesso</CardTitle>
              <CardDescription>Sistema avançado de entrada com QR Code</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Aumente a segurança com validação automática de pagamentos, restrições de horários e registo de entradas/saídas.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/checkin')}>Acessar Check-In</Button>
            </CardFooter>
          </Card>

          <Card className="feature-card opacity-0">
            <CardHeader>
              <div className="bg-primary/10 p-3 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Gestão Financeira</CardTitle>
              <CardDescription>Controlo completo das finanças do seu ginásio</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Gerencie mensalidades, controle cobranças automáticas e gere relatórios financeiros detalhados.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/payments')}>Ver Finanças</Button>
            </CardFooter>
          </Card>

          <Card className="feature-card opacity-0">
            <CardHeader>
              <div className="bg-primary/10 p-3 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Agendamentos</CardTitle>
              <CardDescription>Sistema integrado de marcações de aulas</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Organize aulas coletivas, agendamentos com personal trainers e controle a ocupação dos seus espaços.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/schedules')}>Ver Agenda</Button>
            </CardFooter>
          </Card>

          <Card className="feature-card opacity-0">
            <CardHeader>
              <div className="bg-primary/10 p-3 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Treinos Personalizados</CardTitle>
              <CardDescription>Gerencie treinos e evolução dos clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Crie planos de treino personalizados, acompanhe a evolução do cliente e mantenha uma biblioteca de exercícios.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/workouts')}>Ver Treinos</Button>
            </CardFooter>
          </Card>

          <Card className="feature-card opacity-0">
            <CardHeader>
              <div className="bg-primary/10 p-3 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Dashboard & Relatórios</CardTitle>
              <CardDescription>Obtenha insights valiosos para o seu negócio</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Visualize estatísticas importantes, acompanhe o desempenho do ginásio e tome decisões estratégicas.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/dashboard')}>Ver Dashboard</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="text-center mb-8">
        <Button size="lg" variant="default" onClick={() => navigate('/dashboard')} className="animate-pulse-gentle">
          Aceder à Plataforma
        </Button>
      </section>
    </MainLayout>
  );
};

export default Index;
