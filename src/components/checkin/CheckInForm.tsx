
import React, { useState, useEffect } from "react";
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
import { getMembers, recordCheckIn } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from '@/components/ui/badge';
import { CalendarClock } from 'lucide-react';

const checkInSchema = z.object({
  member_id: z.string().min(1, "Utente é obrigatório"),
  check_type: z.string().min(1, "Tipo de check-in é obrigatório"),
});

interface CheckInFormProps {
  onSuccess: () => void;
}

const CheckInForm: React.FC<CheckInFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  
  const form = useForm<z.infer<typeof checkInSchema>>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      member_id: "",
      check_type: "Entrada",
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

  const onMemberChange = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    setSelectedMember(member);
  };

  const onSubmit = async (data) => {
    try {
      await recordCheckIn(data);
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o check-in.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="member_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Utente</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  onMemberChange(value);
                }} 
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

        {selectedMember && (
          <div className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{selectedMember.name}</h3>
              <Badge variant={selectedMember.status === 'Ativo' ? 'default' : 'outline'}>
                {selectedMember.status}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Plano: {selectedMember.plan}</p>
              <p className="flex items-center gap-1 mt-1">
                <CalendarClock className="h-3.5 w-3.5" />
                Inscrito desde: {new Date(selectedMember.join_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="check_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Check-in</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Entrada">Entrada</SelectItem>
                  <SelectItem value="Saída">Saída</SelectItem>
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
          <Button type="submit" disabled={loading || !selectedMember}>
            Registrar Check-in
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CheckInForm;
