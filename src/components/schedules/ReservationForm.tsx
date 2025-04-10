
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createReservation, getMembers } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const reservationSchema = z.object({
  member_id: z.string().min(1, "Utente é obrigatório"),
  class_id: z.string().min(1, "Aula é obrigatória"),
});

interface ReservationFormProps {
  onSuccess: () => void;
  currentClass: any;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ 
  onSuccess, 
  currentClass 
}) => {
  const { toast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const form = useForm<z.infer<typeof reservationSchema>>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      member_id: "",
      class_id: currentClass?.id || "",
    },
  });

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getMembers();
        // Only show active members
        const activeMembers = data.filter(member => member.status === 'Ativo');
        setMembers(activeMembers);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching members:", error);
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, []);

  const onSubmit = async (data) => {
    try {
      await createReservation(data);
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a reserva.",
        variant: "destructive",
      });
    }
  };

  const formatClassInfo = () => {
    if (!currentClass) return "";
    return `${currentClass.title} - ${currentClass.day_of_week}, ${format(new Date(`1970-01-01T${currentClass.start_time}`), 'HH:mm')} - ${format(new Date(`1970-01-01T${currentClass.end_time}`), 'HH:mm')}`;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 mb-4">
          <h3 className="text-lg font-medium">Reservar Aula</h3>
          <p className="text-sm text-muted-foreground">
            {currentClass ? formatClassInfo() : "Selecione um utente para reservar esta aula"}
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="class_id"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <input type="hidden" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="member_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Utente</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={loading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Carregando utentes..." : "Selecione um utente"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
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
          <Button type="submit" disabled={loading}>
            Confirmar Reserva
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ReservationForm;
