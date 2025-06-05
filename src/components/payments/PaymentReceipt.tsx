import { forwardRef } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  gymSettings: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

const PaymentReceipt = forwardRef<HTMLDivElement, PaymentReceiptProps>(({ payment, gymSettings }, ref) => {
  if (!payment) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'Pago':
        return 'Pago';
      case 'Pendente':
        return 'Pendente';
      case 'Cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const formatAmount = (amount: number | string) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numericAmount.toFixed(2);
  };

  return (
    <div ref={ref} className="max-w-2xl mx-auto bg-white p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{gymSettings.name}</h1>
        <p className="text-gray-600">{gymSettings.address}</p>
        <p className="text-gray-600">Tel: {gymSettings.phone}</p>
        <p className="text-gray-600">Email: {gymSettings.email}</p>
      </div>

      <div className="border-t border-b border-gray-200 py-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Referência</p>
            <p className="font-semibold">{payment.reference_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Data</p>
            <p className="font-semibold">{formatDate(payment.payment_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-semibold">{getPaymentStatusText(payment.status)}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Cliente</h2>
        <p className="font-medium">{payment.member_name}</p>
        {payment.member_email && <p className="text-gray-600">{payment.member_email}</p>}
        {payment.member_phone && <p className="text-gray-600">{payment.member_phone}</p>}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Descrição do Pagamento</h2>
        <p className="text-gray-600">Mensalidade - {payment.plan_name}</p>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Método de Pagamento</p>
            <p className="font-semibold">{payment.payment_method}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Valor Total</p>
            <p className="text-xl font-bold">R$ {formatAmount(payment.amount)}</p>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>Este é um recibo de pagamento gerado automaticamente.</p>
        <p>Data de emissão: {formatDate(new Date().toISOString())}</p>
      </div>
    </div>
  );
});

PaymentReceipt.displayName = 'PaymentReceipt';

export default PaymentReceipt;
