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
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
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
        return status || 'N/A';
    }
  };

  const formatAmount = (amount: number | string) => {
    if (!amount) return '0.00';
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return numericAmount.toFixed(2);
  };

  return (
    <div ref={ref} className="receipt-content" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {gymSettings?.name || 'Ginásio'}
        </h1>
        <p className="text-gray-600 text-lg">{gymSettings?.address || 'Endereço não definido'}</p>
        <p className="text-gray-600">Tel: {gymSettings?.phone || 'Telefone não definido'}</p>
        <p className="text-gray-600">Email: {gymSettings?.email || 'Email não definido'}</p>
      </div>

      {/* Receipt Info */}
      <div className="mb-6 border-b border-gray-200 pb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Referência</p>
            <p className="text-lg font-bold text-gray-800">{payment.reference_id || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Data</p>
            <p className="text-lg font-bold text-gray-800">{formatDate(payment.payment_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Status</p>
            <p className="text-lg font-bold text-green-600">{getPaymentStatusText(payment.status)}</p>
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
          Informações do Cliente
        </h2>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-lg font-semibold text-gray-800 mb-1">
            {payment.member_name || 'Nome não disponível'}
          </p>
          {payment.member_email && (
            <p className="text-gray-600">Email: {payment.member_email}</p>
          )}
          {payment.member_phone && (
            <p className="text-gray-600">Telefone: {payment.member_phone}</p>
          )}
        </div>
      </div>

      {/* Payment Details */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">
          Detalhes do Pagamento
        </h2>
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-lg text-gray-800">
            <span className="font-semibold">Descrição:</span> Mensalidade - {payment.plan_name || 'Plano não definido'}
          </p>
          <p className="text-lg text-gray-800 mt-2">
            <span className="font-semibold">Método de Pagamento:</span> {payment.payment_method || 'N/A'}
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="border-t-2 border-gray-300 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Valor Total</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-800">
              {formatAmount(payment.amount)} MZN
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-8 pt-4 border-t border-gray-200">
        <p>Este é um recibo de pagamento gerado automaticamente.</p>
        <p>Data de emissão: {formatDate(new Date().toISOString())}</p>
        <p className="mt-2 text-xs">
          Para dúvidas ou esclarecimentos, entre em contacto connosco.
        </p>
      </div>
    </div>
  );
});

PaymentReceipt.displayName = 'PaymentReceipt';

export default PaymentReceipt;
