
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
import { updateSetting } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const paymentSettingsSchema = z.object({
  stripe_secret_key: z.string().optional(),
  stripe_publishable_key: z.string().optional(),
});

interface PaymentSettingsFormProps {
  initialData: any;
  onSuccess: () => void;
}

const PaymentSettingsForm: React.FC<PaymentSettingsFormProps> = ({ initialData, onSuccess }) => {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof paymentSettingsSchema>>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      stripe_secret_key: initialData?.stripe_secret_key || "",
      stripe_publishable_key: initialData?.stripe_publishable_key || "",
    },
  });

  const onSubmit = async (formData: z.infer<typeof paymentSettingsSchema>) => {
    try {
      await updateSetting("1", formData);
      toast({
        title: "Sucesso",
        description: "Configurações de pagamento atualizadas com sucesso.",
      });
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar as configurações de pagamento.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="stripe_secret_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stripe Secret Key</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="stripe_publishable_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stripe Publishable Key</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
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
            Salvar
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PaymentSettingsForm;
