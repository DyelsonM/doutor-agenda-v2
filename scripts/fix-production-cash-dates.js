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

async function fixProductionCashDates() {
  console.log("🔧 Corrigindo datas de caixa em PRODUÇÃO...\n");
  console.log("⚠️  ATENÇÃO: Este script irá alterar dados em PRODUÇÃO!\n");

  try {
    // Buscar todos os caixas
    const cashRecords = await pool.query(`
      SELECT 
        dc.id, 
        dc.date, 
        dc.opening_time,
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

    let fixedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const cash of cashRecords.rows) {
      try {
        const originalDate = new Date(cash.date);
        const originalOpeningTime = new Date(cash.opening_time);

        // Converter para timezone de São Paulo para verificar se há diferença
        const localDate = dayjs(originalDate).tz("America/Sao_Paulo");
        const localOpeningTime =
          dayjs(originalOpeningTime).tz("America/Sao_Paulo");

        // Verificar se a data está sendo interpretada incorretamente
        // Se a data original está em UTC mas deveria estar em horário local
        const dateDiff = Math.abs(
          originalDate.getTime() - localDate.toDate().getTime(),
        );
        const timeDiff = Math.abs(
          originalOpeningTime.getTime() - localOpeningTime.toDate().getTime(),
        );

        console.log(
          `\n--- Processando Caixa ${cash.id} (${cash.user_name}) ---`,
        );
        console.log(`Status: ${cash.status}`);
        console.log(`Data original: ${originalDate.toISOString()}`);
        console.log(
          `Data local (SP): ${localDate.format("YYYY-MM-DD HH:mm:ss")}`,
        );
        console.log(
          `Horário abertura original: ${originalOpeningTime.toISOString()}`,
        );
        console.log(
          `Horário abertura local (SP): ${localOpeningTime.format("YYYY-MM-DD HH:mm:ss")}`,
        );
        console.log(`Diferença de data: ${dateDiff / (1000 * 60 * 60)} horas`);
        console.log(
          `Diferença de horário: ${timeDiff / (1000 * 60 * 60)} horas`,
        );

        // Se há diferença significativa (mais de 1 hora), provavelmente está em UTC
        if (dateDiff > 3600000 || timeDiff > 3600000) {
          // 1 hora em ms
          console.log(`🔧 CORRIGINDO: Convertendo de UTC para horário local`);

          // Corrigir a data do caixa
          const correctedDate = localDate.startOf("day").toDate();
          const correctedOpeningTime = localOpeningTime.toDate();

          console.log(`Data corrigida: ${correctedDate.toISOString()}`);
          console.log(
            `Horário corrigido: ${correctedOpeningTime.toISOString()}`,
          );

          await pool.query(
            `
            UPDATE daily_cash 
            SET 
              date = $1,
              opening_time = $2
            WHERE id = $3
          `,
            [
              correctedDate.toISOString(),
              correctedOpeningTime.toISOString(),
              cash.id,
            ],
          );

          console.log(`✅ Caixa corrigido com sucesso!`);
          fixedCount++;
        } else {
          console.log(`⏭️  Caixa ${cash.id} não precisa de correção`);
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Erro ao corrigir caixa ${cash.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Resumo da correção:`);
    console.log(`✅ Caixas corrigidos: ${fixedCount}`);
    console.log(`⏭️  Caixas ignorados: ${skippedCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📈 Total processado: ${cashRecords.rows.length}`);

    if (fixedCount > 0) {
      console.log(`\n🎉 Correção concluída!`);
      console.log(`💡 Recomendações:`);
      console.log(`   - Reinicie a aplicação em produção`);
      console.log(`   - Teste a abertura de um novo caixa`);
      console.log(
        `   - Verifique se as datas estão sendo exibidas corretamente`,
      );
    } else {
      console.log(`\n✨ Nenhuma correção necessária!`);
    }
  } catch (error) {
    console.error("❌ Erro geral:", error);
  } finally {
    await pool.end();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  fixProductionCashDates().catch(console.error);
}

module.exports = { fixProductionCashDates };
