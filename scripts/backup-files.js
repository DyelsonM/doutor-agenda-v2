#!/usr/bin/env node

require("dotenv").config();
const fs = require("fs/promises");
const path = require("path");
const { createReadStream, createWriteStream } = require("fs");
const { pipeline } = require("stream/promises");
const { createGzip } = require("zlib");

class FileBackup {
  constructor() {
    this.config = {
      sourceDirs: [
        path.join(__dirname, "..", "public", "uploads"),
        path.join(__dirname, "..", ".env"),
        path.join(__dirname, "..", "drizzle.config.ts"),
        path.join(__dirname, "..", "package.json"),
        path.join(__dirname, "..", "package-lock.json"),
      ],
      backupDir: path.join(__dirname, "..", "backups", "files"),
      retention: {
        daily: 7, // Manter 7 backups diários
        weekly: 4, // Manter 4 backups semanais
        monthly: 12, // Manter 12 backups mensais
      },
    };
  }

  generateFilename(type) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, "-").split("T")[0];
    const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");

    return `files_backup_${type}_${timestamp}_${time}.tar.gz`;
  }

  async copyFile(src, dest) {
    const destDir = path.dirname(dest);
    await fs.mkdir(destDir, { recursive: true });

    const readStream = createReadStream(src);
    const writeStream = createWriteStream(dest);

    await pipeline(readStream, writeStream);
  }

  async copyDirectory(src, dest) {
    let fileCount = 0;

    try {
      const entries = await fs.readdir(src, { withFileTypes: true });

      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          fileCount += await this.copyDirectory(srcPath, destPath);
        } else {
          await this.copyFile(srcPath, destPath);
          fileCount++;
        }
      }
    } catch (error) {
      // Diretório não existe ou erro de permissão
      console.warn(`⚠️  Aviso: Não foi possível copiar ${src}: ${error}`);
    }

    return fileCount;
  }

  async createTarGz(sourceDir, outputFile) {
    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execAsync = promisify(exec);

    // Detectar sistema operacional
    const isWindows = process.platform === "win32";

    if (isWindows) {
      // No Windows, usar PowerShell para criar arquivo ZIP
      const zipFile = outputFile.replace(".tar.gz", ".zip");
      const sourceDirName = path.basename(sourceDir);
      const parentDir = path.dirname(sourceDir);

      const command = `powershell -Command "Compress-Archive -Path '${sourceDir}\\*' -DestinationPath '${zipFile}' -Force"`;
      await execAsync(command);

      // Renomear para .tar.gz para manter compatibilidade
      await fs.rename(zipFile, outputFile);
    } else {
      // No Linux/Mac, usar tar normalmente
      const command = `tar -czf "${outputFile}" -C "${path.dirname(sourceDir)}" "${path.basename(sourceDir)}"`;
      await execAsync(command);
    }
  }

  async createBackup(type) {
    const startTime = Date.now();
    const filename = this.generateFilename(type);
    const tempDir = path.join(
      this.config.backupDir,
      "temp",
      `backup_${Date.now()}`,
    );
    const outputFile = path.join(this.config.backupDir, type, filename);

    try {
      // Criar diretório temporário
      await fs.mkdir(tempDir, { recursive: true });
      await fs.mkdir(path.dirname(outputFile), { recursive: true });

      let totalFiles = 0;

      // Copiar cada diretório/arquivo fonte
      for (const sourcePath of this.config.sourceDirs) {
        const sourceName = path.basename(sourcePath);
        const destPath = path.join(tempDir, sourceName);

        try {
          const stats = await fs.stat(sourcePath);

          if (stats.isDirectory()) {
            totalFiles += await this.copyDirectory(sourcePath, destPath);
          } else {
            await this.copyFile(sourcePath, destPath);
            totalFiles++;
          }
        } catch (error) {
          console.warn(
            `⚠️  Aviso: Não foi possível copiar ${sourcePath}: ${error}`,
          );
        }
      }

      // Criar arquivo tar.gz
      await this.createTarGz(tempDir, outputFile);

      // Limpar diretório temporário
      await fs.rm(tempDir, { recursive: true, force: true });

      // Verificar tamanho do arquivo
      const stats = await fs.stat(outputFile);
      const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

      const duration = Date.now() - startTime;

      console.log(
        `✅ Backup de arquivos ${type} criado: ${filename} (${sizeInMB}MB, ${totalFiles} arquivos) em ${duration}ms`,
      );

      return {
        success: true,
        filename,
        size: `${sizeInMB}MB`,
        fileCount: totalFiles,
        duration,
      };
    } catch (error) {
      // Limpar diretório temporário em caso de erro
      await fs.rm(tempDir, { recursive: true, force: true });

      console.error(`❌ Erro ao criar backup de arquivos ${type}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  async cleanupOldBackups(type) {
    try {
      const dirPath = path.join(this.config.backupDir, type);
      const files = await fs.readdir(dirPath);

      // Filtrar apenas arquivos de backup
      const backupFiles = files
        .filter(
          (file) =>
            file.startsWith("files_backup_") && file.endsWith(".tar.gz"),
        )
        .map((file) => ({
          name: file,
          path: path.join(dirPath, file),
        }))
        .sort((a, b) => b.name.localeCompare(a.name)); // Mais recente primeiro

      const retentionCount = this.config.retention[type];

      if (backupFiles.length > retentionCount) {
        const filesToDelete = backupFiles.slice(retentionCount);

        for (const file of filesToDelete) {
          await fs.unlink(file.path);
          console.log(`🗑️  Removido backup de arquivos antigo: ${file.name}`);
        }
      }
    } catch (error) {
      console.error(
        `❌ Erro na limpeza de backups de arquivos ${type}:`,
        error,
      );
    }
  }

  async runBackup(type = "daily") {
    console.log(`🔄 Iniciando backup de arquivos ${type}...`);

    const result = await this.createBackup(type);

    if (result.success) {
      await this.cleanupOldBackups(type);
    }

    return result;
  }

  async listBackups(type) {
    const types = type ? [type] : ["daily", "weekly", "monthly"];
    const backups = [];

    for (const t of types) {
      try {
        const dirPath = path.join(this.config.backupDir, t);
        const files = await fs.readdir(dirPath);

        for (const file of files) {
          if (file.startsWith("files_backup_") && file.endsWith(".tar.gz")) {
            const filepath = path.join(dirPath, file);
            const stats = await fs.stat(filepath);

            backups.push({
              type: t,
              filename: file,
              size: `${(stats.size / (1024 * 1024)).toFixed(2)}MB`,
              createdAt: stats.birthtime,
              modifiedAt: stats.mtime,
            });
          }
        }
      } catch (error) {
        console.error(`❌ Erro ao listar backups de arquivos ${t}:`, error);
      }
    }

    return backups.sort((a, b) => b.createdAt - a.createdAt);
  }

  async restoreBackup(filename, type, restorePath) {
    try {
      const filepath = path.join(this.config.backupDir, type, filename);
      const targetPath =
        restorePath || path.join(__dirname, "..", "restored_files");

      // Verificar se o arquivo existe
      await fs.access(filepath);

      // Criar diretório de destino
      await fs.mkdir(targetPath, { recursive: true });

      // Extrair arquivo
      const { exec } = require("child_process");
      const { promisify } = require("util");
      const execAsync = promisify(exec);

      const isWindows = process.platform === "win32";

      if (isWindows) {
        // No Windows, usar PowerShell para extrair ZIP
        const command = `powershell -Command "Expand-Archive -Path '${filepath}' -DestinationPath '${targetPath}' -Force"`;
        await execAsync(command);
      } else {
        // No Linux/Mac, usar tar normalmente
        const command = `tar -xzf "${filepath}" -C "${targetPath}"`;
        await execAsync(command);
      }

      console.log(
        `✅ Restore de arquivos concluído: ${filename} -> ${targetPath}`,
      );
      return true;
    } catch (error) {
      console.error(`❌ Erro no restore de arquivos:`, error);
      return false;
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const backup = new FileBackup();

  switch (command) {
    case "daily":
    case "weekly":
    case "monthly":
      await backup.runBackup(command);
      break;

    case "list":
      const backups = await backup.listBackups();
      console.log("\n📋 Backups de arquivos disponíveis:");
      backups.forEach((b) => {
        console.log(
          `  ${b.type.padEnd(7)} | ${b.filename.padEnd(40)} | ${b.size.padEnd(8)} | ${b.createdAt.toLocaleString()}`,
        );
      });
      break;

    case "restore":
      const type = args[1];
      const filename = args[2];
      const restorePath = args[3];

      if (!type || !filename) {
        console.error(
          "❌ Uso: node backup-files.js restore <type> <filename> [restore-path]",
        );
        process.exit(1);
      }

      const confirmed = args.includes("--confirm");
      if (!confirmed) {
        console.error("❌ Use --confirm para confirmar o restore");
        process.exit(1);
      }

      await backup.restoreBackup(filename, type, restorePath);
      break;

    default:
      console.log(`
🔄 Sistema de Backup de Arquivos

Uso:
  node backup-files.js <command> [options]

Comandos:
  daily                    Criar backup diário de arquivos
  weekly                   Criar backup semanal de arquivos
  monthly                  Criar backup mensal de arquivos
  list                     Listar todos os backups de arquivos
  restore <type> <file>    Restaurar backup de arquivos (use --confirm)

Exemplos:
  node backup-files.js daily
  node backup-files.js list
  node backup-files.js restore daily files_backup_daily_2024-01-15_10-30-00.tar.gz --confirm
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { FileBackup };
