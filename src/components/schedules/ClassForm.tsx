
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { createClass, updateClass } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const classSchema = z.object({
  title: z.string().min(1, "Nome da aula é obrigatório"),
  color: z.string().optional(),
  instructor: z.string().min(1, "Nome do instrutor é obrigatório"),
  day_of_week: z.string().min(1, "Dia da semana é obrigatório"),
  start_time: z.string().min(1, "Horário de início é obrigatório"),
  end_time: z.string().min(1, "Horário de término é obrigatório"),
  max_participants: z.number().int().positive().optional(),
});

interface ClassFormProps {
  onSuccess: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const ClassForm: React.FC<ClassFormProps> = ({ onSuccess, initialData, isEditing }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      title: initialData?.title || "",
      color: initialData?.color || "bg-primary",
      instructor: initialData?.instructor || "",
      day_of_week: initialData?.day_of_week || "",
      start_time: initialData?.start_time || "",
      end_time: initialData?.end_time || "",
      max_participants: initialData?.max_participants || 20,
    },
  });

  const onSubmit = async (data: z.infer<typeof classSchema>) => {
    try {
      setLoading(true);
      
      if (isEditing && initialData?.id) {
        await updateClass(initialData.id, data);
        toast({
          title: "Sucesso",
          description: "Aula atualizada com sucesso.",
        });
      } else {
        // Make sure we're passing all required fields for createClass
        await createClass({
          title: data.title,
          color: data.color || "bg-primary",
          instructor: data.instructor,
          day_of_week: data.day_of_week,
          start_time: data.start_time,
          end_time: data.end_time,
          max_participants: data.max_participants || 20,
        });
        toast({
          title: "Sucesso",
          description: "Aula criada com sucesso.",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o formulário.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Aula</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Yoga para iniciantes" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma cor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bg-primary">Azul</SelectItem>
                  <SelectItem value="bg-green-500">Verde</SelectItem>
                  <SelectItem value="bg-red-500">Vermelho</SelectItem>
                  <SelectItem value="bg-yellow-500">Amarelo</SelectItem>
                  <SelectItem value="bg-purple-500">Roxo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="instructor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instrutor</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Maria Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="day_of_week"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dia da Semana</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia da semana" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Segunda-feira">Segunda-feira</SelectItem>
                  <SelectItem value="Terça-feira">Terça-feira</SelectItem>
                  <SelectItem value="Quarta-feira">Quarta-feira</SelectItem>
                  <SelectItem value="Quinta-feira">Quinta-feira</SelectItem>
                  <SelectItem value="Sexta-feira">Sexta-feira</SelectItem>
                  <SelectItem value="Sábado">Sábado</SelectItem>
                  <SelectItem value="Domingo">Domingo</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário de Início</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário de Término</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="max_participants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número Máximo de Participantes</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="Ex: 20" 
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
          <Button type="submit" disabled={loading}>
            {isEditing ? "Atualizar Aula" : "Criar Aula"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClassForm;
