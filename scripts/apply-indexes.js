const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv/config");

async function applyIndexes() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("✓ Conectado ao banco de dados");

    // Ler o arquivo SQL
    const sqlPath = path.join(
      __dirname,
      "..",
      "drizzle",
      "0046_add_performance_indexes.sql",
    );
    const sql = fs.readFileSync(sqlPath, "utf8");

    console.log("Aplicando índices de performance...\n");

    // Executar o SQL
    await client.query(sql);

    console.log("✓ Índices criados com sucesso!\n");

    // Listar índices criados
    const result = await client.query(`
      SELECT 
        indexname, 
        tablename,
        indexdef
      FROM pg_indexes 
      WHERE indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `);

    console.log("Índices criados:");
    console.log("================\n");
    result.rows.forEach((row) => {
      console.log(`- ${row.indexname} em ${row.tablename}`);
    });
    console.log(`\nTotal: ${result.rows.length} índices`);
  } catch (error) {
    console.error("Erro ao aplicar índices:", error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

applyIndexes();
