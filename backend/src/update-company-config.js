const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'fitlife',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: parseInt(process.env.POSTGRES_PORT) || 5432,
});

async function updateCompanyConfig() {
  console.log('🏢 Atualizando configurações da empresa...');
  
  const client = await pool.connect();
  
  try {
    // Update company configuration with correct data
    const result = await client.query(`
      UPDATE configuracoes_empresa SET 
        nome_empresa = 'Hefel Lda',
        nuit = '401059330',
        endereco = 'Av Cardeal Alexandre dos Santos, Maputo',
        email = 'hefel.lda@gmail.com',
        telefone1 = '+258 87 01 35 980',
        telefone2 = '+258 87 01 35 983',
        mpesa_number = '84 01 35 981',
        emola_number = '87 01 35 983',
        bci_account = '2269 1142 2100.01',
        bci_nib = '0008.0000.26911422101.13',
        taxa_iva = 16.00,
        moeda = 'MT',
        dias_vencimento = 30,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);
    
    if (result.rowCount > 0) {
      console.log('✅ Configuração da empresa atualizada com sucesso!');
    } else {
      // If no config exists, create it
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
    }
    
    // Show current configuration
    const configResult = await client.query('SELECT * FROM configuracoes_empresa LIMIT 1');
    if (configResult.rows.length > 0) {
      const config = configResult.rows[0];
      console.log('\n📋 Configuração atual da empresa:');
      console.log(`Nome: ${config.nome_empresa}`);
      console.log(`NUIT: ${config.nuit}`);
      console.log(`Email: ${config.email}`);
      console.log(`Telefone 1: ${config.telefone1}`);
      console.log(`Telefone 2: ${config.telefone2}`);
      console.log(`Mpesa: ${config.mpesa_number}`);
      console.log(`Emola: ${config.emola_number}`);
      console.log(`BCI Conta: ${config.bci_account}`);
      console.log(`BCI NIB: ${config.bci_nib}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao atualizar configuração da empresa:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  updateCompanyConfig()
    .then(() => {
      console.log('🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro ao executar script:', error);
      process.exit(1);
    });
}

module.exports = { updateCompanyConfig }; 