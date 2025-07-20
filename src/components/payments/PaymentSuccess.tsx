import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, FileText, Receipt, Download } from 'lucide-react';
import { InvoicePDFButton } from '@/components/billing/InvoicePDF';
import { ReceiptPDFButton } from '@/components/billing/ReceiptPDF';
import { Invoice, Receipt as ReceiptType } from '@/types/billing';

interface PaymentSuccessProps {
  payment: any;
  invoice?: Invoice;
  receipt?: ReceiptType;
  companyConfig: any;
  onClose: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  payment,
  invoice,
  receipt,
  companyConfig,
  onClose
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
        <CardHeader className="text-center border-b">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
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
                  <span className="text-gray-600">Valor:</span>
                  <div className="font-bold text-lg">{formatCurrency(payment.amount)} MT</div>
                </div>
                <div>
                  <span className="text-gray-600">Método:</span>
                  <div className="font-semibold">{payment.method}</div>
                </div>
                <div>
                  <span className="text-gray-600">Data:</span>
                  <div className="font-semibold">{formatDate(payment.payment_date)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {payment.status}
                  </Badge>
                </div>
              </div>
              {payment.reference_id && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <span className="text-gray-600 text-sm">Referência:</span>
                  <div className="font-mono font-bold">{payment.reference_id}</div>
                </div>
              )}
            </div>

            {/* Generated Documents */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentos Gerados
              </h3>

              <div className="grid gap-4">
                {/* Invoice */}
                {invoice && (
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-blue-800">Fatura Comercial</div>
                          <div className="text-sm text-blue-600">Nº: {invoice.numero}</div>
                          <div className="text-xs text-gray-600">
                            Emitida: {formatDate(invoice.data_emissao)} | 
                            Vence: {formatDate(invoice.data_vencimento)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {companyConfig && (
                          <InvoicePDFButton 
                            invoice={invoice} 
                            companyConfig={companyConfig}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Receipt */}
                {receipt && (
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded">
                          <Receipt className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-green-800">Recibo de Pagamento</div>
                          <div className="text-sm text-green-600">Nº: {receipt.numero}</div>
                          <div className="text-xs text-gray-600">
                            Processado: {formatDate(receipt.data_pagamento)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {companyConfig && (
                          <ReceiptPDFButton 
                            receipt={receipt} 
                            companyConfig={companyConfig}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Próximos Passos:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Os documentos foram gerados automaticamente</li>
                <li>• Clique nos botões "PDF" para visualizar ou baixar</li>
                <li>• Guarde os documentos para seus registros</li>
                <li>• O plano do membro foi atualizado automaticamente</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button onClick={onClose} variant="outline">
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
};

export default PaymentSuccess; 