
import React, { useRef } from 'react';
import { Receipt } from '@/types/billing';
import { Button } from '@/components/ui/button';
import { FileDown, Printer } from 'lucide-react';

interface ReceiptPDFProps {
  receipt: Receipt;
  companyConfig?: any;
}

const ReceiptPDFPreview: React.FC<ReceiptPDFProps> = ({ receipt, companyConfig }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Recibo ${receipt.numero}</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .no-print { display: none !important; }
                .receipt-container { max-width: 794px; margin: 0 auto; }
              }
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .receipt-container { max-width: 794px; margin: 0 auto; position: relative; background: white; }
              .watermark { 
                position: absolute; 
                top: 50%; 
                left: 50%; 
                transform: translate(-50%, -50%) rotate(-30deg); 
                z-index: 1;
                pointer-events: none;
                opacity: 0.1;
              }
              .content { position: relative; z-index: 2; }
              .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .company-info { flex: 1; }
              .company-details { font-size: 11px; line-height: 1.3; }
              .receipt-header { flex: 1; text-align: right; }
              .receipt-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; }
              .receipt-details { font-size: 11px; line-height: 1.3; }
              .separator { border-bottom: 1px solid #000; margin: 15px 0; }
              .section { margin-bottom: 20px; }
              .section-title { font-weight: bold; text-transform: uppercase; margin-bottom: 8px; font-size: 11px; }
              .section-content { font-size: 11px; line-height: 1.3; }
              .table { width: 100%; border-collapse: collapse; font-size: 10px; }
              .table th { text-align: center; padding: 5px; font-weight: bold; border-bottom: 1px solid #000; }
              .table td { padding: 5px; border-bottom: 1px solid #ccc; }
              .table td.text-left { text-align: left; }
              .table td.text-center { text-align: center; }
              .table td.text-right { text-align: right; }
              .summary-section { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .payment-methods { flex: 1; margin-right: 20px; }
              .payment-title { font-weight: bold; margin-bottom: 8px; font-size: 11px; }
              .payment-content { font-size: 10px; line-height: 1.3; }
              .financial-summary { flex: 1; text-align: right; }
              .summary-title { font-weight: bold; text-transform: uppercase; margin-bottom: 8px; font-size: 11px; text-align: left; }
              .summary-content { font-size: 11px; line-height: 1.5; }
              .summary-row { display: flex; justify-content: space-between; margin-bottom: 3px; }
              .total-row { display: flex; justify-content: space-between; font-weight: bold; border-top: 1px solid #000; padding-top: 3px; }
              .footer { text-align: center; font-size: 9px; color: #666; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="watermark">
                <img src="/image.png" alt="TEFEL GYM Logo" style="width: 200px; height: auto;" />
              </div>
              
              <div class="content">
                <!-- Header -->
                <div class="header">
                  <div class="company-info">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                      <img 
                        src="/image.png" 
                        alt="TEFEL GYM Logo" 
                        style="width: 60px; height: 60px; object-fit: contain; margin-right: 10px;" 
                      />
                      <span style="font-weight: bold; font-size: 18px;">
                        <span style="color: #000;">TEFEL</span>
                        <span style="color: #FF6B35;"> GYM</span>
                      </span>
                    </div>
                    <div class="company-details">
                      <div>${companyConfig?.nome_empresa || 'Hefel Lda'}</div>
                      <div>NUIT: ${companyConfig?.nuit || '401059330'}</div>
                      <div>Endereço: ${companyConfig?.endereco || 'Av Cardeal Alexandre dos Santos, Maputo'}</div>
                      <div>Email: ${companyConfig?.email || 'hefel.lda@gmail.com'}</div>
                      <div>Telefone: ${companyConfig?.telefone1 || '+258 87 01 35 980'} / ${companyConfig?.telefone2 || '+258 87 01 35 983'}</div>
                    </div>
                  </div>
                  
                  <div class="receipt-header">
                    <div class="receipt-title">RECIBO</div>
                    <div class="receipt-number">Nº: ${receipt.numero}</div>
                    <div class="receipt-dates">
                      <div>Data de Pagamento: ${formatDate(receipt.data_pagamento)}</div>
                      <div>Processado: ${formatDate(receipt.created_at || new Date().toISOString())}</div>
                    </div>
                  </div>
                </div>
                
                <!-- Client Information -->
                <div class="client-section">
                  <div class="client-title">DADOS DO CLIENTE:</div>
                  <div class="client-info">
                    <div>Nome: ${receipt.member_name || receipt.invoice?.member?.name || 'N/A'}</div>
                    <div>Telefone: ${receipt.invoice?.member?.phone || 'N/A'}</div>
                    <div>Email: ${receipt.invoice?.member?.email || 'N/A'}</div>
                    <div>ID: ${receipt.invoice?.member?.nr_cartao || 'N/A'}</div>
                  </div>
                </div>
                
                <!-- Invoice Reference -->
                <div class="invoice-ref">
                  <div class="invoice-ref-title">REFERENTE À FATURA:</div>
                  <div class="invoice-ref-info">
                    Fatura Nº: ${receipt.factura_numero || receipt.invoice?.numero} | Emitida em: ${formatDate(receipt.invoice?.data_emissao || receipt.created_at || new Date().toISOString())}
                    <br />
                    Total da Fatura: ${formatCurrency(receipt.factura_total || receipt.invoice?.total || 0)} MT
                  </div>
                </div>
                
                <!-- Payment Details Table -->
                <div class="table-section">
                  <div class="table-header">DETALHES DO PAGAMENTO:</div>
                  
                  <table class="table">
                    <thead>
                      <tr>
                        <th style="width: 8%">#</th>
                        <th style="width: 40%">Descrição</th>
                        <th style="width: 15%">Método</th>
                        <th style="width: 20%">Referência</th>
                        <th style="width: 17%">Valor Pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="text-center">1</td>
                        <td class="text-left">${receipt.descricao || `Pagamento da fatura ${receipt.factura_numero || receipt.invoice?.numero}`}</td>
                        <td class="text-center">${receipt.metodo_pagamento.toUpperCase()}</td>
                        <td class="text-right">${receipt.referencia_pagamento || 'N/A'}</td>
                        <td class="text-right">${formatCurrency(receipt.valor_pago)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <!-- Summary Section -->
                <div class="summary-section">
                  <div class="summary-left">
                    <div class="payment-title">Método de Pagamentos:</div>
                    <div class="payment-methods">
                      <div>Mpesa: ${companyConfig?.mpesa_number || '84 01 35 981'}</div>
                      <div>Emola: ${companyConfig?.emola_number || '87 01 35 983'}</div>
                      <div>BCI</div>
                      <div>Conta: ${companyConfig?.bci_account || '2269 1142 2100.01'}</div>
                      <div>NIB: ${companyConfig?.bci_nib || '0008.0000.26911422101.13'}</div>
                    </div>
                  </div>
                  
                  <div class="summary-right">
                    <div class="summary-title">RESUMO FINANCEIRO:</div>
                    
                    <div class="summary-row">
                      <span class="summary-label">Valor Pago:</span>
                      <span class="summary-value">${formatCurrency(receipt.valor_pago)} MT</span>
                    </div>
                    
                    <div class="total-row">
                      <span class="total-label">Total:</span>
                      <span class="total-value">${formatCurrency(receipt.valor_pago)} MT</span>
                    </div>
                  </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                  Este recibo confirma o pagamento recebido.<br />
                  Processado em: ${new Date().toLocaleDateString('pt-PT')}, ${new Date().toLocaleTimeString('pt-PT')}
                  <br /><br />
                  <strong>OBRIGADO PELA SUA PREFERÊNCIA!</strong>
                </div>
              </div>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 no-print">
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Imprimir Recibo
          </Button>
        </div>

        <div className="bg-white shadow-lg p-8 relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <div className="text-8xl font-bold text-gray-400 rotate-[-30deg] select-none">
              {companyConfig?.logo && <img src={companyConfig.logo} alt="Logo" className="w-64 h-64 object-contain" />}
            </div>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <img
                    src={companyConfig?.logo || "/image.png"}
                    alt="TEFEL GYM Logo"
                    className="w-20 h-20 object-contain mr-4"
                  />
                  <div>
                    <div className="text-2xl font-bold">
                      <span className="text-black">TEFEL</span>
                      <span className="text-orange-500"> GYM</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm space-y-1">
                  <div>
                    <strong>{companyConfig?.nome_empresa || 'Hefel Lda'}</strong>
                  </div>
                  <div>NUIT: {companyConfig?.nuit || '401059330'}</div>
                  <div>Endereço: {companyConfig?.endereco || 'Av Cardeal Alexandre dos Santos, Maputo'}</div>
                  <div>Email: {companyConfig?.email || 'hefel.lda@gmail.com'}</div>
                  <div>Telefone: {companyConfig?.telefone1 || '+258 87 01 35 980'} / {companyConfig?.telefone2 || '+258 87 01 35 983'}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold mb-4">RECIBO</div>
                <div className="text-sm space-y-1">
                  <div>
                    <strong>Nº: {receipt.numero}</strong>
                  </div>
                  <div>Data de Pagamento: {formatDate(receipt.data_pagamento)}</div>
                  <div>Processado em: {formatDate(receipt.created_at || new Date().toISOString())}</div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-black my-6"></div>

            {/* Client Information */}
            <div className="mb-8">
              <div className="font-bold text-sm mb-3">DADOS DO CLIENTE:</div>
              <div className="text-sm space-y-1">
                <div>Nome: {receipt.member_name || receipt.invoice?.member?.name || 'N/A'}</div>
                <div>Telefone: {receipt.invoice?.member?.phone || 'N/A'}</div>
                <div>Email: {receipt.invoice?.member?.email || 'N/A'}</div>
                <div>ID: {receipt.invoice?.member?.nr_cartao || 'N/A'}</div>
              </div>
            </div>

            <div className="border-t-2 border-black my-6"></div>

            {/* Invoice Reference */}
            <div className="mb-8">
              <div className="font-bold text-sm mb-3">REFERENTE À FATURA:</div>
              <div className="text-sm space-y-1">
                <div>Fatura Nº: {receipt.factura_numero || receipt.invoice?.numero || 'N/A'}</div>
                <div>Data de Emissão: {formatDate(receipt.invoice?.data_emissao || receipt.created_at || new Date().toISOString())}</div>
                <div>Total da Fatura: {formatCurrency(receipt.factura_total || receipt.invoice?.total || 0)} MT</div>
              </div>
            </div>

            <div className="border-t-2 border-black my-6"></div>

            {/* Payment Details */}
            <div className="mb-8">
              <div className="font-bold text-sm mb-4">DETALHES DO PAGAMENTO:</div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-2 px-1 text-sm font-bold w-8">#</th>
                    <th className="text-left py-2 px-1 text-sm font-bold">Descrição</th>
                    <th className="text-center py-2 px-1 text-sm font-bold w-24">Método</th>
                    <th className="text-right py-2 px-1 text-sm font-bold w-24">Referência</th>
                    <th className="text-right py-2 px-1 text-sm font-bold w-24">Valor Pago</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="py-3 px-1 text-sm">1</td>
                    <td className="py-3 px-1 text-sm">{receipt.descricao || `Pagamento da fatura ${receipt.factura_numero || receipt.invoice?.numero}`}</td>
                    <td className="py-3 px-1 text-sm text-center">{receipt.metodo_pagamento.toUpperCase()}</td>
                    <td className="py-3 px-1 text-sm text-right">{receipt.referencia_pagamento || 'N/A'}</td>
                    <td className="py-3 px-1 text-sm text-right">{formatCurrency(receipt.valor_pago)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex flex-col space-y-8 mb-8">
              <div className="flex justify-between items-start">
                <div className="font-bold text-sm">RESUMO FINANCEIRO:</div>
                <div className="text-right space-y-1 mt-9">
                  <div className="flex justify-between text-sm min-w-[200px]">
                    <span>Valor Pago:</span>
                    <span className="ml-8">{formatCurrency(receipt.valor_pago)} MT</span>
                  </div>
                  <div className="border-t border-black pt-1">
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total:</span>
                      <span className="ml-8">{formatCurrency(receipt.valor_pago)} MT</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-bold text-sm mb-3">Método de Pagamentos:</div>
                <div className="text-xs space-y-1">
                  <div>Mpesa {companyConfig?.mpesa_number || '84 01 35 981'}</div>
                  <div>Emola {companyConfig?.emola_number || '87 01 35 983'}</div>
                  <div>BCI</div>
                  <div>Conta: {companyConfig?.bci_account || '2269 1142 2100.01'}</div>
                  <div>NIB: {companyConfig?.bci_nib || '0008.0000.26911422101.13'}</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-600 mt-12 space-y-1">
              <div>Este recibo confirma o pagamento recebido.</div>
              <div>Processado em: {formatDate(new Date().toISOString())}</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { 
            margin: 0; 
            padding: 20px; 
            font-family: Arial, sans-serif; 
          }
          .no-print { 
            display: none !important; 
          }
        }
      `}</style>
    </div>
  );
};

// Component for PDF download button
export const ReceiptPDFButton: React.FC<ReceiptPDFProps> = ({ receipt, companyConfig }) => {
  const [showPreview, setShowPreview] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setShowPreview(true)}
        variant="outline"
        size="sm"
        className="ml-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
      >
        <FileDown className="h-4 w-4 mr-1" />
        Recibo
      </Button>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" role="dialog" aria-modal="true" aria-describedby="receipt-preview-description">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pré-visualização do Recibo</h3>
              <Button onClick={() => setShowPreview(false)} variant="outline" size="sm">
                Fechar
              </Button>
            </div>
            <div className="p-4">
              <div id="receipt-preview-description" className="sr-only">
                Pré-visualização do recibo {receipt.numero} para {receipt.member_name || 'pagamento'}
              </div>
              <ReceiptPDFPreview receipt={receipt} companyConfig={companyConfig} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReceiptPDFPreview; 