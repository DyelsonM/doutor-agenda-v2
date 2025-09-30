require("dotenv").config();
const fs = require("fs/promises");
const path = require("path");
const { Pool } = require("pg");

// Configuração do banco de dados
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL não encontrada nas variáveis de ambiente");
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
});

async function backupProductionCashData() {
  console.log("💾 Criando backup dos dados de caixa de PRODUÇÃO...\n");

  try {
    // Criar diretório de backup se não existir
    const backupDir = path.join(process.cwd(), "backups");
    await fs.mkdir(backupDir, { recursive: true });

    // Gerar timestamp para o backup
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFilename = `cash-backup-${timestamp}`;

    // Buscar todos os dados de caixa
    console.log("📊 Buscando dados de caixa...");
    const cashRecords = await pool.query(`
      SELECT 
        dc.*,
        u.name as user_name,
        u.email as user_email
      FROM daily_cash dc
      LEFT JOIN users u ON dc.user_id = u.id
      ORDER BY dc.created_at DESC
    `);

    // Buscar operações de caixa
    console.log("📊 Buscando operações de caixa...");
    const cashOperations = await pool.query(`
      SELECT 
        co.*,
        u.name as user_name,
        u.email as user_email
      FROM cash_operations co
      LEFT JOIN users u ON co.user_id = u.id
      ORDER BY co.created_at DESC
    `);

    console.log(`📈 Encontrados ${cashRecords.rows.length} registros de caixa`);
    console.log(
      `📈 Encontrados ${cashOperations.rows.length} operações de caixa`,
    );

    // Criar backup em JSON
    const jsonBackup = {
      timestamp: new Date().toISOString(),
      environment: "production",
      cashRecords: cashRecords.rows,
      cashOperations: cashOperations.rows,
      summary: {
        totalCashRecords: cashRecords.rows.length,
        totalOperations: cashOperations.rows.length,
        openCashCount: cashRecords.rows.filter((r) => r.status === "open")
          .length,
        closedCashCount: cashRecords.rows.filter((r) => r.status === "closed")
          .length,
      },
    };

    const jsonPath = path.join(backupDir, `${backupFilename}.json`);
    await fs.writeFile(jsonPath, JSON.stringify(jsonBackup, null, 2), "utf8");

    // Criar backup em SQL para reversão
    const sqlBackup = `-- Backup de Dados de Caixa - PRODUÇÃO
-- Data: ${new Date().toISOString()}
-- Total de registros: ${cashRecords.rows.length} caixas, ${cashOperations.rows.length} operações

-- Este arquivo contém os dados originais antes da correção de timezone
-- Para reverter, execute os comandos UPDATE abaixo

${cashRecords.rows
  .map(
    (cash) => `
-- Caixa ID: ${cash.id}
UPDATE daily_cash SET 
  date = '${cash.date}',
  opening_time = '${cash.opening_time}',
  closing_time = ${cash.closing_time ? `'${cash.closing_time}'` : "NULL"},
  opening_amount = ${cash.opening_amount},
  closing_amount = ${cash.closing_amount || "NULL"},
  expected_amount = ${cash.expected_amount || "NULL"},
  difference = ${cash.difference || "NULL"},
  total_cash_in = ${cash.total_cash_in},
  total_cash_out = ${cash.total_cash_out},
  total_revenue = ${cash.total_revenue || "NULL"},
  total_expenses = ${cash.total_expenses || "NULL"},
  opening_notes = ${cash.opening_notes ? `'${cash.opening_notes.replace(/'/g, "''")}'` : "NULL"},
  closing_notes = ${cash.closing_notes ? `'${cash.closing_notes.replace(/'/g, "''")}'` : "NULL"},
  status = '${cash.status}',
  identifier = ${cash.identifier ? `'${cash.identifier.replace(/'/g, "''")}'` : "NULL"},
  updated_at = '${cash.updated_at}'
WHERE id = '${cash.id}';`,
  )
  .join("\n")}

-- Backup concluído
-- Para restaurar, execute os comandos UPDATE acima
`;

    const sqlPath = path.join(backupDir, `${backupFilename}.sql`);
    await fs.writeFile(sqlPath, sqlBackup, "utf8");

    // Estatísticas do backup
    const jsonStats = await fs.stat(jsonPath);
    const sqlStats = await fs.stat(sqlPath);

    console.log(`\n✅ Backup criado com sucesso!`);
    console.log(`📁 Diretório: ${backupDir}`);
    console.log(
      `📄 JSON: ${backupFilename}.json (${(jsonStats.size / 1024).toFixed(2)} KB)`,
    );
    console.log(
      `📄 SQL: ${backupFilename}.sql (${(sqlStats.size / 1024).toFixed(2)} KB)`,
    );
    console.log(`\n📊 Resumo dos dados:`);
    console.log(`   - Caixas abertos: ${jsonBackup.summary.openCashCount}`);
    console.log(`   - Caixas fechados: ${jsonBackup.summary.closedCashCount}`);
    console.log(
      `   - Total de operações: ${jsonBackup.summary.totalOperations}`,
    );

    console.log(`\n💡 Próximos passos:`);
    console.log(`   1. Execute: node scripts/fix-production-cash-dates.js`);
    console.log(`   2. Reinicie a aplicação em produção`);
    console.log(`   3. Teste a abertura de um novo caixa`);

    return {
      success: true,
      jsonPath,
      sqlPath,
      summary: jsonBackup.summary,
    };
  } catch (error) {
    console.error("❌ Erro ao criar backup:", error);
    return { success: false, error: error.message };
  } finally {
    await pool.end();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  backupProductionCashData().catch(console.error);
}

module.exports = { backupProductionCashData };
