#!/usr/bin/env node

require("dotenv").config();
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

/**
 * Script para executar correção de caixa em produção
 *
 * Este script detecta o ambiente e executa os comandos apropriados
 */

class ProductionCashFixer {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.getConfig();
  }

  detectEnvironment() {
    // Detectar ambiente baseado em variáveis disponíveis
    if (process.env.VERCEL) return "vercel";
    if (process.env.RAILWAY_ENVIRONMENT) return "railway";
    if (process.env.RENDER) return "render";
    if (process.env.HEROKU) return "heroku";
    if (process.env.DOCKER) return "docker";
    if (process.env.NODE_ENV === "production") return "production";
    return "local";
  }

  getConfig() {
    const baseConfig = {
      databaseUrl: process.env.DATABASE_URL || "",
      scriptsDir: "scripts",
    };

    // Configurações específicas por ambiente
    switch (this.environment) {
      case "vercel":
        return {
          ...baseConfig,
          runCommand: "vercel env pull .env.production &&",
          restartCommand: "vercel --prod",
        };

      case "railway":
        return {
          ...baseConfig,
          runCommand: "railway run",
          restartCommand: "railway redeploy",
        };

      case "render":
        return {
          ...baseConfig,
          runCommand: "render run",
          restartCommand: "render redeploy",
        };

      case "heroku":
        return {
          ...baseConfig,
          runCommand: "heroku run",
          restartCommand: "heroku restart",
        };

      case "docker":
        return {
          ...baseConfig,
          runCommand:
            "docker exec -it $(docker ps -q --filter ancestor=your-app)",
          restartCommand:
            "docker restart $(docker ps -q --filter ancestor=your-app)",
        };

      default:
        return {
          ...baseConfig,
          runCommand: "",
          restartCommand: "echo 'Reinicie manualmente sua aplicação'",
        };
    }
  }

  async runScript(scriptName) {
    const command = `${this.config.runCommand} node ${this.config.scriptsDir}/${scriptName}`;

    console.log(`🔄 Executando: ${command}`);
    console.log(`🌍 Ambiente: ${this.environment}`);

    try {
      const { stdout, stderr } = await execAsync(command);

      if (stdout) console.log(stdout);
      if (stderr) console.error(stderr);

      return { success: true, output: stdout };
    } catch (error) {
      console.error(`❌ Erro ao executar ${scriptName}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async executeFix() {
    console.log("🔧 Iniciando correção de caixa em produção...\n");
    console.log(`🌍 Ambiente detectado: ${this.environment}`);
    console.log(
      `📊 DATABASE_URL: ${this.config.databaseUrl ? "✅ Configurada" : "❌ Não encontrada"}\n`,
    );

    if (!this.config.databaseUrl) {
      console.error(
        "❌ DATABASE_URL não encontrada. Configure a variável de ambiente.",
      );
      process.exit(1);
    }

    // Passo 1: Backup
    console.log("📦 Passo 1: Criando backup...");
    const backupResult = await this.runScript("backup-production-cash.js");

    if (!backupResult.success) {
      console.error("❌ Falha no backup. Abortando correção.");
      process.exit(1);
    }

    console.log("✅ Backup concluído!\n");

    // Passo 2: Correção
    console.log("🔧 Passo 2: Executando correção...");
    const fixResult = await this.runScript("fix-production-cash-dates.js");

    if (!fixResult.success) {
      console.error("❌ Falha na correção.");
      process.exit(1);
    }

    console.log("✅ Correção concluída!\n");

    // Passo 3: Reiniciar aplicação
    console.log("🔄 Passo 3: Reiniciando aplicação...");
    console.log(`💡 Comando de reinicialização: ${this.config.restartCommand}`);
    console.log(
      "⚠️  Execute manualmente o comando acima para reiniciar a aplicação.\n",
    );

    console.log("🎉 Processo concluído!");
    console.log("💡 Próximos passos:");
    console.log("   1. Reinicie a aplicação");
    console.log("   2. Teste a abertura de um novo caixa");
    console.log("   3. Verifique se as datas estão corretas");
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const fixer = new ProductionCashFixer();

  switch (command) {
    case "backup":
      await fixer.runScript("backup-production-cash.js");
      break;

    case "fix":
      await fixer.runScript("fix-production-cash-dates.js");
      break;

    case "full":
    case undefined:
      await fixer.executeFix();
      break;

    case "help":
    default:
      console.log(`
🔧 Script de Correção de Caixa - Produção

Uso:
  node production-cash-fixer.js [command]

Comandos:
  backup                    Criar apenas backup
  fix                       Executar apenas correção
  full                      Executar processo completo (padrão)
  help                      Mostrar esta ajuda

Ambientes suportados:
  ✅ Local (desenvolvimento)
  ✅ Vercel (serverless)
  ✅ Railway (container)
  ✅ Render (container)
  ✅ Heroku (container)
  ✅ Docker (container)
  ✅ Produção genérica

Exemplos:
  node production-cash-fixer.js full
  node production-cash-fixer.js backup
  node production-cash-fixer.js fix

⚠️  IMPORTANTE:
  - Configure DATABASE_URL antes de executar
  - Execute fora do horário de pico
  - Monitore a aplicação após a correção
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { ProductionCashFixer };
