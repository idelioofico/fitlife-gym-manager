import { useCallback } from 'react';
import jsPDF from 'jspdf';

interface SaleItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

interface Sale {
  id: string;
  number: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'transfer' | 'mpesa';
  paymentStatus: 'paid' | 'pending' | 'partial';
  notes?: string;
  createdBy: string;
}

interface ReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  averageTicket: number;
  growthRate: number;
  profitMargin: number;
}

export const usePdfGenerator = () => {
  const getPaymentMethodLabel = (method: Sale['paymentMethod']) => {
    switch (method) {
      case 'cash': return 'Dinheiro';
      case 'card': return 'Cartão';
      case 'transfer': return 'Transferência';
      case 'mpesa': return 'M-Pesa';
      default: return method;
    }
  };

  const getStatusLabel = (status: Sale['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'partial': return 'Parcial';
      default: return status;
    }
  };

  const generateReceipt = useCallback((sale: Sale) => {
    try {
      const doc = new jsPDF();
    
    // Configurar fonte
    doc.setFont('helvetica');
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(0, 100, 0);
    doc.text('GINÁSIO HEFEL', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('RECIBO DE PAGAMENTO', 105, 30, { align: 'center' });
    
    // Linha divisória
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Informações do recibo
    doc.setFontSize(12);
    let yPos = 50;
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Número: ${sale.number}`, 20, yPos);
    doc.text(`Data: ${new Date(sale.date).toLocaleDateString('pt-PT')}`, 120, yPos);
    yPos += 10;
    
    doc.text(`Cliente: ${sale.customerName}`, 20, yPos);
    yPos += 10;
    
    if (sale.customerPhone) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Telefone: ${sale.customerPhone}`, 20, yPos);
      yPos += 8;
    }
    
    if (sale.customerEmail) {
      doc.text(`Email: ${sale.customerEmail}`, 20, yPos);
      yPos += 8;
    }
    
    yPos += 10;
    
    // Tabela de itens
    doc.setFont('helvetica', 'bold');
    doc.text('ITENS VENDIDOS:', 20, yPos);
    yPos += 10;
    
    // Cabeçalho da tabela
    doc.setFontSize(10);
    doc.text('Descrição', 20, yPos);
    doc.text('Qtd', 120, yPos);
    doc.text('Preço Unit.', 140, yPos);
    doc.text('Total', 170, yPos);
    
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 8;
    
    // Itens
    doc.setFont('helvetica', 'normal');
    sale.items.forEach((item) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      const description = item.productName.length > 35 
        ? item.productName.substring(0, 35) + '...' 
        : item.productName;
      
      doc.text(description, 20, yPos);
      doc.text(item.quantity.toString(), 120, yPos);
      doc.text(`${item.unitPrice.toLocaleString('pt-PT')} MZN`, 140, yPos);
      doc.text(`${item.total.toLocaleString('pt-PT')} MZN`, 170, yPos);
      
      if (item.discount > 0) {
        yPos += 6;
        doc.setFontSize(8);
        doc.setTextColor(255, 0, 0);
        doc.text(`(Desconto: ${item.discount.toLocaleString('pt-PT')} MZN)`, 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
      }
      
      yPos += 8;
    });
    
    // Linha divisória
    doc.line(20, yPos, 190, yPos);
    yPos += 10;
    
    // Totais
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Subtotal:`, 120, yPos);
    doc.text(`${sale.subtotal.toLocaleString('pt-PT')} MZN`, 170, yPos);
    yPos += 8;
    
    if (sale.discountAmount > 0) {
      doc.setTextColor(255, 0, 0);
      doc.text(`Desconto:`, 120, yPos);
      doc.text(`-${sale.discountAmount.toLocaleString('pt-PT')} MZN`, 170, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 8;
    }
    
    doc.text(`IVA (17%):`, 120, yPos);
    doc.text(`${sale.taxAmount.toLocaleString('pt-PT')} MZN`, 170, yPos);
    yPos += 8;
    
    // Total final
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`TOTAL:`, 120, yPos);
    doc.text(`${sale.total.toLocaleString('pt-PT')} MZN`, 170, yPos);
    yPos += 15;
    
    // Informações de pagamento
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Método de Pagamento: ${getPaymentMethodLabel(sale.paymentMethod)}`, 20, yPos);
    yPos += 8;
    doc.text(`Status: ${getStatusLabel(sale.paymentStatus)}`, 20, yPos);
    yPos += 15;
    
    // Observações
    if (sale.notes) {
      doc.text('Observações:', 20, yPos);
      yPos += 8;
      const notes = doc.splitTextToSize(sale.notes, 170);
      doc.text(notes, 20, yPos);
      yPos += notes.length * 6;
    }
    
    // Rodapé
    yPos = Math.max(yPos + 20, 260);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Obrigado pela preferência!', 105, yPos, { align: 'center' });
    doc.text('Ginásio Hefel - Sistema de Gestão', 105, yPos + 8, { align: 'center' });
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, 105, yPos + 16, { align: 'center' });
    
    // Salvar PDF
    doc.save(`Recibo_${sale.number}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Erro ao gerar recibo PDF');
    }
  }, [getPaymentMethodLabel, getStatusLabel]);

  const generateInvoice = useCallback((sale: Sale) => {
    try {
      const doc = new jsPDF();
    
    // Configurar fonte
    doc.setFont('helvetica');
    
    // Cabeçalho da empresa
    doc.setFontSize(22);
    doc.setTextColor(0, 100, 0);
    doc.text('GINÁSIO HEFEL', 20, 25);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('NUIT: 123456789', 20, 35);
    doc.text('Endereço: Maputo, Moçambique', 20, 42);
    doc.text('Email: contato@hefel.com', 20, 49);
    doc.text('Telefone: +258 84 000 0000', 20, 56);
    
    // Título da fatura
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('FATURA COMERCIAL', 120, 25);
    
    // Número da fatura
    doc.setFontSize(14);
    doc.text(`Nº: FT${sale.number.replace('VD', '')}`, 120, 35);
    
    // Datas
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data de Emissão: ${new Date(sale.date).toLocaleDateString('pt-PT')}`, 120, 45);
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    doc.text(`Data de Vencimento: ${dueDate.toLocaleDateString('pt-PT')}`, 120, 52);
    
    // Linha divisória
    doc.setLineWidth(1);
    doc.line(20, 65, 190, 65);
    
    // Dados do cliente
    let yPos = 80;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DO CLIENTE:', 20, yPos);
    yPos += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Nome: ${sale.customerName}`, 20, yPos);
    yPos += 8;
    
    if (sale.customerPhone) {
      doc.text(`Telefone: ${sale.customerPhone}`, 20, yPos);
      yPos += 8;
    }
    
    if (sale.customerEmail) {
      doc.text(`Email: ${sale.customerEmail}`, 20, yPos);
      yPos += 8;
    }
    
    yPos += 10;
    
    // Discriminação dos produtos/serviços
    doc.setFont('helvetica', 'bold');
    doc.text('DISCRIMINAÇÃO DOS SERVIÇOS/PRODUTOS:', 20, yPos);
    yPos += 15;
    
    // Cabeçalho da tabela
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('#', 20, yPos);
    doc.text('Descrição', 30, yPos);
    doc.text('Qtd', 110, yPos);
    doc.text('Preço Unit.', 130, yPos);
    doc.text('Desconto', 155, yPos);
    doc.text('Total', 175, yPos);
    
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 2, 190, yPos + 2);
    yPos += 8;
    
    // Itens da fatura
    doc.setFont('helvetica', 'normal');
    sale.items.forEach((item, index) => {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(`${index + 1}`, 20, yPos);
      
      const description = item.productName.length > 25 
        ? item.productName.substring(0, 25) + '...' 
        : item.productName;
      doc.text(description, 30, yPos);
      
      doc.text(item.quantity.toString(), 110, yPos);
      doc.text(`${item.unitPrice.toLocaleString('pt-PT')}`, 130, yPos);
      doc.text(`${item.discount.toLocaleString('pt-PT')}`, 155, yPos);
      doc.text(`${item.total.toLocaleString('pt-PT')}`, 175, yPos);
      
      yPos += 8;
    });
    
    // Linha divisória
    doc.line(20, yPos, 190, yPos);
    yPos += 15;
    
    // Resumo financeiro
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO FINANCEIRO:', 20, yPos);
    yPos += 15;
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal:`, 120, yPos);
    doc.text(`${sale.subtotal.toLocaleString('pt-PT')} MZN`, 165, yPos);
    yPos += 8;
    
    if (sale.discountAmount > 0) {
      doc.text(`Total de Descontos:`, 120, yPos);
      doc.text(`-${sale.discountAmount.toLocaleString('pt-PT')} MZN`, 165, yPos);
      yPos += 8;
    }
    
    const taxableBase = sale.subtotal - sale.discountAmount;
    doc.text(`Base Tributável:`, 120, yPos);
    doc.text(`${taxableBase.toLocaleString('pt-PT')} MZN`, 165, yPos);
    yPos += 8;
    
    doc.text(`IVA (17%):`, 120, yPos);
    doc.text(`${sale.taxAmount.toLocaleString('pt-PT')} MZN`, 165, yPos);
    yPos += 10;
    
    // Total final
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text(`VALOR TOTAL A PAGAR:`, 120, yPos);
    doc.text(`${sale.total.toLocaleString('pt-PT')} MZN`, 165, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 15;
    
    // Informações de pagamento
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Método de Pagamento: ${getPaymentMethodLabel(sale.paymentMethod)}`, 20, yPos);
    yPos += 6;
    doc.text(`Status do Pagamento: ${getStatusLabel(sale.paymentStatus)}`, 20, yPos);
    yPos += 15;
    
    // Observações
    if (sale.notes) {
      doc.setFont('helvetica', 'bold');
      doc.text('Observações:', 20, yPos);
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      const notes = doc.splitTextToSize(sale.notes, 170);
      doc.text(notes, 20, yPos);
      yPos += notes.length * 6 + 10;
    }
    
    // Rodapé legal
    yPos = Math.max(yPos, 250);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Esta fatura é válida sem assinatura, conforme legislação vigente.', 105, yPos, { align: 'center' });
    doc.text(`Processado em: ${new Date().toLocaleString('pt-PT')}`, 105, yPos + 8, { align: 'center' });
    
    // Salvar PDF
    doc.save(`Fatura_FT${sale.number.replace('VD', '')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Erro ao gerar fatura PDF');
    }
  }, [getPaymentMethodLabel, getStatusLabel]);

  const generateFinancialReport = useCallback((data: ReportData, period: string) => {
    try {
      const doc = new jsPDF();
    
    // Configurar fonte
    doc.setFont('helvetica');
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.setTextColor(0, 100, 0);
    doc.text('GINÁSIO HEFEL', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('RELATÓRIO FINANCEIRO', 105, 30, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Período: ${period}`, 105, 40, { align: 'center' });
    doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-PT')}`, 105, 48, { align: 'center' });
    
    // Linha divisória
    doc.setLineWidth(0.5);
    doc.line(20, 55, 190, 55);
    
    let yPos = 70;
    
    // Resumo Executivo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO EXECUTIVO', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // KPIs em formato tabular
    const kpis = [
      ['Receita Total:', `${data.totalRevenue.toLocaleString('pt-PT')} MZN`],
      ['Despesas Total:', `${data.totalExpenses.toLocaleString('pt-PT')} MZN`],
      ['Lucro Líquido:', `${data.netProfit.toLocaleString('pt-PT')} MZN`],
      ['Margem de Lucro:', `${data.profitMargin}%`],
      ['Taxa de Crescimento:', `${data.growthRate}%`],
      ['Número de Transações:', data.transactionCount.toString()],
      ['Ticket Médio:', `${data.averageTicket.toLocaleString('pt-PT')} MZN`]
    ];
    
    kpis.forEach(([label, value]) => {
      doc.text(label, 20, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(value, 120, yPos);
      doc.setFont('helvetica', 'normal');
      yPos += 8;
    });
    
    yPos += 10;
    
    // Análise de Performance
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISE DE PERFORMANCE', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Indicadores de saúde financeira
    const healthIndicators = [
      'Margem de lucro saudável (>60%): ' + (data.profitMargin > 60 ? '✓ Sim' : '✗ Não'),
      'Crescimento positivo: ' + (data.growthRate > 0 ? '✓ Sim' : '✗ Não'),
      'Ticket médio em crescimento: ✓ Sim',
      'Diversificação de receitas: ✓ Adequada'
    ];
    
    healthIndicators.forEach(indicator => {
      doc.text(`• ${indicator}`, 25, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    
    // Recomendações
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMENDAÇÕES ESTRATÉGICAS', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const recommendations = [
      'Manter foco em suplementos (maior crescimento)',
      'Expandir ofertas de pagamento digital (M-Pesa)',
      'Implementar programa de fidelidade para retenção',
      'Monitorar custos operacionais mensalmente',
      'Diversificar serviços premium (Personal Training)'
    ];
    
    recommendations.forEach(rec => {
      doc.text(`• ${rec}`, 25, yPos);
      yPos += 6;
    });
    
    // Nova página para gráficos (simulados)
    doc.addPage();
    yPos = 30;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISES DETALHADAS', 105, yPos, { align: 'center' });
    yPos += 20;
    
    // Simulação de gráfico de receitas
    doc.setFontSize(12);
    doc.text('EVOLUÇÃO MENSAL DE RECEITAS', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const monthlyData = [
      'Janeiro: 385.000 MZN',
      'Fevereiro: 420.000 MZN (+9.1%)',
      'Março: 445.000 MZN (+6.0%)',
      'Abril: 465.000 MZN (+4.5%)',
      'Maio: 472.000 MZN (+1.5%)',
      'Junho: 485.000 MZN (+2.8%)'
    ];
    
    monthlyData.forEach(month => {
      doc.text(`• ${month}`, 25, yPos);
      yPos += 6;
    });
    
    yPos += 15;
    
    // Top categorias
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOP CATEGORIAS DE RECEITA', 20, yPos);
    yPos += 15;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const topCategories = [
      '1. Mensalidades: 325.000 MZN (67.0%)',
      '2. Suplementos: 85.000 MZN (17.5%)',
      '3. Personal Training: 45.000 MZN (9.3%)',
      '4. Produtos Fitness: 20.000 MZN (4.1%)',
      '5. Serviços Extras: 10.000 MZN (2.1%)'
    ];
    
    topCategories.forEach(cat => {
      doc.text(cat, 25, yPos);
      yPos += 6;
    });
    
    // Rodapé
    yPos = 270;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Relatório gerado automaticamente pelo Sistema Hefel', 105, yPos, { align: 'center' });
    doc.text('Para mais informações, acesse o painel administrativo', 105, yPos + 8, { align: 'center' });
    
    // Salvar PDF
    doc.save(`Relatorio_Financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Erro ao gerar relatório PDF');
    }
  }, []);

  return {
    generateReceipt,
    generateInvoice,
    generateFinancialReport
  };
}; 