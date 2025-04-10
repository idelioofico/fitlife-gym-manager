
import React, { forwardRef } from 'react';
import { format } from 'date-fns';

interface PaymentReceiptProps {
  payment: any;
  gymSettings?: any;
}

const PaymentReceipt = forwardRef<HTMLDivElement, PaymentReceiptProps>(({ 
  payment, 
  gymSettings 
}, ref) => {
  if (!payment || !payment.members) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy');
  };
  
  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'Pago': return 'PAGO';
      case 'Pendente': return 'PENDENTE';
      case 'Falhado': return 'NÃO PAGO';
      default: return status?.toUpperCase() || 'N/A';
    }
  };

  return (
    <div ref={ref} className="bg-white p-6 mx-auto max-w-[21cm] shadow-lg print:shadow-none">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">{gymSettings?.gym_name || 'FitLife Academy'}</h1>
        <p className="text-sm">{gymSettings?.address || 'Av. Eduardo Mondlane, 123, Maputo'}</p>
        <p className="text-sm">{gymSettings?.phone || '+258 84 123 4567'} | {gymSettings?.email || 'contato@fitlife.co.mz'}</p>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold">RECIBO</h2>
        <p className="text-sm">Nº {payment.reference_id}</p>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Data:</span>
          <span>{formatDate(payment.payment_date || payment.created_at)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="font-semibold">Estado:</span>
          <span className={`font-bold ${payment.status === 'Pago' ? 'text-green-600' : payment.status === 'Pendente' ? 'text-amber-600' : 'text-red-600'}`}>
            {getPaymentStatusText(payment.status)}
          </span>
        </div>
      </div>
      
      <div className="border-t border-b py-4 mb-6">
        <div className="mb-4">
          <h3 className="font-semibold">Cliente:</h3>
          <p>{payment.members.name}</p>
          <p className="text-sm">{payment.members.email}</p>
          {payment.members.phone && <p className="text-sm">{payment.members.phone}</p>}
        </div>
      </div>
      
      <div className="mb-6">
        <table className="w-full">
          <thead className="border-b">
            <tr className="text-left">
              <th className="pb-2">Descrição</th>
              <th className="pb-2 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-3">
                <div>
                  <p>Pagamento de Mensalidade - Plano {payment.plan}</p>
                </div>
              </td>
              <td className="py-3 text-right">{Number(payment.amount).toLocaleString('pt-MZ')} MZN</td>
            </tr>
          </tbody>
          <tfoot className="border-t">
            <tr>
              <td className="pt-2 font-bold">Total</td>
              <td className="pt-2 text-right font-bold">{Number(payment.amount).toLocaleString('pt-MZ')} MZN</td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      <div className="mb-6">
        <p className="font-semibold">Método de Pagamento:</p>
        <p>{payment.method}</p>
      </div>
      
      <div className="text-center mt-12 text-sm">
        <p>Este documento serve como comprovativo de pagamento.</p>
        <p className="mt-1">Obrigado pela sua confiança.</p>
      </div>
      
      <div className="text-center mt-16 pt-8 border-t text-xs">
        <p>{gymSettings?.gym_name || 'FitLife Academy'} | {formatDate(new Date())}</p>
      </div>
    </div>
  );
});

PaymentReceipt.displayName = 'PaymentReceipt';

export default PaymentReceipt;
