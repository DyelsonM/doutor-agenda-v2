#!/usr/bin/env node

const { DatabaseBackup } = require("./backup-database.js");
const { FileBackup } = require("./backup-files.js");
const { BackupCleanup } = require("./cleanup-backups.js");

class BackupManager {
  constructor() {
    this.dbBackup = new DatabaseBackup();
    this.fileBackup = new FileBackup();
    this.cleanup = new BackupCleanup();
  }

  async runFullBackup(type = "daily") {
    const startTime = Date.now();
    console.log(`🚀 Iniciando backup completo ${type}...\n`);

    const result = {
      database: null,
      files: null,
      cleanup: null,
      totalDuration: 0,
    };

    try {
      // Backup do banco de dados
      console.log("📊 Fazendo backup do banco de dados...");
      result.database = await this.dbBackup.runBackup(type);

      if (result.database.success) {
        console.log(
          `✅ Backup do banco: ${result.database.filename} (${result.database.size})\n`,
        );
      } else {
        console.log(`❌ Erro no backup do banco: ${result.database.error}\n`);
      }

      // Backup de arquivos
      console.log("📁 Fazendo backup de arquivos...");
      result.files = await this.fileBackup.runBackup(type);

      if (result.files.success) {
        console.log(
          `✅ Backup de arquivos: ${result.files.filename} (${result.files.size}, ${result.files.fileCount} arquivos)\n`,
        );
      } else {
        console.log(`❌ Erro no backup de arquivos: ${result.files.error}\n`);
      }

      // Limpeza automática
      console.log("🧹 Executando limpeza automática...");
      await this.cleanup.runCleanup();
      result.cleanup = { success: true };
    } catch (error) {
      console.error("❌ Erro durante backup completo:", error);
    }

    result.totalDuration = Date.now() - startTime;

    // Resumo final
    console.log("\n📋 Resumo do Backup:");
    console.log(
      `  Duração total: ${(result.totalDuration / 1000).toFixed(2)}s`,
    );

    if (result.database?.success) {
      console.log(`  ✅ Banco de dados: ${result.database.filename}`);
    } else {
      console.log(`  ❌ Banco de dados: Falhou`);
    }

    if (result.files?.success) {
      console.log(`  ✅ Arquivos: ${result.files.filename}`);
    } else {
      console.log(`  ❌ Arquivos: Falhou`);
    }

    return result;
  }

  async listAllBackups() {
    console.log("📋 Listando todos os backups...\n");

    // Listar backups de banco
    console.log("📊 Backups de Banco de Dados:");
    const dbBackups = await this.dbBackup.listBackups();
    if (dbBackups.length === 0) {
      console.log("  Nenhum backup encontrado");
    } else {
      dbBackups.forEach((b) => {
        console.log(
          `  ${b.type.padEnd(7)} | ${b.filename.padEnd(35)} | ${b.size.padEnd(8)} | ${b.createdAt.toLocaleString()}`,
        );
      });
    }

    console.log("\n📁 Backups de Arquivos:");
    const fileBackups = await this.fileBackup.listBackups();
    if (fileBackups.length === 0) {
      console.log("  Nenhum backup encontrado");
    } else {
      fileBackups.forEach((b) => {
        console.log(
          `  ${b.type.padEnd(7)} | ${b.filename.padEnd(40)} | ${b.size.padEnd(8)} | ${b.createdAt.toLocaleString()}`,
        );
      });
    }

    // Estatísticas
    console.log("\n📊 Estatísticas:");
    const stats = await this.cleanup.getBackupStats();
    console.log(`  Total de arquivos: ${stats.totalFiles}`);
    console.log(
      `  Tamanho total: ${(stats.totalSize / (1024 * 1024)).toFixed(2)}MB`,
    );
  }

  async restoreBackup(type, filename, restoreFiles = false) {
    console.log(`🔄 Iniciando restore do backup ${filename}...\n`);

    try {
      // Restaurar banco de dados
      console.log("📊 Restaurando banco de dados...");
      const dbSuccess = await this.dbBackup.restoreBackup(filename, type);

      if (dbSuccess) {
        console.log("✅ Banco de dados restaurado com sucesso");
      } else {
        console.log("❌ Falha ao restaurar banco de dados");
      }

      // Restaurar arquivos se solicitado
      if (restoreFiles) {
        console.log("📁 Restaurando arquivos...");
        const filesSuccess = await this.fileBackup.restoreBackup(
          filename,
          type,
        );

        if (filesSuccess) {
          console.log("✅ Arquivos restaurados com sucesso");
        } else {
          console.log("❌ Falha ao restaurar arquivos");
        }
      }
    } catch (error) {
      console.error("❌ Erro durante restore:", error);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const manager = new BackupManager();

  switch (command) {
    case "daily":
    case "weekly":
    case "monthly":
      await manager.runFullBackup(command);
      break;

    case "list":
      await manager.listAllBackups();
      break;

    case "restore":
      const type = args[1];
      const filename = args[2];
      const restoreFiles = args.includes("--files");

      if (!type || !filename) {
        console.error(
          "❌ Uso: node backup-manager.js restore <type> <filename> [--files]",
        );
        process.exit(1);
      }

      const confirmed = args.includes("--confirm");
      if (!confirmed) {
        console.error(
          "❌ Use --confirm para confirmar o restore (isso irá sobrescrever dados atuais)",
        );
        process.exit(1);
      }

      await manager.restoreBackup(type, filename, restoreFiles);
      break;

    default:
      console.log(`
🚀 Gerenciador de Backup Completo

Uso:
  node backup-manager.js <command> [options]

Comandos:
  daily                    Backup completo diário (banco + arquivos + limpeza)
  weekly                   Backup completo semanal
  monthly                  Backup completo mensal
  list                     Listar todos os backups
  restore <type> <file>    Restaurar backup (use --confirm)

Opções:
  --files                  Incluir arquivos no restore
  --confirm                Confirmar operação de restore

Exemplos:
  node backup-manager.js daily
  node backup-manager.js list
  node backup-manager.js restore daily backup_daily_2024-01-15_10-30-00.sql --confirm
  node backup-manager.js restore daily backup_daily_2024-01-15_10-30-00.sql --files --confirm
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { BackupManager };
