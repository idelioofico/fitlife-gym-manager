import React, { useEffect, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createMember, updateMember, getPlans } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TableRow } from "@/types/database.types";

const memberSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  nr_cartao: z.string().min(3, "Número do cartão deve ter pelo menos 3 caracteres").max(20, "Número do cartão não pode ter mais de 20 caracteres").optional(),
  plan: z.string().min(1, "Plano é obrigatório"),
  status: z.string().min(1, "Estado é obrigatório"),
  join_date: z.string().optional(),
  end_date: z.string().optional(),
});

interface MemberFormProps {
  onSuccess: () => void;
  initialData?: any;
  isEditing?: boolean;
}

const MemberForm: React.FC<MemberFormProps> = ({ 
  onSuccess, 
  initialData = {}, 
  isEditing = false 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<TableRow<"plans">[]>([]);
  
  const statuses = [
    { value: "active", label: "Ativo" },
    { value: "pending", label: "Pendente" },
    { value: "inactive", label: "Inativo" },
    { value: "blocked", label: "Bloqueado" }
  ];
  
  const form = useForm<z.infer<typeof memberSchema>>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: initialData.name || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      nr_cartao: initialData.nr_cartao || "",
      plan: initialData.plan || "",
      status: initialData.status || "active",
      join_date: initialData.join_date ? new Date(initialData.join_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      end_date: initialData.end_date ? new Date(initialData.end_date).toISOString().split('T')[0] : "",
    },
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansData = await getPlans();
        // Only show active plans
        setPlans(plansData.filter(plan => plan.is_active));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os planos.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);

  const onSubmit = async (data) => {
    try {
      // Find the selected plan to get its ID
      const selectedPlan = plans.find(p => p.name === data.plan);
      
      // Transform the data to match backend expectations
      const memberData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        nr_cartao: data.nr_cartao,
        plan_id: selectedPlan?.id,
        status: data.status,
        join_date: data.join_date,
        end_date: data.end_date,
      };
      
      console.log('Submitting member data:', memberData);
      
      if (isEditing && initialData.id) {
        await updateMember(initialData.id, memberData);
      } else {
        await createMember(memberData);
      }
      
      toast({
        title: "Sucesso",
        description: isEditing ? "Membro atualizado com sucesso!" : "Membro criado com sucesso!",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao processar o formulário.",
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
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nr_cartao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número do Cartão</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Ex: GYM001, 12345, FIT-2024-001"
                  maxLength={20}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="plan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plano</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={loading}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "Carregando planos..." : "Selecione um plano"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.name}>
                        {plan.name} - {plan.price} MZN / {plan.duration_days} dias
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="join_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Início</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Término</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit">
            {isEditing ? "Atualizar" : "Criar"} Utente
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MemberForm;
