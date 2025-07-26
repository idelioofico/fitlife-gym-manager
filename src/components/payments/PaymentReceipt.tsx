import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Printer } from 'lucide-react';

interface PaymentReceiptProps {
  payment: {
    reference_id: string;
    amount: number | string;
    payment_date: string;
    status: string;
    member_name: string;
    member_email?: string;
    member_phone?: string;
    plan_name: string;
    payment_method: string;
  };
  gymSettings?: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

const PaymentReceiptPreview: React.FC<PaymentReceiptProps> = ({ payment, gymSettings }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number | string) => {
    if (!amount) return '0,00';
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('pt-PT');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Recibo ${payment.reference_id}</title>
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
                      <div>Endereço: Av Cardeal Alexandre dos Santos, Maputo</div>
                      <div>Email: hefel.lda@gmail.com</div>
                      <div>Telefone: +258 87 01 35 980 / +258 87 01 35 983</div>
                    </div>
                  </div>
                  
                  <div class="receipt-header">
                    <div class="receipt-title">RECIBO</div>
                    <div class="receipt-details">
                      <div><strong>Nº: ${payment.reference_id}</strong></div>
                      <div>Data de Pagamento: ${formatDate(payment.payment_date)}</div>
                      <div>Processado em: ${formatDate(new Date().toISOString())}</div>
                    </div>
                  </div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Client Information -->
                <div class="section">
                  <div class="section-title">DADOS DO CLIENTE:</div>
                  <div class="section-content">
                    <div>Nome: ${payment.member_name || 'N/A'}</div>
                    <div>Telefone: ${payment.member_phone || 'N/A'}</div>
                    <div>Email: ${payment.member_email || 'N/A'}</div>
                    <div>ID: N/A</div>
                  </div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Payment Details Table -->
                <div class="section">
                  <div class="section-title">DETALHES DO PAGAMENTO:</div>
                  <table class="table">
                    <thead>
                      <tr>
                        <th style="width: 5%;">#</th>
                        <th style="width: 45%;">Descrição</th>
                        <th style="width: 10%;">Método</th>
                        <th style="width: 15%;">Referência</th>
                        <th style="width: 10%;">Status</th>
                        <th style="width: 15%;">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="text-center">1</td>
                        <td class="text-left">Mensalidade - ${payment.plan_name || 'Plano não definido'}</td>
                        <td class="text-center">${payment.payment_method?.toUpperCase() || 'N/A'}</td>
                        <td class="text-right">${payment.reference_id || 'N/A'}</td>
                        <td class="text-center">${payment.status}</td>
                        <td class="text-right">${formatCurrency(payment.amount)} MT</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <!-- Summary Section -->
                <div class="summary-section">
                  <div class="payment-methods">
                    <div class="payment-title">Método de Pagamentos:</div>
                    <div class="payment-content">
                      <div>Mpesa: 84 01 35 981</div>
                      <div>Emola: 87 01 35 983</div>
                      <div>BCI</div>
                      <div>Conta: 2269 1142 2100.01</div>
                      <div>NIB: 0008.0000.26911422101.13</div>
                    </div>
                  </div>
                  
                  <div class="financial-summary">
                    <div class="summary-title">RESUMO FINANCEIRO:</div>
                    <div class="summary-content">
                      <div class="summary-row">
                        <span>Valor Pago:</span>
                        <span>${formatCurrency(payment.amount)} MT</span>
                      </div>
                      <div class="total-row">
                        <span>Total:</span>
                        <span>${formatCurrency(payment.amount)} MT</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                  <div style="margin-bottom: 5px;">
                    Este recibo confirma o pagamento recebido.
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
      </div>

      <div ref={printRef} className="receipt-container" style={{ maxWidth: '794px', margin: '0 auto', position: 'relative', background: 'white' }}>
        <div className="watermark" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-30deg)', zIndex: 1, pointerEvents: 'none', opacity: 0.1 }}>
          <img src="/image.png" alt="TEFEL GYM Logo" style={{ width: '200px', height: 'auto' }} />
        </div>
        
        <div className="content" style={{ position: 'relative', zIndex: 2 }}>
          {/* Header */}
          <div className="header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div className="company-info" style={{ flex: 1 }}>
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
              <div className="company-details" style={{ fontSize: '11px', lineHeight: 1.3 }}>
                <div><strong>Hefel Lda</strong></div>
                <div>NUIT: 401059330</div>
                <div>Endereço: Av Cardeal Alexandre dos Santos, Maputo</div>
                <div>Email: hefel.lda@gmail.com</div>
                <div>Telefone: +258 87 01 35 980 / +258 87 01 35 983</div>
              </div>
            </div>
            
            <div className="receipt-header" style={{ flex: 1, textAlign: 'right' }}>
              <div className="receipt-title" style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>RECIBO</div>
              <div className="receipt-number">Nº: {payment.reference_id}</div>
              <div className="receipt-dates" style={{ fontSize: '11px', lineHeight: 1.3 }}>
                <div>Data de Pagamento: {formatDate(payment.payment_date)}</div>
                <div>Processado em: {formatDate(new Date().toISOString())}</div>
              </div>
            </div>
          </div>
          
          {/* Separator */}
          <div className="separator" style={{ borderBottom: '1px solid #000', margin: '15px 0' }}></div>
          
          {/* Client Information */}
          <div className="section" style={{ marginBottom: '20px' }}>
            <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', fontSize: '11px' }}>DADOS DO CLIENTE:</div>
            <div className="section-content" style={{ fontSize: '11px', lineHeight: 1.3 }}>
              <div>Nome: {payment.member_name || 'N/A'}</div>
              <div>Telefone: {payment.member_phone || 'N/A'}</div>
              <div>Email: {payment.member_email || 'N/A'}</div>
              <div>ID: N/A</div>
            </div>
          </div>
          
          {/* Separator */}
          <div className="separator" style={{ borderBottom: '1px solid #000', margin: '15px 0' }}></div>
          
          {/* Payment Details Table */}
          <div className="section" style={{ marginBottom: '20px' }}>
            <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', fontSize: '11px' }}>DETALHES DO PAGAMENTO:</div>
            
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr>
                  <th style={{ width: '5%', textAlign: 'center', padding: '5px', fontWeight: 'bold', borderBottom: '1px solid #000' }}>#</th>
                  <th style={{ width: '45%', textAlign: 'center', padding: '5px', fontWeight: 'bold', borderBottom: '1px solid #000' }}>Descrição</th>
                  <th style={{ width: '10%', textAlign: 'center', padding: '5px', fontWeight: 'bold', borderBottom: '1px solid #000' }}>Método</th>
                  <th style={{ width: '15%', textAlign: 'center', padding: '5px', fontWeight: 'bold', borderBottom: '1px solid #000' }}>Referência</th>
                  <th style={{ width: '10%', textAlign: 'center', padding: '5px', fontWeight: 'bold', borderBottom: '1px solid #000' }}>Status</th>
                  <th style={{ width: '15%', textAlign: 'center', padding: '5px', fontWeight: 'bold', borderBottom: '1px solid #000' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '5px', borderBottom: '1px solid #ccc', textAlign: 'center' }}>1</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #ccc', textAlign: 'left' }}>Mensalidade - {payment.plan_name || 'Plano não definido'}</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #ccc', textAlign: 'center' }}>{payment.payment_method?.toUpperCase() || 'N/A'}</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #ccc', textAlign: 'right' }}>{payment.reference_id || 'N/A'}</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #ccc', textAlign: 'center' }}>{payment.status}</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #ccc', textAlign: 'right' }}>{formatCurrency(payment.amount)} MT</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Summary Section */}
          <div className="summary-section" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div className="payment-methods" style={{ flex: 1, marginRight: '20px' }}>
              <div className="payment-title" style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '11px' }}>Método de Pagamentos:</div>
              <div className="payment-content" style={{ fontSize: '10px', lineHeight: 1.3 }}>
                <div>Mpesa: 84 01 35 981</div>
                <div>Emola: 87 01 35 983</div>
                <div>BCI</div>
                <div>Conta: 2269 1142 2100.01</div>
                <div>NIB: 0008.0000.26911422101.13</div>
              </div>
            </div>
            
            <div className="financial-summary" style={{ flex: 1, textAlign: 'right' }}>
              <div className="summary-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', fontSize: '11px', textAlign: 'left' }}>RESUMO FINANCEIRO:</div>
              <div className="summary-content" style={{ fontSize: '11px', lineHeight: 1.5 }}>
                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span>Valor Pago:</span>
                  <span>{formatCurrency(payment.amount)} MT</span>
                </div>
                <div className="total-row" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '3px' }}>
                  <span>Total:</span>
                  <span>{formatCurrency(payment.amount)} MT</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="footer" style={{ textAlign: 'center', fontSize: '9px', color: '#666', marginTop: '30px' }}>
            Este recibo confirma o pagamento recebido.<br />
            Processado em: {new Date().toLocaleDateString('pt-PT')}, {new Date().toLocaleTimeString('pt-PT')}
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
          .receipt-container {
            max-width: 794px !important;
            margin: 0 auto !important;
            position: relative !important;
            background: white !important;
          }
          .watermark {
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) rotate(-30deg) !important;
            z-index: 1 !important;
            pointer-events: none !important;
            opacity: 0.1 !important;
          }
          .content {
            position: relative !important;
            z-index: 2 !important;
          }
          .header {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 20px !important;
          }
          .company-info {
            flex: 1 !important;
          }
          .company-details {
            font-size: 11px !important;
            line-height: 1.3 !important;
          }
          .receipt-header {
            flex: 1 !important;
            text-align: right !important;
          }
          .receipt-title {
            font-size: 16px !important;
            font-weight: bold !important;
            margin-bottom: 10px !important;
            text-transform: uppercase !important;
          }
          .separator {
            border-bottom: 1px solid #000 !important;
            margin: 15px 0 !important;
          }
          .section {
            margin-bottom: 20px !important;
          }
          .section-title {
            font-weight: bold !important;
            text-transform: uppercase !important;
            margin-bottom: 8px !important;
            font-size: 11px !important;
          }
          .section-content {
            font-size: 11px !important;
            line-height: 1.3 !important;
          }
          .table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 10px !important;
          }
          .table th {
            text-align: center !important;
            padding: 5px !important;
            font-weight: bold !important;
            border-bottom: 1px solid #000 !important;
          }
          .table td {
            padding: 5px !important;
            border-bottom: 1px solid #ccc !important;
          }
          .summary-section {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 20px !important;
          }
          .payment-methods {
            flex: 1 !important;
            margin-right: 20px !important;
          }
          .payment-title {
            font-weight: bold !important;
            margin-bottom: 8px !important;
            font-size: 11px !important;
          }
          .payment-content {
            font-size: 10px !important;
            line-height: 1.3 !important;
          }
          .financial-summary {
            flex: 1 !important;
            text-align: right !important;
          }
          .summary-title {
            font-weight: bold !important;
            text-transform: uppercase !important;
            margin-bottom: 8px !important;
            font-size: 11px !important;
            text-align: left !important;
          }
          .summary-content {
            font-size: 11px !important;
            line-height: 1.5 !important;
          }
          .summary-row {
            display: flex !important;
            justify-content: space-between !important;
            margin-bottom: 3px !important;
          }
          .total-row {
            display: flex !important;
            justify-content: space-between !important;
            font-weight: bold !important;
            border-top: 1px solid #000 !important;
            padding-top: 3px !important;
          }
          .footer {
            text-align: center !important;
            font-size: 9px !important;
            color: #666 !important;
            margin-top: 30px !important;
          }
        }
      `}</style>
    </div>
  );
};

// Component for PDF download button
export const PaymentReceiptButton: React.FC<PaymentReceiptProps> = ({ payment, gymSettings }) => {
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
                Pré-visualização do recibo {payment.reference_id} para {payment.member_name}
              </div>
              <PaymentReceiptPreview payment={payment} gymSettings={gymSettings} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const PaymentReceipt = React.forwardRef<HTMLDivElement, PaymentReceiptProps>(({ payment, gymSettings }, ref) => {
  return (
    <div ref={ref}>
      <PaymentReceiptPreview payment={payment} gymSettings={gymSettings} />
    </div>
  );
});

PaymentReceipt.displayName = 'PaymentReceipt';

export default PaymentReceipt;
