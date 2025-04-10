
import React from "react";
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
import { createPayment } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const renewalSchema = z.object({
  plan: z.string().min(1, "Plano é obrigatório"),
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
  
  const form = useForm<z.infer<typeof renewalSchema>>({
    resolver: zodResolver(renewalSchema),
    defaultValues: {
      plan: member.plan || "",
      amount: getCurrentAmount(member.plan || ""),
      method: "",
      payment_date: new Date().toISOString().split('T')[0],
      status: "Pago",
    },
  });

  const onPlanChange = (plan: string) => {
    form.setValue("amount", getCurrentAmount(plan));
  };

  const onSubmit = async (data) => {
    try {
      const paymentData = {
        member_id: member.id,
        amount: parseFloat(data.amount),
        plan: data.plan,
        method: data.method,
        status: data.status,
        payment_date: data.payment_date || new Date().toISOString().split('T')[0],
      };
      
      await createPayment(paymentData);
      
      // If payment was successful, we update the member's plan too
      // This would typically be done automatically through triggers in a production app
      // but we'll skip that complexity for now
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
          <Button type="submit">
            Confirmar Renovação
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MemberRenewal;
