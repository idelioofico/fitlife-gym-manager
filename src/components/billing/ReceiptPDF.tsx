import React, { useRef } from 'react';
import { Receipt } from '@/types/billing';
import { Button } from '@/components/ui/button';
import { FileDown, Printer } from 'lucide-react';
import { PDFGenerator } from '@/utils/pdfGenerator';

interface ReceiptPDFProps {
  receipt: Receipt;
  companyConfig: any;
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
                      <div><strong>Hefel Lda</strong></div>
                      <div>NUIT: 401059330</div>
                      <div>Endereço: Av Cardeal Alxexandre dos Santos, Maputo, Moçambique</div>
                      <div>Email: hefel.lda@gmail.com</div>
                      <div>Telefone: +258 87 01 35 980 / 87 01 35 983</div>
                    </div>
                  </div>
                  
                  <div class="receipt-header">
                    <div class="receipt-title">RECIBO DE PAGAMENTO</div>
                    <div class="receipt-details">
                      <div><strong>N°: RC${receipt.numero}</strong></div>
                      <div>Data de Emissão: ${formatDate(receipt.data_pagamento)}</div>
                      <div>Data de Pagamento: ${formatDate(receipt.data_pagamento)}</div>
                    </div>
                  </div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Client Information -->
                <div class="section">
                  <div class="section-title">DADOS DO CLIENTE:</div>
                  <div class="section-content">
                    <div>Nome: ${receipt.invoice?.member?.name || 'N/A'}</div>
                    <div>Telefone: ${receipt.invoice?.member?.phone || 'N/A'}</div>
                    <div>Nr de cartão: ${receipt.invoice?.member?.nr_cartao || 'N/A'}</div>
                  </div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Payment Details Table -->
                <div class="section">
                  <div class="section-title">DISCRIMINAÇÃO DOS PAGAMENTOS:</div>
                  <table class="table">
                    <thead>
                      <tr>
                        <th style="width: 5%;">#</th>
                        <th style="width: 45%;">Descrição</th>
                        <th style="width: 10%;">Qtd</th>
                        <th style="width: 15%;">Preço Unit.</th>
                        <th style="width: 10%;">Desconto</th>
                        <th style="width: 15%;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="text-center">1</td>
                        <td class="text-left">${receipt.descricao || 'Pagamento de Serviço'}</td>
                        <td class="text-center">1.00</td>
                        <td class="text-right">${formatCurrency(receipt.valor_pago)} MT</td>
                        <td class="text-right">0.00 MT</td>
                        <td class="text-right">${formatCurrency(receipt.valor_pago)} MT</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <!-- Summary Section -->
                <div class="summary-section">
                  <div class="payment-methods">
                    <div class="payment-title">Método de Pagamentos:</div>
                    <div class="payment-content">
                      <div>Mpesa 84 01 35 981</div>
                      <div>Emola 87 01 35 983</div>
                      <div>BCI</div>
                      <div>Conta: 2269 1142 2100 01</div>
                      <div>NIB: 0008.0000.26911422101.13</div>
                    </div>
                  </div>
                  
                  <div class="financial-summary">
                    <div class="summary-title">RESUMO FINANCEIRO:</div>
                    <div class="summary-content">
                      <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(receipt.valor_pago)} MT</span>
                      </div>
                      <div class="summary-row">
                        <span>IVA (16%):</span>
                        <span>${formatCurrency(receipt.valor_pago * 0.16)} MT</span>
                      </div>
                      <div class="total-row">
                        <span>Total:</span>
                        <span>${formatCurrency(receipt.valor_pago * 1.16)} MT</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                  <div style="margin-bottom: 5px;">
                    Este recibo é válido sem assinatura, conforme legislação vigente.
                  </div>
                  <div>
                    Processado em: ${new Date().toLocaleDateString('pt-PT')}, ${new Date().toLocaleTimeString('pt-PT')}
                  </div>
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
    <div className="bg-white">
      <div className="flex justify-end gap-2 mb-4 no-print">
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          Imprimir
        </Button>
        <Button 
          onClick={async () => {
            try {
              await PDFGenerator.generateReceiptPDF(receipt, companyConfig);
            } catch (error) {
              console.error('Error generating PDF:', error);
              alert('Erro ao gerar documento. Tente novamente.');
            }
          }} 
          variant="default" 
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Baixar PDF
        </Button>
      </div>

      <div ref={printRef} className="receipt-container">
        <div className="watermark">
          <img src="/image.png" alt="TEFEL GYM Logo" style="width: 200px; height: auto;" />
        </div>
        
        <div className="content">
          {/* Header */}
          <div className="header">
            <div className="company-info">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <img 
                  src="/image.png" 
                  alt="TEFEL GYM Logo" 
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    objectFit: 'contain', 
                    marginRight: '10px' 
                  }} 
                />
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  <span style={{ color: '#000' }}>TEFEL</span>
                  <span style={{ color: '#FF6B35' }}> GYM</span>
                </span>
              </div>
              <div className="company-details">
                <div>{companyConfig?.nome_empresa || 'Hefel Lda'}</div>
                <div>NUIT: {companyConfig?.nuit || '401059330'}</div>
                <div>Endereço: {companyConfig?.endereco || 'Av Cardeal Alexandre dos Santos, Maputo,'}</div>
                <div>Moçambique</div>
                <div>Email: {companyConfig?.email || 'hefel.lda@gmail.com'}</div>
                <div>Telefone: {companyConfig?.telefone1 || '+258 87 01 35 980'} / {companyConfig?.telefone2 || '87 01 35 983'}</div>
              </div>
            </div>
            
            <div className="receipt-header">
              <div className="receipt-title">RECIBO</div>
              <div className="receipt-number">Nº: {receipt.numero}</div>
              <div className="receipt-dates">
                <div>Data: {formatDate(receipt.data_pagamento)}</div>
                <div>Processado: {formatDate(receipt.created_at || new Date().toISOString())}</div>
              </div>
            </div>
          </div>
          
          {/* Invoice Reference */}
          {receipt.invoice && (
            <div className="invoice-ref">
              <div className="invoice-ref-title">REFERENTE À FATURA:</div>
              <div className="invoice-ref-info">
                Fatura Nº: {receipt.invoice.numero} | Emitida em: {formatDate(receipt.invoice.data_emissao)}
                <br />
                Cliente: {receipt.invoice.member?.name}
              </div>
            </div>
          )}
          
          {/* Payment Information */}
          <div className="payment-section">
            <div className="payment-title">DETALHES DO PAGAMENTO:</div>
            <div className="payment-info">
              <div>Descrição: {receipt.descricao}</div>
            </div>
            
            <div className="payment-details">
              <div className="payment-detail">
                <div className="payment-label">Método de Pagamento:</div>
                <div className="payment-value">{receipt.metodo_pagamento.toUpperCase()}</div>
              </div>
              <div className="payment-detail">
                <div className="payment-label">Referência:</div>
                <div className="payment-value">{receipt.referencia_pagamento || 'N/A'}</div>
              </div>
            </div>
          </div>
          
          {/* Amount Section */}
          <div className="amount-section">
            <div className="amount-box">
              <div className="amount-label">VALOR PAGO</div>
              <div className="amount-value">{formatCurrency(receipt.valor_pago)} MT</div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="footer">
            Este recibo confirma o pagamento recebido.<br />
            Processado em: {new Date().toLocaleDateString('pt-PT')}, {new Date().toLocaleTimeString('pt-PT')}
            <br /><br />
            <strong>OBRIGADO PELA SUA PREFERÊNCIA!</strong>
          </div>
        </div>
      </div>
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
                Pré-visualização do recibo {receipt.numero} para {receipt.invoice?.member?.name || 'pagamento'}
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