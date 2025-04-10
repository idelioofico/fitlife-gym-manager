
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
import { getMembers, createPayment } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const paymentSchema = z.object({
  member_id: z.string().min(1, "Utente é obrigatório"),
  plan: z.string().min(1, "Plano é obrigatório"),
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
  const [loading, setLoading] = useState(true);
  
  const plans = ["Premium", "Standard", "Básico"];
  const paymentMethods = ["Mpesa", "Emola", "Card", "NetShop", "Cash"];
  const statuses = ["Pago", "Pendente"];
  
  const getCurrentAmount = (plan: string) => {
    switch (plan) {
      case "Premium": return "2500";
      case "Standard": return "1800";
      case "Básico": return "1200";
      default: return "";
    }
  };
  
  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      member_id: "",
      plan: "",
      amount: "",
      method: "",
      payment_date: new Date().toISOString().split('T')[0],
      status: "Pago",
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

  const onPlanChange = (plan: string) => {
    form.setValue("amount", getCurrentAmount(plan));
  };

  const onSubmit = async (data) => {
    try {
      const paymentData = {
        member_id: data.member_id,
        amount: parseFloat(data.amount),
        plan: data.plan,
        method: data.method,
        status: data.status,
        payment_date: data.payment_date || new Date().toISOString().split('T')[0],
      };
      
      await createPayment(paymentData);
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
          name="plan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plano</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  onPlanChange(value);
                }} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {plans.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
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
