import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { Invoice } from '@/types/billing';

interface InvoicePreviewProps {
  invoice: Invoice;
  companyConfig?: any;
  onPrint?: () => void;
}

export default function InvoicePreview({ invoice, companyConfig, onPrint }: InvoicePreviewProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT');
  };

  // Default company config if not provided
  const defaultConfig = {
    nome_empresa: "Hefel Lda",
    nuit: "401059330",
    endereco: "Av Cardeal Alexandre dos Santos, Maputo",
    email: "hefel.lda@gmail.com",
    telefone1: "+258 87 01 35 980",
    telefone2: "+258 87 01 35 983",
    logo: "/image.png",
    mpesa_number: "84 01 35 981",
    emola_number: "87 01 35 983",
    bci_account: "2269 1142 2100.01",
    bci_nib: "0008.0000.26911422101.13"
  };

  const config = companyConfig || defaultConfig;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 no-print">
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Imprimir Factura
          </Button>
        </div>

        <div className="bg-white shadow-lg p-8 relative">
        
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <div className="text-8xl font-bold text-gray-400 rotate-[-30deg] select-none">
              {config.logo && <img src={config.logo} alt="Logo" className="w-64 h-64 object-contain" />}
            </div>
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <img
                    src={config.logo || "/image.png"}
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
                    <strong>{config.nome_empresa}</strong>
                  </div>
                  <div>NUIT: {config.nuit}</div>
                  <div>Endereço: {config.endereco}</div>
                  <div>Email: {config.email}</div>
                  <div>Telefone: {config.telefone1} / {config.telefone2}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold mb-4">FACTURA COMERCIAL</div>
                <div className="text-sm space-y-1">
                  <div>
                    <strong>Nº: {invoice.numero}</strong>
                  </div>
                  <div>Data de Emissão: {formatDate(invoice.data_emissao)}</div>
                  <div>Data de Vencimento: {formatDate(invoice.data_vencimento)}</div>
                </div>
              </div>
            </div>

           
            <div className="border-t-2 border-black my-6"></div>

            {/* Client Information */}
            <div className="mb-8">
              <div className="font-bold text-sm mb-3">DADOS DO CLIENTE:</div>
              <div className="text-sm space-y-1">
                <div>Nome: {invoice.member_name || 'N/A'}</div>
                <div>Telefone: {invoice.member_phone || 'N/A'}</div>
                <div>Email: {invoice.member_email || 'N/A'}</div>
                <div>ID: {invoice.member_nr_cartao || invoice.member_id || 'N/A'}</div>
              </div>
            </div>

         
            <div className="border-t-2 border-black my-6"></div>

            {/* Products Table */}
            <div className="mb-8">
              <div className="font-bold text-sm mb-4">DISCRIMINAÇÃO DOS SERVIÇOS/PRODUTOS:</div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="text-left py-2 px-1 text-sm font-bold w-8">#</th>
                    <th className="text-left py-2 px-1 text-sm font-bold">Descrição</th>
                    <th className="text-center py-2 px-1 text-sm font-bold w-16">Qtd</th>
                    <th className="text-right py-2 px-1 text-sm font-bold w-24">Preço Unit.</th>
                    <th className="text-right py-2 px-1 text-sm font-bold w-20">Desconto</th>
                    <th className="text-right py-2 px-1 text-sm font-bold w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="py-3 px-1 text-sm">1</td>
                    <td className="py-3 px-1 text-sm">{invoice.descricao_servico}</td>
                    <td className="py-3 px-1 text-sm text-center">{invoice.quantidade}</td>
                    <td className="py-3 px-1 text-sm text-right">{formatCurrency(invoice.preco_unitario)}</td>
                    <td className="py-3 px-1 text-sm text-right">0.00</td>
                    <td className="py-3 px-1 text-sm text-right">{formatCurrency(invoice.subtotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

         
            <div className="flex flex-col space-y-8 mb-8">
            
              <div className="flex justify-between items-start">
                <div className="font-bold text-sm">RESUMO FINANCEIRO:</div>
                <div className="text-right space-y-1 mt-9">
                  <div className="flex justify-between text-sm min-w-[200px]">
                    <span>Subtotal:</span>
                    <span className="ml-8">{formatCurrency(invoice.subtotal)} MT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>IVA ({invoice.taxa_iva}%):</span>
                    <span className="ml-8">{formatCurrency(invoice.valor_iva)} MT</span>
                  </div>
                  <div className="border-t border-black pt-1">
                    <div className="flex justify-between text-sm font-bold">
                      <span>Total:</span>
                      <span className="ml-8">{formatCurrency(invoice.total)} MT</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="font-bold text-sm mb-3">Método de Pagamentos:</div>
                <div className="text-xs space-y-1">
                  <div>Mpesa {config.mpesa_number || '84 01 35 981'}</div>
                  <div>Emola {config.emola_number || '87 01 35 983'}</div>
                  <div>BCI</div>
                  <div>Conta: {config.bci_account || '2269 1142 2100.01'}</div>
                  <div>NIB: {config.bci_nib || '0008.0000.26911422101.13'}</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-gray-600 mt-12 space-y-1">
              <div>Esta factura é válida sem assinatura, conforme legislação vigente.</div>
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
} 