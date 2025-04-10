
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dumbbell, Plus, Search, User } from 'lucide-react';

const ExerciseCard = ({ name, sets, reps, muscleGroup }) => (
  <div className="border rounded-lg p-4 flex items-center">
    <div className="bg-primary/10 rounded-full p-2 h-10 w-10 flex items-center justify-center mr-4">
      <Dumbbell className="h-5 w-5 text-primary" />
    </div>
    <div className="flex-1">
      <h4 className="font-medium text-sm">{name}</h4>
      <p className="text-xs text-muted-foreground">{muscleGroup}</p>
    </div>
    <div className="text-sm text-right">
      <div className="font-medium">{sets} séries</div>
      <div className="text-muted-foreground">{reps} reps</div>
    </div>
  </div>
);

const ClientCard = ({ name, avatar, lastSession, nextSession, progress }) => (
  <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center mb-3">
      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mr-3">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full rounded-full" />
        ) : (
          <User className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div>
        <h4 className="font-medium">{name}</h4>
        <p className="text-xs text-muted-foreground">Última sessão: {lastSession}</p>
      </div>
    </div>
    <div className="flex justify-between text-xs text-muted-foreground mb-2">
      <span>Próxima sessão: {nextSession}</span>
      <span>Progresso: {progress}</span>
    </div>
    <Button variant="outline" size="sm" className="w-full mt-2">
      Ver Treinos
    </Button>
  </div>
);

const Workouts = () => {
  return (
    <MainLayout title="Treinos">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Gestão de Treinos</h2>
          <div className="flex items-center mt-2 sm:mt-0">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Treino
            </Button>
          </div>
        </div>

        <Tabs defaultValue="plans" className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">Planos de Treino</TabsTrigger>
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="exercises">Exercícios</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans">
            <Card>
              <CardHeader>
                <CardTitle>Treino A - Superior</CardTitle>
                <CardDescription>Treino focado em peito, costas e braços</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ExerciseCard 
                  name="Supino reto com halteres" 
                  sets="4" 
                  reps="10-12"
                  muscleGroup="Peito" 
                />
                <ExerciseCard 
                  name="Puxada alta" 
                  sets="4" 
                  reps="12"
                  muscleGroup="Costas" 
                />
                <ExerciseCard 
                  name="Desenvolvimento com halteres" 
                  sets="3" 
                  reps="10-12"
                  muscleGroup="Ombros" 
                />
                <ExerciseCard 
                  name="Rosca direta" 
                  sets="3" 
                  reps="12"
                  muscleGroup="Bíceps" 
                />
                <ExerciseCard 
                  name="Tríceps na polia" 
                  sets="3" 
                  reps="12-15"
                  muscleGroup="Tríceps" 
                />
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Exercício
                </Button>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Treino B - Inferior</CardTitle>
                <CardDescription>Treino focado em pernas e core</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ExerciseCard 
                  name="Agachamento com barra" 
                  sets="4" 
                  reps="10-12"
                  muscleGroup="Quadríceps" 
                />
                <ExerciseCard 
                  name="Leg press" 
                  sets="3" 
                  reps="12-15"
                  muscleGroup="Quadríceps/Glúteos" 
                />
                <ExerciseCard 
                  name="Cadeira extensora" 
                  sets="3" 
                  reps="12"
                  muscleGroup="Quadríceps" 
                />
                <ExerciseCard 
                  name="Mesa flexora" 
                  sets="3" 
                  reps="12"
                  muscleGroup="Posteriores" 
                />
                <ExerciseCard 
                  name="Abdominal na máquina" 
                  sets="3" 
                  reps="15-20"
                  muscleGroup="Abdómen" 
                />
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Exercício
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Clientes</CardTitle>
                <CardDescription>Lista de clientes com treinos personalizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Pesquisar cliente..."
                    className="pl-8 w-full"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ClientCard 
                    name="João Silva" 
                    lastSession="03/04/2025" 
                    nextSession="10/04/2025" 
                    progress="75%" 
                  />
                  <ClientCard 
                    name="Maria Costa" 
                    lastSession="05/04/2025" 
                    nextSession="12/04/2025" 
                    progress="60%" 
                  />
                  <ClientCard 
                    name="Pedro Machava" 
                    lastSession="02/04/2025" 
                    nextSession="09/04/2025" 
                    progress="90%" 
                  />
                  <ClientCard 
                    name="Ana Maria" 
                    lastSession="01/04/2025" 
                    nextSession="08/04/2025" 
                    progress="40%" 
                  />
                  <ClientCard 
                    name="Carlos Nuvunga" 
                    lastSession="04/04/2025" 
                    nextSession="11/04/2025" 
                    progress="65%" 
                  />
                  <ClientCard 
                    name="Sofia Langa" 
                    lastSession="31/03/2025" 
                    nextSession="07/04/2025" 
                    progress="85%" 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="exercises">
            <Card>
              <CardHeader>
                <CardTitle>Biblioteca de Exercícios</CardTitle>
                <CardDescription>Catálogo completo de exercícios disponíveis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Pesquisar exercício..."
                    className="pl-8 w-full"
                  />
                </div>
                
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <Dumbbell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-medium">Biblioteca de Exercícios</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                    A biblioteca completa de exercícios será implementada aqui, incluindo vídeos demonstrativos
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Exercício
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Workouts;
