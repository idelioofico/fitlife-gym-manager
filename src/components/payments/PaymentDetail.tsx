
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, CreditCard, Download, Mail, Phone, User } from 'lucide-react';

interface PaymentDetailProps {
  payment: any;
  onClose: () => void;
  onGenerateReceipt: () => void;
}

const PaymentDetail: React.FC<PaymentDetailProps> = ({ 
  payment, 
  onClose,
  onGenerateReceipt
}) => {
  if (!payment || !payment.members) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd/MM/yyyy');
  };
  
  const getPaymentStatusVariant = (status) => {
    switch (status) {
      case 'Pago': return 'default';
      case 'Pendente': return 'outline';
      case 'Falhado': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold">Detalhes do Pagamento</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getPaymentStatusVariant(payment.status)}>
              {payment.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Ref: {payment.reference_id}
            </span>
          </div>
        </div>
        <Button onClick={onGenerateReceipt}>
          <Download className="h-4 w-4 mr-2" />
          Gerar Recibo
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Pagamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Valor</p>
                <p className="text-lg">{Number(payment.amount).toLocaleString('pt-MZ')} MZN</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Plano</p>
                <p className="text-sm text-muted-foreground">{payment.plan}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Método de Pagamento</p>
                <p className="text-sm text-muted-foreground">{payment.method}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CalendarClock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Data do Pagamento</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(payment.payment_date)}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <CalendarClock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Data de Registo</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(payment.created_at)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Informações do Utente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Nome</p>
                <p className="text-sm text-muted-foreground">{payment.members.name}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{payment.members.email}</p>
              </div>
            </div>
            
            {payment.members.phone && (
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Telefone</p>
                  <p className="text-sm text-muted-foreground">{payment.members.phone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </div>
  );
};

export default PaymentDetail;
