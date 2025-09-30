require("dotenv").config();
const { Pool } = require("pg");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

// Configuração do banco de dados
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL não encontrada nas variáveis de ambiente");
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
});

async function convertCashToUTC() {
  console.log("🔄 Convertendo dados de caixa para UTC...\n");

  try {
    // Buscar todos os caixas
    const cashRecords = await pool.query(`
      SELECT 
        dc.id, 
        dc.date, 
        dc.opening_time,
        dc.closing_time,
        dc.created_at,
        dc.status,
        u.name as user_name
      FROM daily_cash dc
      LEFT JOIN users u ON dc.user_id = u.id
      ORDER BY dc.created_at DESC
    `);

    console.log(
      `📊 Processando ${cashRecords.rows.length} registros de caixa...\n`,
    );

    let convertedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const cash of cashRecords.rows) {
      try {
        const originalDate = new Date(cash.date);
        const originalOpeningTime = new Date(cash.opening_time);
        const originalClosingTime = cash.closing_time
          ? new Date(cash.closing_time)
          : null;

        console.log(
          `\n--- Processando Caixa ${cash.id} (${cash.user_name}) ---`,
        );
        console.log(`Status: ${cash.status}`);
        console.log(`Data original: ${originalDate.toISOString()}`);
        console.log(
          `Horário abertura original: ${originalOpeningTime.toISOString()}`,
        );
        if (originalClosingTime) {
          console.log(
            `Horário fechamento original: ${originalClosingTime.toISOString()}`,
          );
        }

        // Converter para UTC
        // Assumir que as datas estão em horário local (Brasil) e converter para UTC
        const utcDate = dayjs(originalDate)
          .tz("America/Sao_Paulo")
          .utc()
          .toDate();
        const utcOpeningTime = dayjs(originalOpeningTime)
          .tz("America/Sao_Paulo")
          .utc()
          .toDate();
        const utcClosingTime = originalClosingTime
          ? dayjs(originalClosingTime).tz("America/Sao_Paulo").utc().toDate()
          : null;

        console.log(`Data UTC: ${utcDate.toISOString()}`);
        console.log(`Horário abertura UTC: ${utcOpeningTime.toISOString()}`);
        if (utcClosingTime) {
          console.log(
            `Horário fechamento UTC: ${utcClosingTime.toISOString()}`,
          );
        }

        // Verificar se há diferença significativa
        const dateDiff = Math.abs(originalDate.getTime() - utcDate.getTime());
        const timeDiff = Math.abs(
          originalOpeningTime.getTime() - utcOpeningTime.getTime(),
        );

        if (dateDiff > 3600000 || timeDiff > 3600000) {
          // 1 hora em ms
          console.log(`🔧 CONVERTENDO: De horário local para UTC`);

          await pool.query(
            `
            UPDATE daily_cash 
            SET 
              date = $1,
              opening_time = $2,
              closing_time = $3
            WHERE id = $4
          `,
            [
              utcDate.toISOString(),
              utcOpeningTime.toISOString(),
              utcClosingTime ? utcClosingTime.toISOString() : null,
              cash.id,
            ],
          );

          console.log(`✅ Caixa convertido com sucesso!`);
          convertedCount++;
        } else {
          console.log(
            `⏭️  Caixa ${cash.id} já está em UTC ou não precisa de conversão`,
          );
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Erro ao converter caixa ${cash.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Resumo da conversão:`);
    console.log(`✅ Caixas convertidos: ${convertedCount}`);
    console.log(`⏭️  Caixas ignorados: ${skippedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📈 Total processado: ${cashRecords.rows.length}`);

    if (convertedCount > 0) {
      console.log(`\n🎉 Conversão concluída!`);
      console.log(`💡 Próximos passos:`);
      console.log(`   - Reinicie a aplicação`);
      console.log(`   - Teste a abertura de um novo caixa`);
      console.log(
        `   - Verifique se as datas estão sendo exibidas corretamente`,
      );
      console.log(
        `   - Os novos caixas já serão salvos em UTC automaticamente`,
      );
    } else {
      console.log(`\n✨ Nenhuma conversão necessária!`);
      console.log(`💡 Os dados já estão em UTC ou não precisam de conversão.`);
    }
  } catch (error) {
    console.error("❌ Erro geral:", error);
  } finally {
    await pool.end();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  convertCashToUTC().catch(console.error);
}

module.exports = { convertCashToUTC };
