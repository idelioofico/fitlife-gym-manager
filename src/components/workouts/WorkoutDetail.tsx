
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getWorkoutDetails, getExercises, addExerciseToWorkout } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface WorkoutDetailProps {
  workoutId: string;
  onClose: () => void;
}

const WorkoutDetail: React.FC<WorkoutDetailProps> = ({ workoutId, onClose }) => {
  const { toast } = useToast();
  const [workout, setWorkout] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAddExerciseDialogOpen, setIsAddExerciseDialogOpen] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState("12");

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      if (!workoutId) return;
      
      try {
        const data = await getWorkoutDetails(workoutId);
        setWorkout(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching workout details:", error);
        setLoading(false);
      }
    };
    
    fetchWorkoutDetails();
  }, [workoutId]);

  const fetchExercisesForDialog = async () => {
    setExercisesLoading(true);
    try {
      const data = await getExercises();
      
      // Filter out exercises that are already in the workout
      const workoutExerciseIds = workout.workout_exercises.map(
        we => we.exercises.id
      );
      
      const availableExercises = data.filter(
        ex => !workoutExerciseIds.includes(ex.id)
      );
      
      setExercises(availableExercises);
      setFilteredExercises(availableExercises);
      setExercisesLoading(false);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setExercisesLoading(false);
    }
  };

  const handleOpenAddExercise = () => {
    fetchExercisesForDialog();
    setIsAddExerciseDialogOpen(true);
  };

  const handleExerciseSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredExercises(exercises);
      return;
    }
    
    const filtered = exercises.filter(
      ex => ex.name.toLowerCase().includes(term) || ex.muscle_group.toLowerCase().includes(term)
    );
    
    setFilteredExercises(filtered);
  };

  const handleSelectExercise = (exercise: any) => {
    setSelectedExercise(exercise === selectedExercise ? null : exercise);
  };

  const handleAddExercise = async () => {
    if (!selectedExercise) {
      toast({
        title: "Atenção",
        description: "Selecione um exercício primeiro.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await addExerciseToWorkout({
        workout_id: workoutId,
        exercise_id: selectedExercise.id,
        sets,
        reps
      });
      
      // Refetch workout details
      const updatedWorkout = await getWorkoutDetails(workoutId);
      setWorkout(updatedWorkout);
      
      // Close dialog and reset state
      setIsAddExerciseDialogOpen(false);
      setSelectedExercise(null);
      setSets(3);
      setReps("12");
    } catch (error) {
      console.error("Error adding exercise to workout:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar o exercício.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Carregando detalhes do treino...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold">{workout?.name}</h2>
          <p className="text-muted-foreground">{workout?.description}</p>
        </div>
        <Button onClick={handleOpenAddExercise}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Exercício
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exercícios</CardTitle>
          <CardDescription>Lista de exercícios incluídos neste treino</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workout?.workout_exercises?.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <Dumbbell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum exercício adicionado a este treino ainda</p>
              <Button className="mt-4" onClick={handleOpenAddExercise}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Exercício
              </Button>
            </div>
          ) : (
            workout?.workout_exercises?.map((workoutExercise) => (
              <div 
                key={workoutExercise.id} 
                className="border rounded-lg p-4 flex items-center"
              >
                <div className="bg-primary/10 rounded-full p-2 h-10 w-10 flex items-center justify-center mr-4">
                  <Dumbbell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{workoutExercise.exercises.name}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {workoutExercise.exercises.muscle_group}
                    </Badge>
                    {workoutExercise.exercises.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {workoutExercise.exercises.description}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-sm text-right">
                  <div className="font-medium">{workoutExercise.sets} séries</div>
                  <div className="text-muted-foreground">{workoutExercise.reps} reps</div>
                </div>
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
      
      {/* Dialog para adicionar exercício ao treino */}
      <Dialog open={isAddExerciseDialogOpen} onOpenChange={setIsAddExerciseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Exercício</DialogTitle>
            <DialogDescription>
              Selecione um exercício para adicionar ao treino {workout?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-4">
            <Input
              placeholder="Buscar exercício..."
              value={searchTerm}
              onChange={handleExerciseSearch}
              className="mb-4"
            />
            
            {exercisesLoading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Carregando exercícios...</p>
            ) : filteredExercises.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum exercício encontrado.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                {filteredExercises.map(exercise => (
                  <div 
                    key={exercise.id} 
                    onClick={() => handleSelectExercise(exercise)}
                    className={`p-2 rounded-md cursor-pointer transition-colors ${
                      selectedExercise?.id === exercise.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-xs opacity-80">{exercise.muscle_group}</div>
                  </div>
                ))}
              </div>
            )}
            
            {selectedExercise && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="text-sm font-medium">Séries</label>
                  <Input 
                    type="number" 
                    min="1"
                    value={sets}
                    onChange={(e) => setSets(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Repetições</label>
                  <Input 
                    placeholder="Ex: 10-12" 
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExerciseDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddExercise} disabled={!selectedExercise}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutDetail;
