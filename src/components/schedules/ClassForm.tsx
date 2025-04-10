
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClass } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Schema definition for form validation
const classSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  instructor: z.string().min(1, 'Instrutor é obrigatório'),
  day_of_week: z.string().min(1, 'Dia da semana é obrigatório'),
  start_time: z.string().min(1, 'Hora de início é obrigatória'),
  end_time: z.string().min(1, 'Hora de término é obrigatória'),
  max_participants: z.coerce.number().optional(),
  color: z.string().optional(),
});

const days = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

const colors = [
  { name: 'Azul', value: 'bg-blue-500' },
  { name: 'Vermelho', value: 'bg-red-500' },
  { name: 'Verde', value: 'bg-green-500' },
  { name: 'Amarelo', value: 'bg-yellow-500' },
  { name: 'Roxo', value: 'bg-purple-500' },
  { name: 'Rosa', value: 'bg-pink-500' },
  { name: 'Laranja', value: 'bg-orange-500' },
  { name: 'Ciano', value: 'bg-cyan-500' },
  { name: 'Índigo', value: 'bg-indigo-500' },
  { name: 'Âmbar', value: 'bg-amber-500' },
  { name: 'Esmeralda', value: 'bg-emerald-500' },
  { name: 'Teal', value: 'bg-teal-500' },
];

interface ClassFormProps {
  onSuccess: () => void;
}

const ClassForm = ({ onSuccess }: ClassFormProps) => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof classSchema>>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      title: '',
      instructor: '',
      day_of_week: '',
      start_time: '',
      end_time: '',
      max_participants: 20, // Default value as a number, not string
      color: 'bg-primary',
    },
  });

  const onSubmit = async (data: z.infer<typeof classSchema>) => {
    try {
      await createClass(data);
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a aula.',
        variant: 'destructive',
      });
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
              <FormLabel>Título da Aula</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Yoga" {...field} />
              </FormControl>
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
                <Input placeholder="Ex: João Silva" {...field} />
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
                    <SelectValue placeholder="Selecione um dia" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora de Início</FormLabel>
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
                <FormLabel>Hora de Término</FormLabel>
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
              <FormLabel>Máximo de Participantes</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value) || 0)} />
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
                  <div className="grid grid-cols-2 gap-2 p-2">
                    {colors.map((color) => (
                      <div
                        key={color.value}
                        className={`${color.value} text-white px-3 py-2 rounded cursor-pointer text-center`}
                        onClick={() => {
                          form.setValue('color', color.value);
                          const selectElement = document.querySelector('[aria-expanded="true"]') as HTMLElement;
                          if (selectElement) {
                            selectElement.click();
                          }
                        }}
                      >
                        {color.name}
                      </div>
                    ))}
                  </div>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit">Criar Aula</Button>
        </div>
      </form>
    </Form>
  );
};

export default ClassForm;
