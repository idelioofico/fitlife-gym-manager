import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { billingService } from '@/services/billingService';
import { useToast } from '@/hooks/use-toast';
import { Invoice, CreditNote } from '@/types/billing';

interface NewCreditNoteFormProps {
  onSuccess?: (creditNote: CreditNote) => void;
  preselectedInvoice?: Invoice;
}

const NewCreditNoteForm: React.FC<NewCreditNoteFormProps> = ({ 
  onSuccess, 
  preselectedInvoice 
}) => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(preselectedInvoice || null);
  const [loading, setLoading] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    factura_id: preselectedInvoice?.id || '',
    motivo: '',
    valor_credito: '',
    tipo: 'total' as 'total' | 'parcial'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (preselectedInvoice) {
      setSelectedInvoice(preselectedInvoice);
      setFormData(prev => ({
        ...prev,
        factura_id: preselectedInvoice.id,
        valor_credito: preselectedInvoice.total.toString()
      }));
    }
  }, [preselectedInvoice]);

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);
      const response = await billingService.getInvoices();
      // Only show paid invoices that can have credit notes
      const paidInvoices = response.data.filter(invoice => 
        invoice.estado === 'paga'
      );
      setInvoices(paidInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as faturas.",
        variant: "destructive",
      });
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-select invoice when changed
    if (field === 'factura_id') {
      const invoice = invoices.find(inv => inv.id === value);
      setSelectedInvoice(invoice || null);
      
      // Auto-fill credit amount for total credit
      if (invoice && formData.tipo === 'total') {
        setFormData(prev => ({ ...prev, valor_credito: invoice.total.toString() }));
      }
    }

    // Auto-adjust credit amount when type changes
    if (field === 'tipo' && selectedInvoice) {
      if (value === 'total') {
        setFormData(prev => ({ ...prev, valor_credito: selectedInvoice.total.toString() }));
      } else {
        setFormData(prev => ({ ...prev, valor_credito: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.factura_id) {
      newErrors.factura_id = 'Selecione uma fatura';
    }

    if (!formData.motivo.trim()) {
      newErrors.motivo = 'Motivo é obrigatório';
    }

    if (!formData.valor_credito) {
      newErrors.valor_credito = 'Valor do crédito é obrigatório';
    } else {
      const creditValue = parseFloat(formData.valor_credito);
      if (isNaN(creditValue) || creditValue <= 0) {
        newErrors.valor_credito = 'Valor deve ser maior que zero';
      } else if (selectedInvoice && creditValue > selectedInvoice.total) {
        newErrors.valor_credito = 'Valor não pode exceder o total da fatura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const creditNoteData = {
        ...formData,
        valor_credito: parseFloat(formData.valor_credito)
      };

      const newCreditNote = await billingService.createCreditNote(creditNoteData);
      
      toast({
        title: "Sucesso",
        description: "Nota de crédito criada com sucesso!",
      });

      // Reset form
      setFormData({
        factura_id: '',
        motivo: '',
        valor_credito: '',
        tipo: 'total'
      });
      setSelectedInvoice(null);

      if (onSuccess) {
        onSuccess(newCreditNote);
      }

    } catch (error: any) {
      console.error('Error creating credit note:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a nota de crédito.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-red-600" />
          Nova Nota de Crédito
        </CardTitle>
        <CardDescription>
          Crie uma nota de crédito para cancelar ou ajustar uma fatura paga
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Selection */}
          <div className="space-y-2">
            <Label htmlFor="factura_id">Fatura *</Label>
            <Select
              value={formData.factura_id}
              onValueChange={(value) => handleInputChange('factura_id', value)}
              disabled={!!preselectedInvoice || loadingInvoices}
            >
              <SelectTrigger className={errors.factura_id ? 'border-red-500' : ''}>
                <SelectValue placeholder={loadingInvoices ? "Carregando faturas..." : "Selecione uma fatura"} />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    <div className="flex justify-between items-center w-full">
                      <span>Fatura {invoice.numero}</span>
                      <span className="text-sm text-gray-500 ml-4">
                        {invoice.member_name} - {formatCurrency(invoice.total)} MT
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.factura_id && (
              <p className="text-sm text-red-600">{errors.factura_id}</p>
            )}
          </div>

          {/* Invoice Details */}
          {selectedInvoice && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div><strong>Cliente:</strong> {selectedInvoice.member_name}</div>
                  <div><strong>Total da Fatura:</strong> {formatCurrency(selectedInvoice.total)} MT</div>
                  <div><strong>Estado:</strong> {selectedInvoice.estado}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Credit Type */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Crédito *</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: 'total' | 'parcial') => handleInputChange('tipo', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total">Crédito Total</SelectItem>
                <SelectItem value="parcial">Crédito Parcial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Credit Amount */}
          <div className="space-y-2">
            <Label htmlFor="valor_credito">Valor do Crédito (MT) *</Label>
            <Input
              id="valor_credito"
              type="number"
              step="0.01"
              min="0.01"
              max={selectedInvoice?.total || undefined}
              value={formData.valor_credito}
              onChange={(e) => handleInputChange('valor_credito', e.target.value)}
              placeholder="0.00"
              className={errors.valor_credito ? 'border-red-500' : ''}
              disabled={formData.tipo === 'total' && !!selectedInvoice}
            />
            {errors.valor_credito && (
              <p className="text-sm text-red-600">{errors.valor_credito}</p>
            )}
            {selectedInvoice && (
              <p className="text-sm text-gray-500">
                Máximo: {formatCurrency(selectedInvoice.total)} MT
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo do Crédito *</Label>
            <Textarea
              id="motivo"
              value={formData.motivo}
              onChange={(e) => handleInputChange('motivo', e.target.value)}
              placeholder="Descreva o motivo para a emissão desta nota de crédito..."
              rows={4}
              className={errors.motivo ? 'border-red-500' : ''}
            />
            {errors.motivo && (
              <p className="text-sm text-red-600">{errors.motivo}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Criando...' : 'Criar Nota de Crédito'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewCreditNoteForm; 