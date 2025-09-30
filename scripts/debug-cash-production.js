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

async function debugCashProduction() {
  console.log("🔍 Debugando sistema de caixa em produção...\n");

  try {
    // 1. Verificar dados brutos do banco
    console.log("📊 1. Verificando dados brutos do banco...");
    const rawCash = await pool.query(`
      SELECT 
        dc.id, 
        dc.date, 
        dc.opening_time,
        dc.closing_time,
        dc.status,
        dc.created_at,
        u.name as user_name
      FROM daily_cash dc
      LEFT JOIN users u ON dc.user_id = u.id
      ORDER BY dc.created_at DESC
      LIMIT 5
    `);

    console.log(`📈 Encontrados ${rawCash.rows.length} registros de caixa:`);
    rawCash.rows.forEach((cash, index) => {
      console.log(`\n--- Caixa ${index + 1} ---`);
      console.log(`ID: ${cash.id}`);
      console.log(`Status: ${cash.status}`);
      console.log(`Data (bruta): ${cash.date}`);
      console.log(`Horário abertura (bruto): ${cash.opening_time}`);
      console.log(`Horário fechamento (bruto): ${cash.closing_time || "NULL"}`);
      console.log(`Criado em: ${cash.created_at}`);
      console.log(`Usuário: ${cash.user_name}`);
    });

    // 2. Verificar timezone do servidor
    console.log("\n🌍 2. Verificando timezone do servidor...");
    const serverTime = await pool.query(
      "SELECT NOW() as server_time, timezone('America/Sao_Paulo', NOW()) as sp_time",
    );
    console.log(`Horário do servidor: ${serverTime.rows[0].server_time}`);
    console.log(`Horário SP: ${serverTime.rows[0].sp_time}`);

    // 3. Simular busca como a página faz
    console.log("\n🔍 3. Simulando busca da página...");

    // Buscar caixa do dia atual (como a página faz)
    const today = dayjs().tz("America/Sao_Paulo").startOf("day").utc().toDate();
    const tomorrow = dayjs()
      .tz("America/Sao_Paulo")
      .add(1, "day")
      .startOf("day")
      .utc()
      .toDate();

    console.log(`Data 'hoje' (UTC): ${today.toISOString()}`);
    console.log(`Data 'amanhã' (UTC): ${tomorrow.toISOString()}`);

    const todayCash = await pool.query(
      `
      SELECT 
        dc.id, 
        dc.date, 
        dc.opening_time,
        dc.closing_time,
        dc.status,
        dc.created_at,
        u.name as user_name
      FROM daily_cash dc
      LEFT JOIN users u ON dc.user_id = u.id
      WHERE dc.date >= $1 AND dc.date <= $2
      ORDER BY dc.created_at DESC
      LIMIT 1
    `,
      [today.toISOString(), tomorrow.toISOString()],
    );

    console.log(`\n📊 Caixa encontrado para hoje: ${todayCash.rows.length}`);
    if (todayCash.rows.length > 0) {
      const cash = todayCash.rows[0];
      console.log(`ID: ${cash.id}`);
      console.log(`Status: ${cash.status}`);
      console.log(`Data: ${cash.date}`);
      console.log(`Horário abertura: ${cash.opening_time}`);
      console.log(`Usuário: ${cash.user_name}`);

      // 4. Verificar conversão de timezone
      console.log("\n🔄 4. Verificando conversão de timezone...");
      const cashDate = new Date(cash.date);
      const cashOpeningTime = new Date(cash.opening_time);

      console.log(`Data original: ${cashDate.toISOString()}`);
      console.log(
        `Data convertida para SP: ${dayjs(cashDate).utc().tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss")}`,
      );
      console.log(`Horário original: ${cashOpeningTime.toISOString()}`);
      console.log(
        `Horário convertido para SP: ${dayjs(cashOpeningTime).utc().tz("America/Sao_Paulo").format("YYYY-MM-DD HH:mm:ss")}`,
      );
    } else {
      console.log("❌ Nenhum caixa encontrado para hoje");
    }

    // 5. Verificar se há caixas abertos
    console.log("\n🔍 5. Verificando caixas abertos...");
    const openCash = await pool.query(`
      SELECT 
        dc.id, 
        dc.date, 
        dc.opening_time,
        dc.status,
        u.name as user_name
      FROM daily_cash dc
      LEFT JOIN users u ON dc.user_id = u.id
      WHERE dc.status = 'open'
      ORDER BY dc.created_at DESC
    `);

    console.log(`📊 Caixas abertos encontrados: ${openCash.rows.length}`);
    openCash.rows.forEach((cash, index) => {
      console.log(`\n--- Caixa Aberto ${index + 1} ---`);
      console.log(`ID: ${cash.id}`);
      console.log(`Data: ${cash.date}`);
      console.log(`Horário abertura: ${cash.opening_time}`);
      console.log(`Usuário: ${cash.user_name}`);
    });

    // 6. Verificar operações de caixa
    console.log("\n🔍 6. Verificando operações de caixa...");
    const operations = await pool.query(`
      SELECT 
        co.id,
        co.type,
        co.amount_in_cents,
        co.description,
        co.created_at,
        dc.id as cash_id,
        dc.status as cash_status,
        u.name as user_name
      FROM cash_operations co
      LEFT JOIN daily_cash dc ON co.daily_cash_id = dc.id
      LEFT JOIN users u ON co.user_id = u.id
      ORDER BY co.created_at DESC
      LIMIT 10
    `);

    console.log(`📊 Operações encontradas: ${operations.rows.length}`);
    operations.rows.forEach((op, index) => {
      console.log(`\n--- Operação ${index + 1} ---`);
      console.log(`ID: ${op.id}`);
      console.log(`Tipo: ${op.type}`);
      console.log(`Valor: R$ ${(op.amount_in_cents / 100).toFixed(2)}`);
      console.log(`Descrição: ${op.description}`);
      console.log(`Caixa ID: ${op.cash_id} (Status: ${op.cash_status})`);
      console.log(`Usuário: ${op.user_name}`);
      console.log(`Criado em: ${op.created_at}`);
    });

    // 7. Resumo e recomendações
    console.log("\n📋 7. Resumo e recomendações:");
    console.log(`✅ Total de caixas: ${rawCash.rows.length}`);
    console.log(`✅ Caixas abertos: ${openCash.rows.length}`);
    console.log(`✅ Operações: ${operations.rows.length}`);

    if (openCash.rows.length === 0) {
      console.log("\n⚠️  PROBLEMA IDENTIFICADO:");
      console.log("   - Nenhum caixa aberto encontrado");
      console.log("   - Isso explica por que a interface não mostra dados");
      console.log("\n💡 SOLUÇÕES:");
      console.log("   1. Abra um novo caixa via interface");
      console.log(
        "   2. Ou execute o script de conversão UTC se houver dados antigos",
      );
    } else if (todayCash.rows.length === 0) {
      console.log("\n⚠️  PROBLEMA IDENTIFICADO:");
      console.log("   - Há caixas abertos, mas nenhum para 'hoje'");
      console.log("   - Pode ser problema de timezone na busca");
      console.log("\n💡 SOLUÇÕES:");
      console.log("   1. Verificar se as datas estão em UTC");
      console.log("   2. Executar script de conversão UTC");
    } else {
      console.log("\n✅ SISTEMA FUNCIONANDO:");
      console.log("   - Caixa encontrado para hoje");
      console.log("   - Dados estão sendo exibidos corretamente");
    }
  } catch (error) {
    console.error("❌ Erro durante debug:", error);
  } finally {
    await pool.end();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  debugCashProduction().catch(console.error);
}

module.exports = { debugCashProduction };
