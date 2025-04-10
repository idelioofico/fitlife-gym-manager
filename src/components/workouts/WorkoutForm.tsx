
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { createWorkout, getExercises } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Plus, X } from "lucide-react";

const workoutSchema = z.object({
  name: z.string().min(1, "Nome do treino é obrigatório"),
  description: z.string().optional(),
});

interface ExerciseItem {
  exercise_id: string;
  name: string;
  muscle_group: string;
  sets: number;
  reps: string;
}

interface WorkoutFormProps {
  onSuccess: () => void;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercises, setSelectedExercises] = useState<ExerciseItem[]>([]);
  const [activeExerciseId, setActiveExerciseId] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState("12");
  
  const form = useForm<z.infer<typeof workoutSchema>>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await getExercises();
        setExercises(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exercises:", error);
        setLoading(false);
      }
    };
    
    fetchExercises();
  }, []);

  const handleExerciseSelect = (id: string) => {
    setActiveExerciseId(id);
  };

  const handleAddExercise = () => {
    if (!activeExerciseId) {
      toast({
        title: "Atenção",
        description: "Selecione um exercício primeiro.",
        variant: "destructive",
      });
      return;
    }
    
    const selectedExercise = exercises.find(ex => ex.id === activeExerciseId);
    
    if (selectedExercise) {
      const newExerciseItem: ExerciseItem = {
        exercise_id: selectedExercise.id,
        name: selectedExercise.name,
        muscle_group: selectedExercise.muscle_group,
        sets: sets,
        reps: reps,
      };
      
      setSelectedExercises([...selectedExercises, newExerciseItem]);
      setActiveExerciseId("");
    }
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises.splice(index, 1);
    setSelectedExercises(updatedExercises);
  };

  const onSubmit = async (data) => {
    if (selectedExercises.length === 0) {
      toast({
        title: "Atenção",
        description: "Adicione pelo menos um exercício ao treino.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createWorkout(data, selectedExercises);
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o formulário.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Treino</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Treino A - Superior" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Ex: Treino focado em peito, costas e braços" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <h3 className="text-md font-medium mb-2">Exercícios</h3>
          
          <div className="border rounded-lg p-4 space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-sm font-medium">Selecione um Exercício</label>
                  {loading ? (
                    <p className="text-sm text-muted-foreground">Carregando exercícios...</p>
                  ) : (
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
                      {exercises.map(ex => (
                        <div 
                          key={ex.id} 
                          onClick={() => handleExerciseSelect(ex.id)}
                          className={`px-2 py-1.5 text-sm rounded cursor-pointer transition-colors ${
                            activeExerciseId === ex.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="font-medium">{ex.name}</div>
                          <div className="text-xs opacity-80">{ex.muscle_group}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
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
                
                <Button 
                  type="button" 
                  onClick={handleAddExercise}
                  disabled={!activeExerciseId || loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Exercício
                </Button>
              </div>
              
              {selectedExercises.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Exercícios Adicionados</h4>
                  <div className="space-y-2">
                    {selectedExercises.map((ex, idx) => (
                      <div key={idx} className="flex items-center justify-between border rounded-lg p-2.5">
                        <div className="flex items-center">
                          <div className="bg-primary/10 rounded-full p-1.5 h-8 w-8 flex items-center justify-center mr-3">
                            <Dumbbell className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{ex.name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {ex.muscle_group}
                              </Badge>
                              <span>{ex.sets} séries</span>
                              <span>{ex.reps} reps</span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={() => handleRemoveExercise(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit">
            Criar Treino
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WorkoutForm;
