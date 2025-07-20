import { Pool } from 'pg';

interface BillingServiceConfig {
  pool: Pool;
}

interface AutoInvoiceResult {
  processed: number;
  success: number;
  errors: number;
  details: Array<{
    member_id: string;
    member_name: string;
    action: 'created' | 'error';
    invoice_id?: string;
    error?: string;
  }>;
}

export class BillingService {
  private pool: Pool;

  constructor(config: BillingServiceConfig) {
    this.pool = config.pool;
  }

  /**
   * Generate next document number for invoices, receipts, or credit notes
   */
  async getNextDocumentNumber(type: 'factura' | 'recibo' | 'nota_credito'): Promise<string> {
    try {
      const currentYear = new Date().getFullYear();
      const configResult = await this.pool.query('SELECT * FROM configuracoes_empresa LIMIT 1');
      let config = configResult.rows[0];
      
      if (!config) {
        // Create default config if not exists
        await this.pool.query('INSERT INTO configuracoes_empresa DEFAULT VALUES');
        config = (await this.pool.query('SELECT * FROM configuracoes_empresa LIMIT 1')).rows[0];
      }
      
      let nextNumber: number;
      let prefix: string;
      let columnName: string;
      
      switch (type) {
        case 'factura':
          nextNumber = config.proximo_numero_factura;
          prefix = 'FT';
          columnName = 'proximo_numero_factura';
          break;
        case 'recibo':
          nextNumber = config.proximo_numero_recibo;
          prefix = 'RB';
          columnName = 'proximo_numero_recibo';
          break;
        case 'nota_credito':
          nextNumber = config.proximo_numero_nota_credito;
          prefix = 'NC';
          columnName = 'proximo_numero_nota_credito';
          break;
      }
      
      // Check if year has changed
      if (config.ano_corrente !== currentYear) {
        // Reset numbering for new year
        nextNumber = 1;
        await this.pool.query(
          `UPDATE configuracoes_empresa SET 
           ano_corrente = $1, 
           proximo_numero_factura = 1,
           proximo_numero_recibo = 1,
           proximo_numero_nota_credito = 1`,
          [currentYear]
        );
      }
      
      const numero = `${prefix}${currentYear}${nextNumber.toString().padStart(3, '0')}`;
      
      // Update next number
      await this.pool.query(
        `UPDATE configuracoes_empresa SET ${columnName} = ${columnName} + 1`
      );
      
      return numero;
    } catch (error) {
      console.error('Error generating document number:', error);
      throw error;
    }
  }

  /**
   * Daily job to generate invoices for expiring plans
   * Should be run at 00:01 daily
   */
  async generateDailyInvoices(): Promise<AutoInvoiceResult> {
    const client = await this.pool.connect();
    const result: AutoInvoiceResult = {
      processed: 0,
      success: 0,
      errors: 0,
      details: []
    };

    try {
      await client.query('BEGIN');

      // Get company configuration
      const configResult = await client.query('SELECT * FROM configuracoes_empresa LIMIT 1');
      const config = configResult.rows[0];
      
      if (!config) {
        throw new Error('Company configuration not found');
      }

      // Find members whose plans expire today
      const expiringMembersResult = await client.query(`
        SELECT 
          m.id, m.name, m.email, m.phone, m.nr_cartao,
          m.plan_id, m.plano_data_fim, 
          p.name as plan_name, p.price as plan_price, p.duration_days
        FROM members m
        JOIN plans p ON m.plan_id = p.id
        WHERE m.plano_data_fim = CURRENT_DATE
          AND m.plano_estado = 'activo'
          AND m.status = 'active'
          AND p.is_active = true
      `);

      const expiringMembers = expiringMembersResult.rows;
      result.processed = expiringMembers.length;

      console.log(`Found ${expiringMembers.length} members with plans expiring today`);

      for (const member of expiringMembers) {
        try {
          // Check if invoice already exists for this renewal
          const existingInvoiceResult = await client.query(`
            SELECT id FROM facturas 
            WHERE member_id = $1 
              AND data_emissao = CURRENT_DATE 
              AND descricao_servico LIKE '%renovação%'
              AND estado != 'cancelada'
          `, [member.id]);

          if (existingInvoiceResult.rows.length > 0) {
            console.log(`Invoice already exists for member ${member.name}`);
            result.details.push({
              member_id: member.id,
              member_name: member.name,
              action: 'error',
              error: 'Invoice already exists for today'
            });
            continue;
          }

          // Calculate new plan dates
          const planStartDate = new Date();
          planStartDate.setDate(planStartDate.getDate() + 1); // Tomorrow
          
          const planEndDate = new Date(planStartDate);
          planEndDate.setDate(planEndDate.getDate() + member.duration_days);

          // Calculate amounts
          const subtotal = parseFloat(member.plan_price);
          const taxaIva = config.taxa_iva || 16.00;
          const valorIva = subtotal * (taxaIva / 100);
          const total = subtotal + valorIva;

          // Generate invoice number
          const numero = await this.getNextDocumentNumber('factura');

          // Calculate due date
          const dataVencimento = new Date();
          dataVencimento.setDate(dataVencimento.getDate() + (config.dias_vencimento || 30));

          // Create renewal invoice
          const invoiceResult = await client.query(`
            INSERT INTO facturas (
              numero, member_id, plan_id, 
              descricao_servico, preco_unitario, quantidade,
              subtotal, taxa_iva, valor_iva, total,
              data_vencimento, plano_inicio, plano_fim,
              metodos_pagamento_aceites, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
          `, [
            numero, member.id, member.plan_id,
            `Renovação ${member.plan_name} - Período: ${planStartDate.toISOString().split('T')[0]} a ${planEndDate.toISOString().split('T')[0]}`,
            member.plan_price, 1,
            subtotal, taxaIva, valorIva, total,
            dataVencimento.toISOString().split('T')[0],
            planStartDate.toISOString().split('T')[0],
            planEndDate.toISOString().split('T')[0],
            JSON.stringify(['mpesa', 'emola', 'bci', 'dinheiro']),
            null // System generated
          ]);

          // Update member's last invoice and expire current plan
          await client.query(`
            UPDATE members SET 
              ultima_factura_id = $1,
              plano_estado = 'expirado'
            WHERE id = $2
          `, [invoiceResult.rows[0].id, member.id]);

          result.success++;
          result.details.push({
            member_id: member.id,
            member_name: member.name,
            action: 'created',
            invoice_id: invoiceResult.rows[0].id
          });

          console.log(`Created invoice ${numero} for member ${member.name}`);

          // TODO: Send notification (email/SMS) to member
          await this.sendInvoiceNotification(member, invoiceResult.rows[0]);

        } catch (memberError: any) {
          console.error(`Error processing member ${member.name}:`, memberError);
          result.errors++;
          result.details.push({
            member_id: member.id,
            member_name: member.name,
            action: 'error',
            error: memberError.message
          });
        }
      }

      await client.query('COMMIT');

      console.log(`Daily invoice generation completed: ${result.success} success, ${result.errors} errors`);
      
      return result;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in daily invoice generation:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check for overdue invoices and update their status
   */
  async checkOverdueInvoices(): Promise<{updated: number}> {
    try {
      const result = await this.pool.query(`
        UPDATE facturas 
        SET estado = 'vencida', updated_at = CURRENT_TIMESTAMP
        WHERE estado = 'pendente' 
          AND data_vencimento < CURRENT_DATE
        RETURNING id, numero, member_id
      `);

      const updatedInvoices = result.rows;
      
      // TODO: Send overdue notifications
      for (const invoice of updatedInvoices) {
        await this.sendOverdueNotification(invoice);
      }

      console.log(`Updated ${updatedInvoices.length} invoices to overdue status`);
      
      return { updated: updatedInvoices.length };
    } catch (error) {
      console.error('Error checking overdue invoices:', error);
      throw error;
    }
  }

  /**
   * Check for plans expiring in the next 7 days and send reminders
   */
  async sendPlanExpirationReminders(): Promise<{sent: number}> {
    try {
      const membersResult = await this.pool.query(`
        SELECT 
          m.id, m.name, m.email, m.phone, m.whatsapp_number,
          m.plano_data_fim, p.name as plan_name
        FROM members m
        JOIN plans p ON m.plan_id = p.id
        WHERE m.plano_data_fim BETWEEN CURRENT_DATE + INTERVAL '1 day' AND CURRENT_DATE + INTERVAL '7 days'
          AND m.plano_estado = 'activo'
          AND m.notificacoes_enabled = true
          AND m.status = 'active'
      `);

      const members = membersResult.rows;
      
      for (const member of members) {
        // TODO: Implement notification sending
        await this.sendPlanExpirationNotification(member);
      }

      console.log(`Sent plan expiration reminders to ${members.length} members`);
      
      return { sent: members.length };
    } catch (error) {
      console.error('Error sending plan expiration reminders:', error);
      throw error;
    }
  }

  /**
   * Generate billing summary report for a given period
   */
  async generateBillingSummary(startDate: string, endDate: string) {
    try {
      // Get invoice statistics
      const invoiceStatsResult = await this.pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE estado = 'pendente') as pendentes,
          COUNT(*) FILTER (WHERE estado = 'paga') as pagas,
          COUNT(*) FILTER (WHERE estado = 'vencida') as vencidas,
          COUNT(*) FILTER (WHERE estado = 'cancelada') as canceladas,
          COALESCE(SUM(total), 0) as total_facturado
        FROM facturas 
        WHERE data_emissao BETWEEN $1 AND $2
      `, [startDate, endDate]);

      // Get payment statistics
      const paymentStatsResult = await this.pool.query(`
        SELECT 
          COALESCE(SUM(valor_pago), 0) as total_recebido,
          COUNT(*) as total_pagamentos
        FROM recibos 
        WHERE DATE(data_pagamento) BETWEEN $1 AND $2
      `, [startDate, endDate]);

      // Get payment methods breakdown
      const paymentMethodsResult = await this.pool.query(`
        SELECT 
          metodo_pagamento,
          COUNT(*) as quantidade,
          COALESCE(SUM(valor_pago), 0) as valor
        FROM recibos 
        WHERE DATE(data_pagamento) BETWEEN $1 AND $2
        GROUP BY metodo_pagamento
      `, [startDate, endDate]);

      // Get most sold plans
      const topPlansResult = await this.pool.query(`
        SELECT 
          f.plan_id,
          p.name as plan_name,
          COUNT(*) as quantidade,
          COALESCE(SUM(f.total), 0) as valor_total
        FROM facturas f
        JOIN plans p ON f.plan_id = p.id
        WHERE f.data_emissao BETWEEN $1 AND $2
          AND f.estado != 'cancelada'
        GROUP BY f.plan_id, p.name
        ORDER BY quantidade DESC
        LIMIT 10
      `, [startDate, endDate]);

      const invoiceStats = invoiceStatsResult.rows[0];
      const paymentStats = paymentStatsResult.rows[0];

      return {
        periodo: {
          inicio: startDate,
          fim: endDate
        },
        facturas: {
          total: parseInt(invoiceStats.total),
          pendentes: parseInt(invoiceStats.pendentes),
          pagas: parseInt(invoiceStats.pagas),
          vencidas: parseInt(invoiceStats.vencidas),
          canceladas: parseInt(invoiceStats.canceladas)
        },
        valores: {
          total_facturado: parseFloat(invoiceStats.total_facturado),
          total_recebido: parseFloat(paymentStats.total_recebido),
          valor_pendente: 0, // Will be calculated separately if needed
          valor_vencido: 0   // Will be calculated separately if needed
        },
        metodos_pagamento: paymentMethodsResult.rows.reduce((acc, row) => {
          acc[row.metodo_pagamento] = {
            quantidade: parseInt(row.quantidade),
            valor: parseFloat(row.valor)
          };
          return acc;
        }, {}),
        planos_mais_vendidos: topPlansResult.rows
      };
    } catch (error) {
      console.error('Error generating billing summary:', error);
      throw error;
    }
  }

  /**
   * Send invoice notification (placeholder - implement with actual notification service)
   */
  private async sendInvoiceNotification(member: any, invoice: any): Promise<void> {
    // TODO: Implement with actual SMS/Email service
    console.log(`TODO: Send invoice notification to ${member.name} (${member.email})`);
    console.log(`Invoice: ${invoice.numero}, Amount: ${invoice.total} MT`);
  }

  /**
   * Send overdue notification (placeholder)
   */
  private async sendOverdueNotification(invoice: any): Promise<void> {
    // TODO: Implement with actual notification service
    console.log(`TODO: Send overdue notification for invoice ${invoice.numero}`);
  }

  /**
   * Send plan expiration notification (placeholder)
   */
  private async sendPlanExpirationNotification(member: any): Promise<void> {
    // TODO: Implement with actual notification service
    console.log(`TODO: Send plan expiration reminder to ${member.name}`);
    console.log(`Plan ${member.plan_name} expires on ${member.plano_data_fim}`);
  }
}

export default BillingService; 