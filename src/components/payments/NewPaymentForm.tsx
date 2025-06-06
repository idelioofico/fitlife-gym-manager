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
import { getMembers, createPayment, getPlans } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const paymentSchema = z.object({
  member_id: z.string().min(1, "Utente é obrigatório"),
  plan_id: z.string().min(1, "Plano é obrigatório"),
  amount: z.string().min(1, "Valor é obrigatório"),
  method: z.string().min(1, "Método é obrigatório"),
  payment_date: z.string().optional(),
  status: z.string().min(1, "Estado é obrigatório"),
});

interface NewPaymentFormProps {
  onSuccess: () => void;
}

const NewPaymentForm: React.FC<NewPaymentFormProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const paymentMethods = ["Mpesa", "Emola", "Card", "NetShop", "Cash"];
  const statuses = ["Pago", "Pendente"];
  
  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      member_id: "",
      plan_id: "",
      amount: "",
      method: "",
      payment_date: new Date().toISOString().split('T')[0],
      status: "Pago",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersData, plansData] = await Promise.all([
          getMembers(),
          getPlans()
        ]);
        
        // Only show active members
        const activeMembers = membersData.filter(member => member.status === 'Ativo');
        // Only show active plans
        const activePlans = plansData.filter(plan => plan.is_active);
        
        setMembers(activeMembers);
        setPlans(activePlans);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const onPlanChange = (planId: string) => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      form.setValue("amount", selectedPlan.price.toString());
    }
  };

  const onSubmit = async (data) => {
    try {
      const paymentData = {
        member_id: data.member_id,
        plan_id: data.plan_id,
        amount: parseFloat(data.amount),
        method: data.method,
        status: data.status,
        payment_date: data.payment_date || new Date().toISOString().split('T')[0],
      };
      
      console.log('Payment data:', paymentData);
      
      await createPayment(paymentData);
      
      toast({
        title: "Sucesso",
        description: "Pagamento registrado com sucesso.",
      });
      
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o pagamento.",
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
        
        <FormField
          control={form.control}
          name="plan_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plano</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  onPlanChange(value);
                }} 
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
                    <SelectItem key={plan.id} value={plan.id}>
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (MZN)</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pagamento</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um método" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do Pagamento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
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
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            Registrar Pagamento
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default NewPaymentForm;
