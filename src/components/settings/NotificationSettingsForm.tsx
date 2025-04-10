
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
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getNotificationSettings, updateNotificationSettings } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const notificationSettingsSchema = z.object({
  email_notifications: z.boolean().default(true),
  sms_notifications: z.boolean().default(true),
  payment_reminders: z.boolean().default(true),
  class_reminders: z.boolean().default(true),
  marketing_messages: z.boolean().default(false),
});

const NotificationSettingsForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const form = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      email_notifications: true,
      sms_notifications: true,
      payment_reminders: true,
      class_reminders: true,
      marketing_messages: false,
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getNotificationSettings();
        
        // Update form with settings
        if (settings) {
          form.reset({
            email_notifications: settings.email_notifications ?? true,
            sms_notifications: settings.sms_notifications ?? true,
            payment_reminders: settings.payment_reminders ?? true,
            class_reminders: settings.class_reminders ?? true,
            marketing_messages: settings.marketing_messages ?? false,
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notification settings:", error);
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [form]);

  const onSubmit = async (data) => {
    try {
      await updateNotificationSettings({
        ...data,
        updated_at: new Date().toISOString(),
      });
      
      toast({
        title: "Sucesso",
        description: "Configurações de notificações atualizadas com sucesso.",
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
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Notificações por Email</Label>
            <p className="text-sm text-muted-foreground">Enviar lembretes e atualizações por email</p>
          </div>
          <FormField
            control={form.control}
            name="email_notifications"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                    id="email-notifications" 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sms-notifications">Notificações por SMS</Label>
            <p className="text-sm text-muted-foreground">Enviar lembretes e atualizações por SMS</p>
          </div>
          <FormField
            control={form.control}
            name="sms_notifications"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                    id="sms-notifications" 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="payment-reminders">Lembretes de Pagamento</Label>
            <p className="text-sm text-muted-foreground">Enviar lembretes de pagamento próximo</p>
          </div>
          <FormField
            control={form.control}
            name="payment_reminders"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                    id="payment-reminders" 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="class-reminders">Lembretes de Aulas</Label>
            <p className="text-sm text-muted-foreground">Enviar lembretes de aulas agendadas</p>
          </div>
          <FormField
            control={form.control}
            name="class_reminders"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                    id="class-reminders" 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="marketing-messages">Comunicações de Marketing</Label>
            <p className="text-sm text-muted-foreground">Enviar promoções e novidades aos clientes</p>
          </div>
          <FormField
            control={form.control}
            name="marketing_messages"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Switch 
                    checked={field.value} 
                    onCheckedChange={field.onChange} 
                    id="marketing-messages" 
                  />
                </FormControl>
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

export default NotificationSettingsForm;
