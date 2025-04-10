
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { getSettings, updateSettings } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { TableRow } from '@/types/database.types';

// Schema definition for form validation
const paymentSettingsSchema = z.object({
  mpesa_enabled: z.boolean().default(true),
  mpesa_number: z.string().optional(),
  emola_enabled: z.boolean().default(true),
  emola_number: z.string().optional(),
  netshop_enabled: z.boolean().default(true),
  netshop_id: z.string().optional(),
  cash_enabled: z.boolean().default(true),
  payment_reminder_days: z.coerce.number().min(1).max(30).default(5),
});

interface PaymentSettingsFormProps {
  onSuccess?: () => void;
}

const PaymentSettingsForm = ({ onSuccess }: PaymentSettingsFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof paymentSettingsSchema>>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: {
      mpesa_enabled: true,
      mpesa_number: '',
      emola_enabled: true,
      emola_number: '',
      netshop_enabled: true,
      netshop_id: '',
      cash_enabled: true,
      payment_reminder_days: 5,
    },
  });
  
  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSettings();
      
      if (settings) {
        form.reset({
          mpesa_enabled: settings.mpesa_enabled ?? true,
          mpesa_number: settings.mpesa_number ?? '',
          emola_enabled: settings.emola_enabled ?? true,
          emola_number: settings.emola_number ?? '',
          netshop_enabled: settings.netshop_enabled ?? true,
          netshop_id: settings.netshop_id ?? '',
          cash_enabled: settings.cash_enabled ?? true,
          payment_reminder_days: settings.payment_reminder_days ?? 5,
        });
      }
    };
    
    fetchSettings();
  }, [form]);
  
  const onSubmit = async (data: z.infer<typeof paymentSettingsSchema>) => {
    try {
      await updateSettings(data as Partial<TableRow<"settings">>);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações de pagamento.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Métodos de Pagamento</h3>
          <div className="space-y-6">
            <div className="grid gap-6">
              {/* M-Pesa Settings */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base font-medium">M-Pesa</h4>
                    <p className="text-sm text-muted-foreground">Ativar pagamentos via M-Pesa</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="mpesa_enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {form.watch('mpesa_enabled') && (
                  <FormField
                    control={form.control}
                    name="mpesa_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número M-Pesa</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 841234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              {/* Emola Settings */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base font-medium">Emola</h4>
                    <p className="text-sm text-muted-foreground">Ativar pagamentos via Emola</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="emola_enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {form.watch('emola_enabled') && (
                  <FormField
                    control={form.control}
                    name="emola_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número Emola</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 861234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              {/* NetShop Settings */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-base font-medium">NetShop</h4>
                    <p className="text-sm text-muted-foreground">Ativar pagamentos via NetShop</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="netshop_enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                {form.watch('netshop_enabled') && (
                  <FormField
                    control={form.control}
                    name="netshop_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID da Conta NetShop</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: NSH123456" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              
              {/* Cash Settings */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-medium">Cash</h4>
                    <p className="text-sm text-muted-foreground">Ativar pagamentos em dinheiro</p>
                  </div>
                  <FormField
                    control={form.control}
                    name="cash_enabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Configuração de Lembretes</h3>
          <div className="border rounded-lg p-4">
            <FormField
              control={form.control}
              name="payment_reminder_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dias de Antecedência para Lembrete de Pagamento</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max="30" 
                      {...field} 
                      onChange={(e) => field.onChange(Number(e.target.value) || 5)}
                    />
                  </FormControl>
                  <FormDescription>
                    Número de dias antes do vencimento da mensalidade para enviar lembrete ao utente.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit">Salvar Configurações</Button>
        </div>
      </form>
    </Form>
  );
};

export default PaymentSettingsForm;
