
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createPlan, updatePlan } from "@/lib/api";
import { TableRow } from "@/types/database.types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const planSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Preço deve ser maior ou igual a zero"),
  duration_days: z.coerce.number().min(1, "Duração deve ser de pelo menos 1 dia"),
  features: z.string().optional(),
  is_active: z.boolean().default(true),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface PlanFormProps {
  initialData?: TableRow<"plans"> | null;
  onSuccess: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const PlanForm: React.FC<PlanFormProps> = ({ 
  initialData,
  onSuccess,
  onCancel,
  isEditing = false
}) => {
  const { toast } = useToast();
  
  const parseFeaturesFromString = (features: any): string => {
    if (!features) return "";
    if (typeof features === "string") {
      try {
        return JSON.parse(features).join("\n");
      } catch {
        return features;
      }
    }
    if (Array.isArray(features)) {
      return features.join("\n");
    }
    return "";
  };

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      duration_days: initialData?.duration_days || 30,
      features: parseFeaturesFromString(initialData?.features),
      is_active: initialData?.is_active !== undefined ? initialData.is_active : true,
    },
  });

  const onSubmit = async (data: PlanFormValues) => {
    try {
      // Parse features from newline-separated string to array
      const features = data.features ? data.features.split("\n").filter(line => line.trim() !== "") : [];
      
      // Garantir que todos os campos obrigatórios estejam presentes
      const planData = {
        name: data.name,
        description: data.description || "",
        price: data.price,
        duration_days: data.duration_days,
        features,
        is_active: data.is_active
      };
      
      if (isEditing && initialData) {
        await updatePlan(initialData.id, planData);
      } else {
        await createPlan(planData);
      }
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o plano.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Premium" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição do plano" 
                      className="min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (MZN)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duração em Dias</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recursos (um por linha)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Recursos incluídos no plano, um por linha" 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Plano Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Defina se este plano está disponível para novos membros
                    </div>
                  </div>
                  <FormControl>
                    <Switch 
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button type="submit">
              {isEditing ? "Atualizar Plano" : "Criar Plano"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default PlanForm;
