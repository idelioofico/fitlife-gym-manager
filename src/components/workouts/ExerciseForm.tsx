
import React from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createExercise } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const exerciseSchema = z.object({
  name: z.string().min(1, "Nome do exercício é obrigatório"),
  muscle_group: z.string().min(1, "Grupo muscular é obrigatório"),
  description: z.string().optional(),
});

interface ExerciseFormProps {
  onSuccess: () => void;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  
  const muscleGroups = [
    "Peito", 
    "Costas", 
    "Ombros", 
    "Bíceps", 
    "Tríceps", 
    "Antebraço",
    "Pernas", 
    "Quadríceps", 
    "Posteriores", 
    "Glúteos", 
    "Panturrilhas", 
    "Abdômen", 
    "Lombar", 
    "Cardio"
  ];
  
  const form = useForm<z.infer<typeof exerciseSchema>>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      muscle_group: "",
      description: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      await createExercise(data);
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
              <FormLabel>Nome do Exercício</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Supino reto com halteres" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="muscle_group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grupo Muscular</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o grupo muscular principal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {muscleGroups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  placeholder="Descrição do exercício e instruções de execução" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit">
            Adicionar Exercício
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ExerciseForm;
