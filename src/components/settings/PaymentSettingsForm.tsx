
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
import { Switch } from "@/components/ui/switch";
import { getSettings, updateSettings } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const paymentSettingsSchema = z.object({
  mpesa_enabled: z.boolean().default(true),
  mpesa_number: z.string().optional(),
  emola_enabled: z.boolean().default(true),
  emola_number: z.string().optional(),
  netshop_enabled: z.boolean().default(true),
  netshop_id: z.string().optional(),
  cash_enabled: z.boolean().default(true),
  payment_reminder_days: z.string().transform(val => parseInt(val, 10)),
});

const PaymentSettingsForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const form = useForm<z.infer<typeof paymentSettingsSchema>>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      mpesa_enabled: true,
      mpesa_number: "",
      emola_enabled: true,
      emola_number: "",
      netshop_enabled: true,
      netshop_id: "",
      cash_enabled: true,
      payment_reminder_days: "5",
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getSettings();
        
        // Update form with settings
        if (settings) {
          form.reset({
            mpesa_enabled: settings.mpesa_enabled ?? true,
            mpesa_number: settings.mpesa_number || "",
            emola_enabled: settings.emola_enabled ?? true,
            emola_number: settings.emola_number || "",
            netshop_enabled: settings.netshop_enabled ?? true,
            netshop_id: settings.netshop_id || "",
            cash_enabled: settings.cash_enabled ?? true,
            payment_reminder_days: settings.payment_reminder_days?.toString() || "5",
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching settings:", error);
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [form]);

  const onSubmit = async (data) => {
    try {
      await updateSettings({
        ...data,
        updated_at: new Date().toISOString(),
      });
      
      toast({
        title: "Sucesso",
        description: "Configurações de pagamento atualizadas com sucesso.",
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel htmlFor="mpesa">M-Pesa</FormLabel>
            <FormField
              control={form.control}
              name="mpesa_enabled"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                      id="mpesa" 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="mpesa_number"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="Número M-Pesa" 
                    {...field} 
                    disabled={!form.watch("mpesa_enabled")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel htmlFor="emola">e-Mola</FormLabel>
            <FormField
              control={form.control}
              name="emola_enabled"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                      id="emola" 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="emola_number"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="Número e-Mola" 
                    {...field} 
                    disabled={!form.watch("emola_enabled")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel htmlFor="netshop">NetShop do Millennium BIM</FormLabel>
            <FormField
              control={form.control}
              name="netshop_enabled"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                      id="netshop" 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="netshop_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    placeholder="ID do Comerciante" 
                    {...field} 
                    disabled={!form.watch("netshop_enabled")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel htmlFor="cash">Pagamento em Dinheiro</FormLabel>
            <FormField
              control={form.control}
              name="cash_enabled"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Switch 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                      id="cash" 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <FormLabel htmlFor="payment-reminder">Dias de antecedência para lembrete</FormLabel>
          <FormField
            control={form.control}
            name="payment_reminder_days"
            render={({ field }) => (
              <FormItem>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="5">5 dias</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="10">10 dias</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex items-center justify-end space-x-2 pt-4">
          <Button type="submit">Salvar Alterações</Button>
        </div>
      </form>
    </Form>
  );
};

export default PaymentSettingsForm;
