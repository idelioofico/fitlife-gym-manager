import React, { useState, useEffect } from "react";
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
import { createPayment, getPlans } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TableRow } from "@/types/database.types";
import { Skeleton } from "@/components/ui/skeleton";

const renewalSchema = z.object({
  plan: z.string().min(1, "Plano é obrigatório"),
  plan_id: z.string().optional(),
  amount: z.string().min(1, "Valor é obrigatório"),
  method: z.string().min(1, "Método é obrigatório"),
  payment_date: z.string().optional(),
  status: z.string().min(1, "Estado é obrigatório"),
});

interface MemberRenewalProps {
  member: any;
  onSuccess: () => void;
}

const MemberRenewal: React.FC<MemberRenewalProps> = ({ member, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<TableRow<"plans">[]>([]);
  
  const paymentMethods = ["Mpesa", "Emola", "Card", "NetShop", "Cash"];
  const statuses = ["Pago", "Pendente"];
  
  const form = useForm<z.infer<typeof renewalSchema>>({
    resolver: zodResolver(renewalSchema),
    defaultValues: {
      plan: member.plan_name || "",
      plan_id: member.plan_id || "",
      amount: member.plan_price?.toString() || "",
      method: "",
      payment_date: new Date().toISOString().split('T')[0],
      status: "Pago",
    },
  });

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plansData = await getPlans();
        setPlans(plansData.filter(plan => plan.is_active));
        setLoading(false);
      } catch (error) {
        console.error("Error loading plans:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os planos.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };
    
    loadPlans();
  }, []);
  
  const getCurrentAmount = (planId: string) => {
    const selectedPlan = plans.find(p => p.id === planId);
    return selectedPlan ? selectedPlan.price.toString() : "";
  };
  
  const onPlanChange = (planId: string) => {
    const selectedPlan = plans.find(p => p.id === planId);
    if (selectedPlan) {
      form.setValue("amount", selectedPlan.price.toString());
      form.setValue("plan", selectedPlan.name);
      form.setValue("plan_id", selectedPlan.id);
    }
  };

  const onSubmit = async (data) => {
    try {
      const paymentData = {
        member_id: member.id,
        plan_id: parseInt(data.plan_id),
        amount: parseFloat(data.amount),
        method: data.method,
        status: data.status,
        payment_date: data.payment_date || new Date().toISOString().split('T')[0],
      };
      
      console.log('Payment data:', paymentData); // Debug log
      
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
        description: "Ocorreu um erro ao processar a renovação.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 text-center">
          <h3 className="text-lg font-medium">Renovar Plano para {member.name}</h3>
          <p className="text-sm text-muted-foreground">
            Selecione o plano e método de pagamento para renovar a assinatura
          </p>
        </div>
        
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
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
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
          <Button type="submit">
            Confirmar Renovação
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MemberRenewal;
