#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

async function setupBackupSystem() {
  console.log("🚀 Configurando Sistema de Backup do Doutor Agenda...\n");

  try {
    // 1. Verificar estrutura de diretórios
    console.log("📁 Verificando estrutura de diretórios...");
    const dirs = [
      "backups/database/daily",
      "backups/database/weekly",
      "backups/database/monthly",
      "backups/files/daily",
      "backups/files/weekly",
      "backups/files/monthly",
      "backups/temp",
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`  ✅ ${dir}`);
      } catch (error) {
        console.log(`  ⚠️  ${dir} - ${error.message}`);
      }
    }

    // 2. Verificar arquivo .env
    console.log("\n🔍 Verificando configuração...");
    try {
      const envContent = await fs.readFile(".env", "utf8");
      if (envContent.includes("DATABASE_URL")) {
        console.log("  ✅ DATABASE_URL configurada");
      } else {
        console.log("  ⚠️  DATABASE_URL não encontrada no .env");
      }
    } catch (error) {
      console.log("  ❌ Arquivo .env não encontrado");
    }

    // 3. Testar scripts
    console.log("\n🧪 Testando scripts...");
    try {
      const testResult = await execAsync("node scripts/test-backup.js");
      console.log("  ✅ Scripts funcionando corretamente");
    } catch (error) {
      console.log("  ⚠️  Erro nos testes:", error.message);
    }

    // 4. Criar backup de teste
    console.log("\n🔄 Criando backup de teste...");
    try {
      const backupResult = await execAsync("npm run backup:daily");
      console.log("  ✅ Backup de teste criado com sucesso");
    } catch (error) {
      console.log("  ⚠️  Erro no backup de teste:", error.message);
    }

    // 5. Verificar estatísticas
    console.log("\n📊 Verificando estatísticas...");
    try {
      const statsResult = await execAsync("npm run backup:stats");
      console.log("  ✅ Estatísticas funcionando");
    } catch (error) {
      console.log("  ⚠️  Erro nas estatísticas:", error.message);
    }

    console.log("\n🎉 Configuração concluída!");
    console.log("\n📋 Próximos passos:");
    console.log("  1. Acesse a interface web: /settings/backup");
    console.log("  2. Configure backup automático com cron jobs");
    console.log("  3. Monitore os backups regularmente");
    console.log("  4. Teste o restore em ambiente de desenvolvimento");

    console.log("\n🔧 Comandos úteis:");
    console.log("  npm run backup:daily     # Backup diário");
    console.log("  npm run backup:weekly     # Backup semanal");
    console.log("  npm run backup:monthly    # Backup mensal");
    console.log("  npm run backup:stats      # Ver estatísticas");
    console.log("  npm run backup:list       # Listar backups");
    console.log("  npm run backup:test       # Testar sistema");
  } catch (error) {
    console.error("❌ Erro durante configuração:", error);
  }
}

if (require.main === module) {
  setupBackupSystem().catch(console.error);
}

module.exports = { setupBackupSystem };
