import { Invoice, Receipt } from '@/types/billing';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export class PDFGenerator {
  private static formatCurrency(amount: number): string {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '0.00';
    }
    return amount.toLocaleString('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-PT');
  }

  static async generateInvoicePDF(invoice: Invoice, companyConfig: any): Promise<void> {
    try {
      // Cria um div temporário com o layout EXATO da imagem
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '794px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.4';
      tempDiv.style.color = '#333';
      
      // Template EXATO da imagem
      tempDiv.innerHTML = `
        <div style="position: relative; max-width: 794px; margin: 0 auto; background: white;">
          <!-- Marca d'água com a imagem do logo -->
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); z-index: 1; pointer-events: none; opacity: 0.1;">
            <img src="/image.png" alt="TEFEL GYM Logo" style="width: 200px; height: auto;" />
          </div>
          
          <!-- Cabeçalho -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; position: relative; z-index: 2;">
            <!-- Informações da Empresa (Esquerda) -->
            <div style="flex: 1;">
              <!-- Logo TEFEL GYM -->
              <div style="margin-bottom: 10px;">
                <div style="display: flex; align-items: center; margin-bottom: 5px;">
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
              </div>
              
              <div style="font-size: 11px; line-height: 1.3;">
                <div><strong>Hefel Lda</strong></div>
                <div>NUIT: 401059330</div>
                <div>Endereço: Av Cardeal Alxexandre dos Santos, Maputo, Moçambique</div>
                <div>Email: hefel.lda@gmail.com</div>
                <div>Telefone: +258 87 01 35 980 / 87 01 35 983</div>
              </div>
            </div>
            
            <!-- Detalhes da Fatura (Direita) -->
            <div style="flex: 1; text-align: right;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase;">
                FACTURA COMERCIAL
              </div>
              <div style="font-size: 11px; line-height: 1.3;">
                <div><strong>N°: FT${invoice.numero}</strong></div>
                <div>Data de Emissão: ${this.formatDate(invoice.data_emissao)}</div>
                <div>Data de Vencimento: ${this.formatDate(invoice.data_vencimento)}</div>
              </div>
            </div>
          </div>
          
          <!-- Linha separadora -->
          <div style="border-bottom: 1px solid #000; margin: 15px 0; position: relative; z-index: 2;"></div>
          
          <!-- Dados do Cliente -->
          <div style="margin-bottom: 20px; position: relative; z-index: 2;">
            <div style="font-weight: bold; text-transform: uppercase; margin-bottom: 8px; font-size: 11px;">
              DADOS DO CLIENTE:
            </div>
            <div style="font-size: 11px; line-height: 1.3;">
              <div>Nome: ${invoice.member?.name || 'N/A'}</div>
              <div>Telefone: ${invoice.member?.phone || 'N/A'}</div>
              <div>Nr de cartão: ${invoice.member?.nr_cartao || 'N/A'}</div>
            </div>
          </div>
          
          <!-- Linha separadora -->
          <div style="border-bottom: 1px solid #000; margin: 15px 0; position: relative; z-index: 2;"></div>
          
          <!-- Tabela de Produtos/Serviços -->
          <div style="margin-bottom: 20px; position: relative; z-index: 2;">
            <div style="font-weight: bold; text-transform: uppercase; margin-bottom: 8px; font-size: 11px;">
              DISCRIMINAÇÃO DOS SERVIÇOS/PRODUTOS:
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
              <thead>
                <tr style="border-bottom: 1px solid #000;">
                  <th style="text-align: center; padding: 5px; font-weight: bold; width: 5%;">#</th>
                  <th style="text-align: left; padding: 5px; font-weight: bold; width: 45%;">Descrição</th>
                  <th style="text-align: center; padding: 5px; font-weight: bold; width: 10%;">Qtd</th>
                  <th style="text-align: right; padding: 5px; font-weight: bold; width: 15%;">Preço Unit.</th>
                  <th style="text-align: right; padding: 5px; font-weight: bold; width: 10%;">Desconto</th>
                  <th style="text-align: right; padding: 5px; font-weight: bold; width: 15%;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #ccc;">
                  <td style="text-align: center; padding: 5px;">1</td>
                  <td style="text-align: left; padding: 5px;">${invoice.descricao_servico || 'Serviço de Ginásio'}</td>
                  <td style="text-align: center; padding: 5px;">1.00</td>
                  <td style="text-align: right; padding: 5px;">${this.formatCurrency(invoice.preco_unitario)} MT</td>
                  <td style="text-align: right; padding: 5px;">0.00 MT</td>
                  <td style="text-align: right; padding: 5px;">${this.formatCurrency(invoice.subtotal)} MT</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Resumo Financeiro e Métodos de Pagamento -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; position: relative; z-index: 2;">
            <!-- Métodos de Pagamento (Esquerda) -->
            <div style="flex: 1; margin-right: 20px;">
              <div style="font-weight: bold; margin-bottom: 8px; font-size: 11px;">
                Método de Pagamentos:
              </div>
              <div style="font-size: 10px; line-height: 1.3;">
                <div>Mpesa 84 01 35 981</div>
                <div>Emola 87 01 35 983</div>
                <div>BCI</div>
                <div>Conta: 2269 1142 2100 01</div>
                <div>NIB: 0008.0000.26911422101.13</div>
              </div>
            </div>
            
            <!-- Resumo Financeiro (Direita) -->
            <div style="flex: 1; text-align: right;">
              <div style="font-weight: bold; text-transform: uppercase; margin-bottom: 8px; font-size: 11px; text-align: left;">
                RESUMO FINANCEIRO:
              </div>
              <div style="font-size: 11px; line-height: 1.5;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                  <span>Subtotal:</span>
                  <span>${this.formatCurrency(invoice.subtotal)} MT</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                  <span>IVA (16%):</span>
                  <span>${this.formatCurrency(invoice.valor_iva)} MT</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 1px solid #000; padding-top: 3px;">
                  <span>Total:</span>
                  <span>${this.formatCurrency(invoice.total)} MT</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Rodapé -->
          <div style="text-align: center; font-size: 9px; color: #666; margin-top: 30px; position: relative; z-index: 2;">
            <div style="margin-bottom: 5px;">
              Esta factura é válida sem assinatura, conforme legislação vigente.
            </div>
            <div>
              Processado em: ${new Date().toLocaleDateString('pt-PT')}, ${new Date().toLocaleTimeString('pt-PT')}
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      // Gera o PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(tempDiv);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`Fatura_${invoice.numero}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF da fatura:', error);
      throw error;
    }
  }

  static async generateReceiptPDF(receipt: Receipt, companyConfig: any): Promise<void> {
    try {
      // Cria um div temporário com o layout EXATO da imagem (adaptado para recibo)
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '794px';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.padding = '20px';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.style.fontSize = '12px';
      tempDiv.style.lineHeight = '1.4';
      tempDiv.style.color = '#333';
      
      // Template EXATO da imagem (adaptado para recibo)
      tempDiv.innerHTML = `
        <div style="position: relative; max-width: 794px; margin: 0 auto; background: white;">
          <!-- Marca d'água com a imagem do logo -->
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); z-index: 1; pointer-events: none; opacity: 0.1;">
            <img src="/image.png" alt="TEFEL GYM Logo" style="width: 200px; height: auto;" />
          </div>
          
          <!-- Cabeçalho -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; position: relative; z-index: 2;">
            <!-- Informações da Empresa (Esquerda) -->
            <div style="flex: 1;">
              <!-- Logo TEFEL GYM -->
              <div style="margin-bottom: 10px;">
                <div style="display: flex; align-items: center; margin-bottom: 5px;">
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
              </div>
              
              <div style="font-size: 11px; line-height: 1.3;">
                <div><strong>Hefel Lda</strong></div>
                <div>NUIT: 401059330</div>
                <div>Endereço: Av Cardeal Alxexandre dos Santos, Maputo, Moçambique</div>
                <div>Email: hefel.lda@gmail.com</div>
                <div>Telefone: +258 87 01 35 980 / 87 01 35 983</div>
              </div>
            </div>
            
            <!-- Detalhes do Recibo (Direita) -->
            <div style="flex: 1; text-align: right;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase;">
                RECIBO DE PAGAMENTO
              </div>
              <div style="font-size: 11px; line-height: 1.3;">
                <div><strong>N°: RC${receipt.numero}</strong></div>
                <div>Data de Emissão: ${this.formatDate(receipt.data_pagamento)}</div>
                <div>Data de Pagamento: ${this.formatDate(receipt.data_pagamento)}</div>
              </div>
            </div>
          </div>
          
          <!-- Linha separadora -->
          <div style="border-bottom: 1px solid #000; margin: 15px 0; position: relative; z-index: 2;"></div>
          
          <!-- Dados do Cliente -->
          <div style="margin-bottom: 20px; position: relative; z-index: 2;">
            <div style="font-weight: bold; text-transform: uppercase; margin-bottom: 8px; font-size: 11px;">
              DADOS DO CLIENTE:
            </div>
            <div style="font-size: 11px; line-height: 1.3;">
              <div>Nome: ${receipt.invoice?.member?.name || 'N/A'}</div>
              <div>Telefone: ${receipt.invoice?.member?.phone || 'N/A'}</div>
              <div>Nr de cartão: ${receipt.invoice?.member?.nr_cartao || 'N/A'}</div>
            </div>
          </div>
          
          <!-- Linha separadora -->
          <div style="border-bottom: 1px solid #000; margin: 15px 0; position: relative; z-index: 2;"></div>
          
          <!-- Tabela de Pagamentos -->
          <div style="margin-bottom: 20px; position: relative; z-index: 2;">
            <div style="font-weight: bold; text-transform: uppercase; margin-bottom: 8px; font-size: 11px;">
              DISCRIMINAÇÃO DOS PAGAMENTOS:
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
              <thead>
                <tr style="border-bottom: 1px solid #000;">
                  <th style="text-align: center; padding: 5px; font-weight: bold; width: 5%;">#</th>
                  <th style="text-align: left; padding: 5px; font-weight: bold; width: 45%;">Descrição</th>
                  <th style="text-align: center; padding: 5px; font-weight: bold; width: 10%;">Qtd</th>
                  <th style="text-align: right; padding: 5px; font-weight: bold; width: 15%;">Preço Unit.</th>
                  <th style="text-align: right; padding: 5px; font-weight: bold; width: 10%;">Desconto</th>
                  <th style="text-align: right; padding: 5px; font-weight: bold; width: 15%;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #ccc;">
                  <td style="text-align: center; padding: 5px;">1</td>
                  <td style="text-align: left; padding: 5px;">${receipt.descricao || 'Pagamento de Serviço'}</td>
                  <td style="text-align: center; padding: 5px;">1.00</td>
                  <td style="text-align: right; padding: 5px;">${this.formatCurrency(receipt.valor_pago)} MT</td>
                  <td style="text-align: right; padding: 5px;">0.00 MT</td>
                  <td style="text-align: right; padding: 5px;">${this.formatCurrency(receipt.valor_pago)} MT</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Resumo Financeiro e Métodos de Pagamento -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; position: relative; z-index: 2;">
            <!-- Métodos de Pagamento (Esquerda) -->
            <div style="flex: 1; margin-right: 20px;">
              <div style="font-weight: bold; margin-bottom: 8px; font-size: 11px;">
                Método de Pagamentos:
              </div>
              <div style="font-size: 10px; line-height: 1.3;">
                <div>Mpesa 84 01 35 981</div>
                <div>Emola 87 01 35 983</div>
                <div>BCI</div>
                <div>Conta: 2269 1142 2100 01</div>
                <div>NIB: 0008.0000.26911422101.13</div>
              </div>
            </div>
            
            <!-- Resumo Financeiro (Direita) -->
            <div style="flex: 1; text-align: right;">
              <div style="font-weight: bold; text-transform: uppercase; margin-bottom: 8px; font-size: 11px; text-align: left;">
                RESUMO FINANCEIRO:
              </div>
              <div style="font-size: 11px; line-height: 1.5;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                  <span>Subtotal:</span>
                  <span>${this.formatCurrency(receipt.valor_pago)} MT</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
                  <span>IVA (16%):</span>
                  <span>${this.formatCurrency(receipt.valor_pago * 0.16)} MT</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-weight: bold; border-top: 1px solid #000; padding-top: 3px;">
                  <span>Total:</span>
                  <span>${this.formatCurrency(receipt.valor_pago * 1.16)} MT</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Rodapé -->
          <div style="text-align: center; font-size: 9px; color: #666; margin-top: 30px; position: relative; z-index: 2;">
            <div style="margin-bottom: 5px;">
              Este recibo é válido sem assinatura, conforme legislação vigente.
            </div>
            <div>
              Processado em: ${new Date().toLocaleDateString('pt-PT')}, ${new Date().toLocaleTimeString('pt-PT')}
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      // Gera o PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      document.body.removeChild(tempDiv);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`Recibo_${receipt.numero}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF do recibo:', error);
      throw error;
    }
  }
} 