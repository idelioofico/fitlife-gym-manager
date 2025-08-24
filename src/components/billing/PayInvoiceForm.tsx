import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ReceiptPDFButton } from './ReceiptPDF';
import { Invoice, Receipt } from '@/types/billing';
import { env } from '@/config/env';
import billingService from '@/services/billingService';
import { CreditCard, AlertCircle } from 'lucide-react';

const payInvoiceSchema = z.object({
  valor_pago: z.string().min(0, "Valor não pode ser negativo"),
  metodo_pagamento: z.string().min(1, "Método é obrigatório"),
  referencia_pagamento: z.string().optional(),
  descricao: z.string().optional(),
  aplicar_creditos: z.boolean().default(true),
});

interface PayInvoiceFormProps {
  invoice: Invoice;
  onSuccess: () => void;
  onCancel: () => void;
}

const PayInvoiceForm: React.FC<PayInvoiceFormProps> = ({ invoice, onSuccess, onCancel }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [memberCredits, setMemberCredits] = useState<any[]>([]);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [totalCreditsAvailable, setTotalCreditsAvailable] = useState(0);
  
  const paymentMethods = ["Mpesa", "Emola", "BCI", "Dinheiro", "Transferência"];
  
  const form = useForm<z.infer<typeof payInvoiceSchema>>({
    resolver: zodResolver(payInvoiceSchema),
    defaultValues: {
      valor_pago: invoice.total.toString(),
      metodo_pagamento: "",
      referencia_pagamento: "",
      descricao: `Pagamento de fatura ${invoice.numero}`,
      aplicar_creditos: true,
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  // Load member credits
  useEffect(() => {
    const loadMemberCredits = async () => {
      if (!invoice.member_id) return;
      
      try {
        setLoadingCredits(true);
        const credits = await billingService.getMemberCredits(invoice.member_id);
        setMemberCredits(credits);
        
        const totalAvailable = credits.reduce((sum: number, credit: any) => 
          sum + parseFloat(credit.valor_disponivel), 0
        );
        setTotalCreditsAvailable(totalAvailable);
        
        // Update form default value based on available credits
        const remainingAfterCredits = Math.max(0, invoice.total - totalAvailable);
        form.setValue('valor_pago', remainingAfterCredits.toString());
        
      } catch (error) {
        console.error('Error loading member credits:', error);
      } finally {
        setLoadingCredits(false);
      }
    };

    loadMemberCredits();
  }, [invoice.member_id, invoice.total, form]);

  // Watch aplicar_creditos to update payment amount
  const aplicarCreditos = form.watch('aplicar_creditos');
  useEffect(() => {
    if (!loadingCredits) {
      const remainingAfterCredits = aplicarCreditos 
        ? Math.max(0, invoice.total - totalCreditsAvailable)
        : invoice.total;
      form.setValue('valor_pago', remainingAfterCredits.toString());
    }
  }, [aplicarCreditos, totalCreditsAvailable, invoice.total, loadingCredits, form]);

  const onSubmit = async (data: z.infer<typeof payInvoiceSchema>) => {
    try {
      setLoading(true);
      
      const result = await billingService.payInvoiceWithCredits({
        factura_id: invoice.id,
        valor_pago: parseFloat(data.valor_pago) || 0,
        metodo_pagamento: data.metodo_pagamento,
        referencia_pagamento: data.referencia_pagamento,
        descricao: data.descricao,
        aplicar_creditos: data.aplicar_creditos,
      });

      setPaymentResult(result);
      setShowSuccess(true);
      
      toast({
        title: "Sucesso",
        description: "Pagamento processado com sucesso!",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error paying invoice:', error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao processar o pagamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess && paymentResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
          <CardHeader className="text-center border-b">
            <CardTitle className="text-2xl text-green-600">
              Pagamento Processado com Sucesso!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3">Resumo do Pagamento</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Valor Pago:</span>
                    <div className="font-bold text-lg">{formatCurrency(paymentResult.payment.valor_pago)} MT</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Método:</span>
                    <div className="font-semibold">{paymentResult.payment.metodo_pagamento}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Fatura:</span>
                    <div className="font-semibold">{invoice.numero}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Cliente:</span>
                    <div className="font-semibold">{invoice.member?.name}</div>
                  </div>
                </div>
              </div>

              {/* Generated Receipt */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-green-800">Recibo de Pagamento</div>
                      <div className="text-sm text-green-600">Nº: {paymentResult.receipt.numero}</div>
                      <div className="text-xs text-gray-600">
                        Processado: {formatDate(paymentResult.receipt.data_pagamento)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <ReceiptPDFButton 
                      receipt={paymentResult.receipt} 
                      companyConfig={null}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button onClick={() => setShowSuccess(false)} variant="outline">
                  Fechar
                </Button>
                <Button onClick={() => window.location.href = '/billing'} className="bg-blue-600 hover:bg-blue-700">
                  Ver Faturação
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
        <CardHeader>
          <CardTitle>Pagar Fatura Pendente</CardTitle>
        </CardHeader>
        
        <CardContent>
          {/* Invoice Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-3">Informações da Fatura</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Número:</span>
                <div className="font-semibold">{invoice.numero}</div>
              </div>
              <div>
                <span className="text-gray-600">Cliente:</span>
                <div className="font-semibold">{invoice.member?.name}</div>
              </div>
              <div>
                <span className="text-gray-600">Total:</span>
                <div className="font-bold text-lg">{formatCurrency(invoice.total)} MT</div>
              </div>
              <div>
                <span className="text-gray-600">Vencimento:</span>
                <div className="font-semibold">{formatDate(invoice.data_vencimento)}</div>
              </div>
              <div>
                <span className="text-gray-600">Estado:</span>
                <Badge className={`${
                  invoice.estado === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                  invoice.estado === 'paga' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {invoice.estado}
                </Badge>
              </div>
            </div>
          </div>

          {/* Available Credits */}
          {!loadingCredits && memberCredits.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Créditos Disponíveis
              </h3>
              <div className="space-y-2">
                {memberCredits.map((credit, index) => (
                  <div key={credit.id} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                    <div>
                      <span className="font-medium">Nota {credit.numero}</span>
                      <span className="text-gray-500 ml-2">
                        (Fatura: {credit.factura_numero})
                      </span>
                    </div>
                    <div className="font-bold text-green-600">
                      {formatCurrency(credit.valor_disponivel)} MT
                    </div>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between items-center font-bold">
                  <span>Total Disponível:</span>
                  <span className="text-green-600">{formatCurrency(totalCreditsAvailable)} MT</span>
                </div>
              </div>
            </div>
          )}

          {/* Credit Application Alert */}
          {!loadingCredits && totalCreditsAvailable > 0 && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {totalCreditsAvailable >= invoice.total 
                  ? `Seus créditos (${formatCurrency(totalCreditsAvailable)} MT) cobrem totalmente esta fatura. Não será necessário pagamento adicional.`
                  : `Você tem ${formatCurrency(totalCreditsAvailable)} MT em créditos. Valor restante após aplicação: ${formatCurrency(Math.max(0, invoice.total - totalCreditsAvailable))} MT.`
                }
              </AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Apply Credits Checkbox */}
              {!loadingCredits && totalCreditsAvailable > 0 && (
                <FormField
                  control={form.control}
                  name="aplicar_creditos"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          Aplicar créditos disponíveis automaticamente
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {field.value 
                            ? `${formatCurrency(totalCreditsAvailable)} MT em créditos serão aplicados a esta fatura.`
                            : `Você tem ${formatCurrency(totalCreditsAvailable)} MT em créditos disponíveis.`
                          }
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="valor_pago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor a Pagar (MT)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="metodo_pagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método de pagamento" />
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
              
              <FormField
                control={form.control}
                name="referencia_pagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referência do Pagamento (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: REF123456"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Descrição do pagamento"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" onClick={onCancel} variant="outline">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Processando..." : "Pagar Fatura"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayInvoiceForm; 