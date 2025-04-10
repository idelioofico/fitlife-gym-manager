
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dumbbell, Plus, Search, User } from 'lucide-react';
import { getWorkouts, getExercises, getMemberWorkouts } from '@/lib/api';
import WorkoutForm from '@/components/workouts/WorkoutForm';
import ExerciseForm from '@/components/workouts/ExerciseForm';
import WorkoutDetail from '@/components/workouts/WorkoutDetail';

interface ExerciseCardProps {
  name: string;
  sets: string;
  reps: string;
  muscleGroup: string;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ name, sets, reps, muscleGroup }) => (
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

interface ClientCardProps {
  name: string;
  avatar: string;
  lastSession: string;
  nextSession: string;
  progress: string;
  onViewWorkouts: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ 
  name, 
  avatar, 
  lastSession, 
  nextSession, 
  progress, 
  onViewWorkouts 
}) => (
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
    <Button variant="outline" size="sm" className="w-full mt-2" onClick={onViewWorkouts}>
      Ver Treinos
    </Button>
  </div>
);

interface ClientWorkoutProps {
  name: string;
  workouts: any[];
  onClose: () => void;
}

const ClientWorkouts: React.FC<ClientWorkoutProps> = ({ name, workouts, onClose }) => {
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  
  if (!workouts) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold">Treinos de {name}</h2>
          <p className="text-muted-foreground">Visualize os planos de treino atribuídos</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Treinos Atribuídos</CardTitle>
          <CardDescription>Lista de todos os treinos programados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workouts.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Este utente não possui treinos atribuídos</p>
            </div>
          ) : (
            workouts.map(workout => (
              <div 
                key={workout.id} 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedWorkout === workout.id ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedWorkout(
                  selectedWorkout === workout.id ? null : workout.id
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{workout.workouts.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {workout.workouts.description}
                    </p>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">Progresso: {workout.progress}%</div>
                    <div className="text-xs text-muted-foreground">
                      Atribuído em: {new Date(workout.assigned_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                {selectedWorkout === workout.id && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm mb-2">Detalhes do treino</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Ver Exercícios Completos
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
};

const Workouts = () => {
  const [isNewWorkoutDialogOpen, setIsNewWorkoutDialogOpen] = useState(false);
  const [isNewExerciseDialogOpen, setIsNewExerciseDialogOpen] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState({
    workouts: true,
    exercises: true,
    clients: false
  });
  const [clientSearch, setClientSearch] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [sheetContent, setSheetContent] = useState<{
    type: string;
    id?: string;
    data?: any;
  } | null>(null);

  // Mock data for clients
  const clients = [
    { id: 1, name: "João Silva", avatar: "", lastSession: "03/04/2025", nextSession: "10/04/2025", progress: "75%" },
    { id: 2, name: "Maria Costa", avatar: "", lastSession: "05/04/2025", nextSession: "12/04/2025", progress: "60%" },
    { id: 3, name: "Pedro Machava", avatar: "", lastSession: "02/04/2025", nextSession: "09/04/2025", progress: "90%" },
    { id: 4, name: "Ana Maria", avatar: "", lastSession: "01/04/2025", nextSession: "08/04/2025", progress: "40%" },
    { id: 5, name: "Carlos Nuvunga", avatar: "", lastSession: "04/04/2025", nextSession: "11/04/2025", progress: "65%" },
    { id: 6, name: "Sofia Langa", avatar: "", lastSession: "31/03/2025", nextSession: "07/04/2025", progress: "85%" },
  ];

  useEffect(() => {
    fetchWorkouts();
    fetchExercises();
  }, []);

  const fetchWorkouts = async () => {
    setLoading(prev => ({ ...prev, workouts: true }));
    try {
      const data = await getWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(prev => ({ ...prev, workouts: false }));
    }
  };

  const fetchExercises = async () => {
    setLoading(prev => ({ ...prev, exercises: true }));
    try {
      const data = await getExercises();
      setExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(prev => ({ ...prev, exercises: false }));
    }
  };

  const handleNewWorkoutSuccess = () => {
    setIsNewWorkoutDialogOpen(false);
    fetchWorkouts();
  };

  const handleNewExerciseSuccess = () => {
    setIsNewExerciseDialogOpen(false);
    fetchExercises();
  };

  const handleViewWorkout = (workoutId: string) => {
    setSheetContent({
      type: 'workout',
      id: workoutId
    });
  };

  const handleViewClientWorkouts = async (client) => {
    setLoading(prev => ({ ...prev, clients: true }));
    try {
      // In a real app, we would call an API with the client's ID
      // For mock data, we'll just simulate a delay
      const workouts = await getMemberWorkouts(client.id);
      
      setSheetContent({
        type: 'client',
        data: {
          client: client,
          workouts: workouts
        }
      });
    } catch (error) {
      console.error("Error fetching client workouts:", error);
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  };

  const handleCloseSheet = () => {
    setSheetContent(null);
  };

  const renderSheetContent = () => {
    if (!sheetContent) return null;
    
    switch (sheetContent.type) {
      case 'workout':
        return (
          <>
            <SheetHeader>
              <SheetTitle>Detalhes do Treino</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <WorkoutDetail 
                workoutId={sheetContent.id} 
                onClose={handleCloseSheet} 
              />
            </div>
          </>
        );
      case 'client':
        const { client, workouts } = sheetContent.data || {};
        return (
          <>
            <SheetHeader>
              <SheetTitle>Treinos do Cliente</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <ClientWorkouts 
                name={client?.name} 
                workouts={workouts || []} 
                onClose={handleCloseSheet} 
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // Filter exercises based on search
  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()) || 
    ex.muscle_group.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  // Filter clients based on search
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  return (
    <MainLayout title="Treinos">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Gestão de Treinos</h2>
          <div className="flex items-center mt-2 sm:mt-0">
            <Button onClick={() => setIsNewWorkoutDialogOpen(true)}>
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
            {loading.workouts ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">Carregando treinos...</p>
              </div>
            ) : workouts.length === 0 ? (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <Dumbbell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium">Nenhum treino cadastrado</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                      Comece adicionando um novo treino para seus clientes
                    </p>
                    <Button onClick={() => setIsNewWorkoutDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Treino
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workouts.map(workout => (
                  <Card key={workout.id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>{workout.name}</CardTitle>
                      <CardDescription>{workout.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        onClick={() => handleViewWorkout(workout.id)}
                        className="w-full"
                      >
                        Ver Detalhes do Treino
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {loading.clients ? (
                    <div className="col-span-3 text-center py-12">
                      <p className="text-sm text-muted-foreground">Carregando clientes...</p>
                    </div>
                  ) : filteredClients.length === 0 ? (
                    <div className="col-span-3 text-center py-12">
                      <p className="text-sm text-muted-foreground">Nenhum cliente encontrado</p>
                    </div>
                  ) : (
                    filteredClients.map(client => (
                      <ClientCard 
                        key={client.id}
                        name={client.name} 
                        avatar={client.avatar}
                        lastSession={client.lastSession} 
                        nextSession={client.nextSession} 
                        progress={client.progress}
                        onViewWorkouts={() => handleViewClientWorkouts(client)}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="exercises">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <CardTitle>Biblioteca de Exercícios</CardTitle>
                  <CardDescription>Catálogo completo de exercícios disponíveis</CardDescription>
                </div>
                <Button 
                  className="mt-4 sm:mt-0" 
                  onClick={() => setIsNewExerciseDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Exercício
                </Button>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Pesquisar exercício..."
                    className="pl-8 w-full"
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                  />
                </div>
                
                {loading.exercises ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground">Carregando exercícios...</p>
                  </div>
                ) : filteredExercises.length === 0 ? (
                  <div className="text-center py-12 border border-dashed rounded-lg">
                    <Dumbbell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium">Nenhum exercício encontrado</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                      Adicione exercícios à biblioteca para criar treinos
                    </p>
                    <Button onClick={() => setIsNewExerciseDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Exercício
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredExercises.map(exercise => (
                      <div key={exercise.id} className="border rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="bg-primary/10 rounded-full p-2 h-10 w-10 flex items-center justify-center mr-4">
                            <Dumbbell className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{exercise.name}</h4>
                            <p className="text-sm text-muted-foreground">{exercise.muscle_group}</p>
                          </div>
                        </div>
                        {exercise.description && (
                          <p className="text-sm text-muted-foreground mt-2 pl-14">
                            {exercise.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog for creating new workout */}
      <Dialog open={isNewWorkoutDialogOpen} onOpenChange={setIsNewWorkoutDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Novo Treino</DialogTitle>
          </DialogHeader>
          <WorkoutForm onSuccess={handleNewWorkoutSuccess} />
        </DialogContent>
      </Dialog>
      
      {/* Dialog for adding new exercise */}
      <Dialog open={isNewExerciseDialogOpen} onOpenChange={setIsNewExerciseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Exercício</DialogTitle>
          </DialogHeader>
          <ExerciseForm onSuccess={handleNewExerciseSuccess} />
        </DialogContent>
      </Dialog>
      
      {/* Sheet for displaying workout/client details */}
      <Sheet 
        open={!!sheetContent} 
        onOpenChange={(open) => !open && setSheetContent(null)}
      >
        <SheetContent className="overflow-y-auto w-full sm:max-w-xl">
          {renderSheetContent()}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
};

export default Workouts;
