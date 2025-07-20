const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'db',
  database: process.env.POSTGRES_DB || 'fitlife',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
});

async function initializeCompanyConfig() {
  console.log('🏢 Inicializando configurações da empresa...');
  
  const client = await pool.connect();
  
  try {
    // Check if company config exists
    const configResult = await client.query('SELECT * FROM configuracoes_empresa LIMIT 1');
    
    if (configResult.rows.length === 0) {
      // Create default company configuration
      await client.query(`
        INSERT INTO configuracoes_empresa (
          nome_empresa, nuit, endereco, email, telefone1, telefone2,
          mpesa_number, emola_number, bci_account, bci_nib,
          taxa_iva, moeda, dias_vencimento,
          proximo_numero_factura, proximo_numero_recibo, proximo_numero_nota_credito,
          ano_corrente
        ) VALUES (
          'Hefel Lda', '401059330', 'Av Cardeal Alexandre dos Santos, Maputo', 
          'hefel.lda@gmail.com', '+258 87 01 35 980', '+258 87 01 35 983',
          '84 01 35 981', '87 01 35 983', '2269 1142 2100.01', '0008.0000.26911422101.13',
          16.00, 'MT', 30,
          1, 1, 1,
          EXTRACT(YEAR FROM CURRENT_DATE)
        )
      `);
      
      console.log('✅ Configuração da empresa criada com sucesso!');
    } else {
      console.log('ℹ️  Configuração da empresa já existe.');
      
      // Update year if needed
      const currentYear = new Date().getFullYear();
      const configYear = configResult.rows[0].ano_corrente;
      
      if (configYear !== currentYear) {
        await client.query(`
          UPDATE configuracoes_empresa SET 
            ano_corrente = $1,
            proximo_numero_factura = 1,
            proximo_numero_recibo = 1,
            proximo_numero_nota_credito = 1
          WHERE id = $2
        `, [currentYear, configResult.rows[0].id]);
        
        console.log(`📅 Ano atualizado para ${currentYear} e numeração resetada.`);
      }
    }
    
    // Display current configuration
    const currentConfig = await client.query('SELECT * FROM configuracoes_empresa LIMIT 1');
    const config = currentConfig.rows[0];
    
    console.log('\n📊 Configuração Atual:');
    console.log(`   Empresa: ${config.nome_empresa}`);
    console.log(`   NUIT: ${config.nuit}`);
    console.log(`   Email: ${config.email}`);
    console.log(`   Telefones: ${config.telefone1} / ${config.telefone2}`);
    console.log(`   Taxa IVA: ${config.taxa_iva}%`);
    console.log(`   Próxima Fatura: FT${config.ano_corrente}${String(config.proximo_numero_factura).padStart(3, '0')}`);
    console.log(`   Próximo Recibo: RC${config.ano_corrente}${String(config.proximo_numero_recibo).padStart(3, '0')}`);
    
  } catch (error) {
    console.error('❌ Erro ao inicializar configurações:', error);
  } finally {
    client.release();
  }
}

// Run initialization
initializeCompanyConfig()
  .then(() => {
    console.log('\n🎉 Inicialização concluída!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  }); 