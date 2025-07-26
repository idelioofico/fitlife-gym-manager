import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import InvoicePreview from '@/components/billing/InvoicePreview';
import { Invoice } from '@/types/billing';
import billingService from '@/services/billingService';
import { useToast } from '@/hooks/use-toast';

const InvoiceViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [companyConfig, setCompanyConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoice = async () => {
      if (!id) {
        setError('ID da fatura não fornecido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Load invoice and company config in parallel
        const [invoiceData, configData] = await Promise.all([
          billingService.getInvoiceById(id),
          billingService.getCompanyConfig().catch(() => null) // Don't fail if config fails
        ]);

        setInvoice(invoiceData);
        setCompanyConfig(configData);
      } catch (err: any) {
        console.error('Error loading invoice:', err);
        setError(err.message || 'Erro ao carregar fatura');
        toast({
          title: 'Erro',
          description: 'Erro ao carregar fatura',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando fatura...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Erro</h2>
            <p className="text-gray-600 mb-6">
              {error || 'Fatura não encontrada'}
            </p>
            <Button onClick={() => navigate('/billing')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Sistema de Faturação
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4 flex items-center gap-4">
            <Button 
              onClick={() => navigate('/billing')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h1 className="text-lg font-semibold">
                Fatura {invoice.numero}
              </h1>
              <p className="text-sm text-gray-600">
                {invoice.member?.name}
              </p>
            </div>
          </div>
          
          <InvoicePreview 
            invoice={invoice} 
            companyConfig={companyConfig}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewPage; 