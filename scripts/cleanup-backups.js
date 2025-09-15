#!/usr/bin/env node

const fs = require("fs/promises");
const path = require("path");
const cron = require("node-cron");

class BackupCleanup {
  constructor() {
    this.config = {
      backupDir: path.join(__dirname, "..", "backups"),
      retention: {
        daily: 7, // Manter 7 backups diários
        weekly: 4, // Manter 4 backups semanais
        monthly: 12, // Manter 12 backups mensais
      },
      logFile: path.join(__dirname, "..", "backups", "cleanup.log"),
    };
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    try {
      await fs.appendFile(this.config.logFile, logMessage);
    } catch (error) {
      console.error("Erro ao escrever log:", error);
    }

    console.log(message);
  }

  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  async cleanupDirectory(dirPath, type) {
    const stats = {
      filesRemoved: 0,
      spaceFreed: 0,
      errors: [],
    };

    try {
      const files = await fs.readdir(dirPath);

      // Filtrar arquivos de backup
      const backupFiles = files
        .filter((file) => {
          const isDbBackup =
            file.startsWith("backup_") && file.endsWith(".sql");
          const isFileBackup =
            file.startsWith("files_backup_") && file.endsWith(".tar.gz");
          return isDbBackup || isFileBackup;
        })
        .map((file) => ({
          name: file,
          path: path.join(dirPath, file),
        }))
        .sort((a, b) => b.name.localeCompare(a.name)); // Mais recente primeiro

      const retentionCount = this.config.retention[type];

      if (backupFiles.length > retentionCount) {
        const filesToDelete = backupFiles.slice(retentionCount);

        for (const file of filesToDelete) {
          try {
            const fileSize = await this.getFileSize(file.path);
            await fs.unlink(file.path);

            stats.filesRemoved++;
            stats.spaceFreed += fileSize;

            await this.log(
              `🗑️  Removido: ${file.name} (${(fileSize / (1024 * 1024)).toFixed(2)}MB)`,
            );
          } catch (error) {
            const errorMsg = `Erro ao remover ${file.name}: ${error}`;
            stats.errors.push(errorMsg);
            await this.log(`❌ ${errorMsg}`);
          }
        }
      }
    } catch (error) {
      const errorMsg = `Erro ao limpar diretório ${dirPath}: ${error}`;
      stats.errors.push(errorMsg);
      await this.log(`❌ ${errorMsg}`);
    }

    return stats;
  }

  async runCleanup() {
    await this.log("🧹 Iniciando limpeza automática de backups...");

    const totalStats = {
      filesRemoved: 0,
      spaceFreed: 0,
      errors: [],
    };

    const types = ["daily", "weekly", "monthly"];

    for (const type of types) {
      const dbDir = path.join(this.config.backupDir, "database", type);
      const filesDir = path.join(this.config.backupDir, "files", type);

      // Limpar backups de banco de dados
      const dbStats = await this.cleanupDirectory(dbDir, type);
      totalStats.filesRemoved += dbStats.filesRemoved;
      totalStats.spaceFreed += dbStats.spaceFreed;
      totalStats.errors.push(...dbStats.errors);

      // Limpar backups de arquivos
      const filesStats = await this.cleanupDirectory(filesDir, type);
      totalStats.filesRemoved += filesStats.filesRemoved;
      totalStats.spaceFreed += filesStats.spaceFreed;
      totalStats.errors.push(...filesStats.errors);
    }

    // Log do resumo
    const spaceFreedMB = (totalStats.spaceFreed / (1024 * 1024)).toFixed(2);
    await this.log(
      `✅ Limpeza concluída: ${totalStats.filesRemoved} arquivos removidos, ${spaceFreedMB}MB liberados`,
    );

    if (totalStats.errors.length > 0) {
      await this.log(
        `⚠️  ${totalStats.errors.length} erros encontrados durante a limpeza`,
      );
    }
  }

  async getBackupStats() {
    const stats = {
      database: { daily: 0, weekly: 0, monthly: 0, totalSize: 0 },
      files: { daily: 0, weekly: 0, monthly: 0, totalSize: 0 },
      totalFiles: 0,
      totalSize: 0,
    };

    const types = ["daily", "weekly", "monthly"];

    for (const type of types) {
      // Estatísticas de banco de dados
      const dbDir = path.join(this.config.backupDir, "database", type);
      try {
        const dbFiles = await fs.readdir(dbDir);
        const dbBackups = dbFiles.filter(
          (file) => file.startsWith("backup_") && file.endsWith(".sql"),
        );

        stats.database[type] = dbBackups.length;

        for (const file of dbBackups) {
          const filePath = path.join(dbDir, file);
          const fileSize = await this.getFileSize(filePath);
          stats.database.totalSize += fileSize;
        }
      } catch (error) {
        // Diretório não existe
      }

      // Estatísticas de arquivos
      const filesDir = path.join(this.config.backupDir, "files", type);
      try {
        const fileFiles = await fs.readdir(filesDir);
        const fileBackups = fileFiles.filter(
          (file) =>
            file.startsWith("files_backup_") && file.endsWith(".tar.gz"),
        );

        stats.files[type] = fileBackups.length;

        for (const file of fileBackups) {
          const filePath = path.join(filesDir, file);
          const fileSize = await this.getFileSize(filePath);
          stats.files.totalSize += fileSize;
        }
      } catch (error) {
        // Diretório não existe
      }
    }

    stats.totalFiles =
      stats.database.daily +
      stats.database.weekly +
      stats.database.monthly +
      stats.files.daily +
      stats.files.weekly +
      stats.files.monthly;
    stats.totalSize = stats.database.totalSize + stats.files.totalSize;

    return stats;
  }

  async scheduleCleanup() {
    // Executar limpeza todos os dias às 2:00 AM
    cron.schedule("0 2 * * *", async () => {
      await this.runCleanup();
    });

    await this.log(
      "⏰ Limpeza automática agendada para executar diariamente às 2:00 AM",
    );
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const cleanup = new BackupCleanup();

  switch (command) {
    case "run":
      await cleanup.runCleanup();
      break;

    case "stats":
      const stats = await cleanup.getBackupStats();
      console.log("\n📊 Estatísticas de Backup:");
      console.log(`  Banco de Dados:`);
      console.log(`    Diário: ${stats.database.daily} arquivos`);
      console.log(`    Semanal: ${stats.database.weekly} arquivos`);
      console.log(`    Mensal: ${stats.database.monthly} arquivos`);
      console.log(
        `    Tamanho total: ${(stats.database.totalSize / (1024 * 1024)).toFixed(2)}MB`,
      );
      console.log(`  Arquivos:`);
      console.log(`    Diário: ${stats.files.daily} arquivos`);
      console.log(`    Semanal: ${stats.files.weekly} arquivos`);
      console.log(`    Mensal: ${stats.files.monthly} arquivos`);
      console.log(
        `    Tamanho total: ${(stats.files.totalSize / (1024 * 1024)).toFixed(2)}MB`,
      );
      console.log(
        `  Total: ${stats.totalFiles} arquivos, ${(stats.totalSize / (1024 * 1024)).toFixed(2)}MB`,
      );
      break;

    case "schedule":
      await cleanup.scheduleCleanup();
      console.log(
        "⏰ Limpeza automática iniciada. Pressione Ctrl+C para parar.",
      );

      // Manter o processo rodando
      process.on("SIGINT", () => {
        console.log("\n🛑 Limpeza automática interrompida.");
        process.exit(0);
      });

      // Manter vivo
      setInterval(() => {}, 1000);
      break;

    default:
      console.log(`
🧹 Sistema de Limpeza Automática de Backups

Uso:
  node cleanup-backups.js <command>

Comandos:
  run                      Executar limpeza manual
  stats                    Mostrar estatísticas de backups
  schedule                 Iniciar limpeza automática agendada

Exemplos:
  node cleanup-backups.js run
  node cleanup-backups.js stats
  node cleanup-backups.js schedule
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { BackupCleanup };
