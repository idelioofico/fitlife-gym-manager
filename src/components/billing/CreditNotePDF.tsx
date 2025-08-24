import React, { useRef } from 'react';
import { CreditNote } from '@/types/billing';
import { Button } from '@/components/ui/button';
import { FileDown, Printer } from 'lucide-react';

interface CreditNotePDFProps {
  creditNote: CreditNote;
  companyConfig?: any;
}

const CreditNotePDFPreview: React.FC<CreditNotePDFProps> = ({ creditNote, companyConfig }) => {
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
            <title>Nota de Crédito ${creditNote.numero}</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .no-print { display: none !important; }
                .credit-note-container { max-width: 794px; margin: 0 auto; }
              }
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              .credit-note-container { max-width: 794px; margin: 0 auto; position: relative; background: white; }
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
              .credit-note-header { flex: 1; text-align: right; }
              .credit-note-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; }
              .credit-note-details { font-size: 11px; line-height: 1.3; }
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
              .credit-badge { background: #111827; color: white; padding: 5px 10px; border-radius: 3px; font-size: 10px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="credit-note-container">
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
                      <div><strong>${companyConfig?.nome_empresa || 'Hefel Lda'}</strong></div>
                      <div>NUIT: ${companyConfig?.nuit || '401059330'}</div>
                      <div>Endereço: ${companyConfig?.endereco || 'Av Cardeal Alexandre dos Santos, Maputo'}</div>
                      <div>Email: ${companyConfig?.email || 'hefel.lda@gmail.com'}</div>
                      <div>Telefone: ${companyConfig?.telefone1 || '+258 87 01 35 980'} / ${companyConfig?.telefone2 || '+258 87 01 35 983'}</div>
                    </div>
                  </div>
                  
                  <div class="credit-note-header">
                    <div class="credit-note-title">NOTA DE CRÉDITO</div>
                    <div class="credit-note-details">
                      <div><strong>Nº: ${creditNote.numero}</strong></div>
                      <div>Data de Emissão: ${formatDate(creditNote.data_emissao)}</div>
                      <div>Tipo: <span class="credit-badge">${creditNote.tipo.toUpperCase()}</span></div>
                    </div>
                  </div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Client Information -->
                <div class="section">
                  <div class="section-title">DADOS DO CLIENTE:</div>
                  <div class="section-content">
                    ${ (creditNote.invoice?.member?.name || creditNote.invoice?.member_name) ? `<div>Nome: ${creditNote.invoice?.member?.name || creditNote.invoice?.member_name}</div>` : '' }
                    ${ creditNote.invoice?.member?.phone ? `<div>Telefone: ${creditNote.invoice?.member?.phone}</div>` : '' }
                    ${ creditNote.invoice?.member?.email ? `<div>Email: ${creditNote.invoice?.member?.email}</div>` : '' }
                    ${ creditNote.invoice?.member?.nr_cartao ? `<div>Nº do Cartão: ${creditNote.invoice?.member?.nr_cartao}</div>` : '' }
                  </div>
                </div>
                
                <!-- Invoice Reference -->
                <div class="section">
                  <div class="section-title">REFERENTE À FATURA:</div>
                  <div class="section-content">
                    <div>Fatura Nº: ${creditNote.invoice?.numero || creditNote.factura_id}</div>
                    <div>Cliente: ${creditNote.invoice?.member_name || 'N/A'}</div>
                    <div>Total da Fatura: ${formatCurrency(creditNote.invoice?.total || 0)} MT</div>
                  </div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Credit Details -->
                <div class="section">
                  <div class="section-title">DETALHES DO CRÉDITO:</div>
                  <div class="section-content">
                    <div><strong>Motivo:</strong> ${creditNote.motivo}</div>
                    <div><strong>Tipo de Crédito:</strong> ${creditNote.tipo === 'total' ? 'Crédito Total' : 'Crédito Parcial'}</div>
                    ${creditNote.aprovado_por ? `<div><strong>Aprovado por:</strong> ${creditNote.approved_by?.name || 'Sistema'}</div>` : ''}
                    ${creditNote.data_aprovacao ? `<div><strong>Data de Aprovação:</strong> ${formatDate(creditNote.data_aprovacao)}</div>` : ''}
                  </div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Credit Amount Table -->
                <div class="section">
                  <div class="section-title">DISCRIMINAÇÃO DO CRÉDITO:</div>
                  <table class="table">
                    <thead>
                      <tr>
                        <th style="width: 5%;">#</th>
                        <th style="width: 60%;">Descrição</th>
                        <th style="width: 10%;">Qtd</th>
                        <th style="width: 25%;">Valor do Crédito</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="text-center">1</td>
                        <td class="text-left">Crédito referente à fatura ${creditNote.invoice?.numero || creditNote.factura_id}</td>
                        <td class="text-center">1.00</td>
                        <td class="text-right" style="font-weight: bold;">${formatCurrency(creditNote.valor_credito)} MT</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <!-- Summary Section -->
                <div class="summary-section">
                  <div class="payment-methods">
                    <div class="payment-title">Método de Pagamentos:</div>
                    <div class="payment-content">
                      <div>Mpesa: ${companyConfig?.mpesa_number || '84 01 35 981'}</div>
                      <div>Emola: ${companyConfig?.emola_number || '87 01 35 983'}</div>
                      <div>BCI</div>
                      <div>Conta: ${companyConfig?.bci_account || '2269 1142 2100.01'}</div>
                      <div>NIB: ${companyConfig?.bci_nib || '0008.0000.26911422101.13'}</div>
                    </div>
                  </div>
                  
                  <div class="financial-summary">
                    <div class="summary-title">RESUMO FINANCEIRO:</div>
                    <div class="summary-content">
                      <div class="summary-row">
                        <span>Valor do Crédito:</span>
                        <span>${formatCurrency(creditNote.valor_credito)} MT</span>
                      </div>
                      <div class="total-row">
                        <span>Total:</span>
                        <span>-${formatCurrency(creditNote.valor_credito)} MT</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Footer -->
                <div class="footer">
                  <div style="margin-bottom: 5px;">
                    Esta nota de crédito é válida sem assinatura, conforme legislação vigente.
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

      <div ref={printRef} className="credit-note-container" style={{ maxWidth: '794px', margin: '0 auto', position: 'relative', background: 'white' }}>
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
                <div><strong>{companyConfig?.nome_empresa || 'Hefel Lda'}</strong></div>
                <div>NUIT: {companyConfig?.nuit || '401059330'}</div>
                <div>Endereço: {companyConfig?.endereco || 'Av Cardeal Alexandre dos Santos, Maputo'}</div>
                <div>Email: {companyConfig?.email || 'hefel.lda@gmail.com'}</div>
                <div>Telefone: {companyConfig?.telefone1 || '+258 87 01 35 980'} / {companyConfig?.telefone2 || '+258 87 01 35 983'}</div>
              </div>
            </div>
            
            <div className="credit-note-header" style={{ flex: 1, textAlign: 'right' }}>
              <div className="credit-note-title" style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>NOTA DE CRÉDITO</div>
              <div className="credit-note-number">Nº: {creditNote.numero}</div>
              <div className="credit-note-dates" style={{ fontSize: '11px', lineHeight: 1.3 }}>
                <div>Data de Emissão: {formatDate(creditNote.data_emissao)}</div>
                <div>Tipo: <span className="inline-block bg-gray-900 text-white px-2 py-1 rounded text-xs font-bold">{creditNote.tipo.toUpperCase()}</span></div>
              </div>
            </div>
          </div>
          
          {/* Separator */}
          <div className="separator" style={{ borderBottom: '1px solid #000', margin: '15px 0' }}></div>
          
          {/* Invoice Reference */}
          <div className="section" style={{ marginBottom: '20px' }}>
            <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', fontSize: '11px' }}>REFERENTE À FATURA:</div>
            <div className="section-content" style={{ fontSize: '11px', lineHeight: 1.3 }}>
              <div>Fatura Nº: {creditNote.invoice?.numero || creditNote.factura_id}</div>
              {(creditNote.invoice?.member?.name || creditNote.invoice?.member_name) && (
                <div>Cliente: {creditNote.invoice?.member?.name || creditNote.invoice?.member_name}</div>
              )}
              <div>Total da Fatura: {formatCurrency(creditNote.invoice?.total || 0)} MT</div>
            </div>
          </div>
          
          {/* Separator */}
          <div className="separator" style={{ borderBottom: '1px solid #000', margin: '15px 0' }}></div>
          
          {/* Credit Details */}
          <div className="section" style={{ marginBottom: '20px' }}>
            <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', fontSize: '11px' }}>DETALHES DO CRÉDITO:</div>
            <div className="section-content" style={{ fontSize: '11px', lineHeight: 1.3 }}>
              <div><strong>Motivo:</strong> {creditNote.motivo}</div>
              <div><strong>Tipo de Crédito:</strong> {creditNote.tipo === 'total' ? 'Crédito Total' : 'Crédito Parcial'}</div>
              {creditNote.aprovado_por && (
                <div><strong>Aprovado por:</strong> {creditNote.approved_by?.name || 'Sistema'}</div>
              )}
              {creditNote.data_aprovacao && (
                <div><strong>Data de Aprovação:</strong> {formatDate(creditNote.data_aprovacao)}</div>
              )}
            </div>
          </div>
          
          {/* Separator */}
          <div className="separator" style={{ borderBottom: '1px solid #000', margin: '15px 0' }}></div>
          
          {/* Credit Amount Table */}
          <div className="section" style={{ marginBottom: '20px' }}>
            <div className="section-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', fontSize: '11px' }}>DISCRIMINAÇÃO DO CRÉDITO:</div>
            
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr>
                  <th style={{ width: '5%', textAlign: 'center', padding: '5px', fontWeight: 'bold', borderBottom: '1px solid #000' }}>#</th>
                  <th style={{ width: '60%', textAlign: 'center', padding: '5px', fontWeight: 'bold', borderBottom: '1px solid #000' }}>Descrição</th>
                  <th style={{ width: '10%', textAlign: 'center', padding: '5px', fontWeight: 'bold', borderBottom: '1px solid #000' }}>Qtd</th>
                  <th style={{ width: '25%', textAlign: 'center', padding: '5px', fontWeight: 'bold', borderBottom: '1px solid #000' }}>Valor do Crédito</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '5px', borderBottom: '1px solid #ccc', textAlign: 'center' }}>1</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #ccc', textAlign: 'left' }}>Crédito referente à fatura {creditNote.invoice?.numero || creditNote.factura_id}</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #ccc', textAlign: 'center' }}>1.00</td>
                  <td style={{ padding: '5px', borderBottom: '1px solid #ccc', textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>{formatCurrency(creditNote.valor_credito)} MT</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Summary Section */}
          <div className="summary-section" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div className="payment-methods" style={{ flex: 1, marginRight: '20px' }}>
              <div className="payment-title" style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '11px' }}>Método de Pagamentos:</div>
              <div className="payment-content" style={{ fontSize: '10px', lineHeight: 1.3 }}>
                <div>Mpesa: {companyConfig?.mpesa_number || '84 01 35 981'}</div>
                <div>Emola: {companyConfig?.emola_number || '87 01 35 983'}</div>
                <div>BCI</div>
                <div>Conta: {companyConfig?.bci_account || '2269 1142 2100.01'}</div>
                <div>NIB: {companyConfig?.bci_nib || '0008.0000.26911422101.13'}</div>
              </div>
            </div>
            
            <div className="financial-summary" style={{ flex: 1, textAlign: 'right' }}>
              <div className="summary-title" style={{ fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', fontSize: '11px', textAlign: 'left' }}>RESUMO FINANCEIRO:</div>
              <div className="summary-content" style={{ fontSize: '11px', lineHeight: 1.5 }}>
                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span>Valor Original:</span>
                  <span>{formatCurrency(creditNote.invoice?.total || 0)} MT</span>
                </div>
                <div className="total-row" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid #000', paddingTop: '3px', color: '#dc2626' }}>
                  <span>Valor do Crédito:</span>
                  <span>-{formatCurrency(creditNote.valor_credito)} MT</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="footer" style={{ textAlign: 'center', fontSize: '9px', color: '#666', marginTop: '30px' }}>
            Esta nota de crédito é válida sem assinatura, conforme legislação vigente.<br />
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
          .credit-note-container {
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
          .credit-note-header {
            flex: 1 !important;
            text-align: right !important;
          }
          .credit-note-title {
            font-size: 16px !important;
            font-weight: bold !important;
            margin-bottom: 10px !important;
            text-transform: uppercase !important;
            color: #dc2626 !important;
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
            color: #dc2626 !important;
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
export const CreditNotePDFButton: React.FC<CreditNotePDFProps> = ({ creditNote, companyConfig }) => {
  const [showPreview, setShowPreview] = React.useState(false);

  return (
    <>
      <Button
        onClick={() => setShowPreview(true)}
        variant="outline"
        size="sm"
        className="ml-2 bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
      >
        <FileDown className="h-4 w-4 mr-1" />
        Nota de Crédito
      </Button>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto" role="dialog" aria-modal="true" aria-describedby="credit-note-preview-description">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Pré-visualização da Nota de Crédito</h3>
              <Button onClick={() => setShowPreview(false)} variant="outline" size="sm">
                Fechar
              </Button>
            </div>
            <div className="p-4">
              <div id="credit-note-preview-description" className="sr-only">
                Pré-visualização da nota de crédito {creditNote.numero}
              </div>
              <CreditNotePDFPreview creditNote={creditNote} companyConfig={companyConfig} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreditNotePDFPreview; 