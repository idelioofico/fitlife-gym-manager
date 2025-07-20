import React, { useRef } from 'react';
import { Invoice } from '@/types/billing';
import { Button } from '@/components/ui/button';
import { FileDown, Printer } from 'lucide-react';
import { PDFGenerator } from '@/utils/pdfGenerator';

interface InvoicePDFProps {
  invoice: Invoice;
  companyConfig: any;
}

const InvoicePDFPreview: React.FC<InvoicePDFProps> = ({ invoice, companyConfig }) => {
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
            <title>Fatura ${invoice.numero}</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .no-print { display: none !important; }
                .invoice-container { max-width: 794px; margin: 0 auto; }
              }
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .invoice-container { max-width: 794px; margin: 0 auto; position: relative; background: white; }
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
              .invoice-header { flex: 1; text-align: right; }
              .invoice-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; }
              .invoice-details { font-size: 11px; line-height: 1.3; }
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
            <div class="invoice-container">
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
                  
                  <div class="invoice-header">
                    <div class="invoice-title">FACTURA COMERCIAL</div>
                    <div class="invoice-details">
                      <div><strong>N°: FT${invoice.numero}</strong></div>
                      <div>Data de Emissão: ${formatDate(invoice.data_emissao)}</div>
                      <div>Data de Vencimento: ${formatDate(invoice.data_vencimento)}</div>
                    </div>
                  </div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Client Information -->
                <div class="section">
                  <div class="section-title">DADOS DO CLIENTE:</div>
                  <div class="section-content">
                    <div>Nome: ${invoice.member?.name || 'N/A'}</div>
                    <div>Telefone: ${invoice.member?.phone || 'N/A'}</div>
                    <div>Nr de cartão: ${invoice.member?.nr_cartao || 'N/A'}</div>
                  </div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Products/Services Table -->
                <div class="section">
                  <div class="section-title">DISCRIMINAÇÃO DOS SERVIÇOS/PRODUTOS:</div>
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
                        <td class="text-left">${invoice.descricao_servico || 'Serviço de Ginásio'}</td>
                        <td class="text-center">1.00</td>
                        <td class="text-right">${formatCurrency(invoice.preco_unitario)} MT</td>
                        <td class="text-right">0.00 MT</td>
                        <td class="text-right">${formatCurrency(invoice.subtotal)} MT</td>
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
                        <span>${formatCurrency(invoice.subtotal)} MT</span>
                      </div>
                      <div class="summary-row">
                        <span>IVA (16%):</span>
                        <span>${formatCurrency(invoice.valor_iva)} MT</span>
                      </div>
                      <div class="total-row">
                        <span>Total:</span>
                        <span>${formatCurrency(invoice.total)} MT</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                  <div style="margin-bottom: 5px;">
                    Esta factura é válida sem assinatura, conforme legislação vigente.
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
              await PDFGenerator.generateInvoicePDF(invoice, companyConfig);
            } catch (error) {
              console.error('Error generating PDF:', error);
              alert('Erro ao gerar documento. Tente novamente.');
            }
          }} 
          variant="default" 
          size="sm"
        >
          <FileDown className="h-4 w-4 mr-2" />
          Baixar PDF
        </Button>
      </div>

      <div ref={printRef} className="invoice-container">
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
            
            <div className="invoice-header">
              <div className="invoice-title">FACTURA COMERCIAL</div>
              <div className="invoice-number">Nº: {invoice.numero}</div>
              <div className="invoice-dates">
                <div>Data de Emissão: {formatDate(invoice.data_emissao)}</div>
                <div>Data de Vencimento: {formatDate(invoice.data_vencimento)}</div>
              </div>
            </div>
          </div>
          
          {/* Client Information */}
          <div className="client-section">
            <div className="client-title">DADOS DO CLIENTE:</div>
            <div className="client-info">
              <div>Nome: {invoice.member?.name}</div>
              <div>Telefone: {invoice.member?.phone}</div>
              <div>ID: {invoice.member?.nr_cartao || 'N/A'}</div>
            </div>
          </div>
          
          {/* Services Table */}
          <div className="table-section">
            <div className="table-header">DISCRIMINAÇÃO DOS SERVIÇOS/PRODUTOS:</div>
            
            <table className="table">
              <thead>
                <tr>
                  <th style={{width: '8%'}}>#</th>
                  <th style={{width: '40%'}}>Descrição</th>
                  <th style={{width: '10%'}}>Qtd</th>
                  <th style={{width: '15%'}}>Preço Unit.</th>
                  <th style={{width: '12%'}}>Desconto</th>
                  <th style={{width: '15%'}}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-center">1</td>
                  <td className="text-left">{invoice.descricao_servico}</td>
                  <td className="text-center">{invoice.quantidade.toFixed(2)}</td>
                  <td className="text-right">{formatCurrency(invoice.preco_unitario)}</td>
                  <td className="text-right">0.00</td>
                  <td className="text-right">{formatCurrency(invoice.subtotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Summary Section */}
          <div className="summary-section">
            <div className="summary-left">
              <div className="payment-title">Método de Pagamentos:</div>
              <div className="payment-methods">
                <div>Mpesa: {companyConfig?.mpesa_number || '84 01 35 981'}</div>
                <div>Emola: {companyConfig?.emola_number || '87 01 35 983'}</div>
                <div>BCI</div>
                <div>Conta: {companyConfig?.bci_account || '2269 1142 2100.01'}</div>
                <div>NIB: {companyConfig?.bci_nib || '0008.0000.26911422101.13'}</div>
              </div>
            </div>
            
            <div className="summary-right">
              <div className="summary-title">RESUMO FINANCEIRO:</div>
              
              <div className="summary-row">
                <span className="summary-label">Subtotal:</span>
                <span className="summary-value">{formatCurrency(invoice.subtotal)} MT</span>
              </div>
              
              <div className="summary-row">
                <span className="summary-label">IVA ({invoice.taxa_iva}%):</span>
                <span className="summary-value">{formatCurrency(invoice.valor_iva)} MT</span>
              </div>
              
              <div className="total-row">
                <span className="total-label">Total:</span>
                <span className="total-value">{formatCurrency(invoice.total)} MT</span>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="footer">
            Esta factura é válida sem assinatura, conforme legislação vigente.<br />
            Processado em: {new Date().toLocaleDateString('pt-PT')}, {new Date().toLocaleTimeString('pt-PT')}
          </div>
        </div>
      </div>
    </div>
  );
};

// Component for PDF download button
export const InvoicePDFButton: React.FC<InvoicePDFProps> = ({ invoice, companyConfig }) => {
  const [showPreview, setShowPreview] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setShowPreview(true)}
        variant="outline"
        size="sm"
        className="ml-2"
      >
        <FileDown className="h-4 w-4 mr-1" />
        PDF
      </Button>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" role="dialog" aria-modal="true" aria-describedby="invoice-preview-description">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pré-visualização da Fatura</h3>
              <Button onClick={() => setShowPreview(false)} variant="outline" size="sm">
                Fechar
              </Button>
            </div>
            <div className="p-4">
              <div id="invoice-preview-description" className="sr-only">
                Pré-visualização da fatura {invoice.numero} para {invoice.member?.name}
              </div>
              <InvoicePDFPreview invoice={invoice} companyConfig={companyConfig} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoicePDFPreview; 