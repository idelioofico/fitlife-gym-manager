import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Invoice } from '@/types/billing';
import InvoicePreview from './InvoicePreview';

interface InvoicePreviewButtonProps {
  invoice: Invoice;
  companyConfig?: any;
}

export const InvoicePreviewButton: React.FC<InvoicePreviewButtonProps> = ({ 
  invoice, 
  companyConfig 
}) => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowPreview(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Eye className="h-4 w-4" />
        Visualizar
      </Button>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Fatura {invoice.numero} - {invoice.member?.name}
              </h3>
              <Button 
                onClick={() => setShowPreview(false)} 
                variant="outline" 
                size="sm"
              >
                Fechar
              </Button>
            </div>
            <div className="p-0">
              <InvoicePreview 
                invoice={invoice} 
                companyConfig={companyConfig}
                onPrint={() => {
                  // Custom print handler if needed
                  window.print();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 