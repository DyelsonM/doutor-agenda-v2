#!/bin/bash

# Script de configuração do sistema de backup
# Execute este script para configurar o sistema de backup

echo "🚀 Configurando Sistema de Backup do Doutor Agenda..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

# Criar diretórios de backup
echo "📁 Criando estrutura de diretórios..."
mkdir -p backups/database/{daily,weekly,monthly}
mkdir -p backups/files/{daily,weekly,monthly}
mkdir -p backups/temp
mkdir -p scripts

# Dar permissões de execução aos scripts
echo "🔧 Configurando permissões..."
chmod +x scripts/*.js 2>/dev/null || echo "⚠️  Scripts ainda não existem"

# Verificar dependências
echo "📦 Verificando dependências..."
if ! npm list node-cron >/dev/null 2>&1; then
    echo "📥 Instalando dependência node-cron..."
    npm install node-cron --legacy-peer-deps
fi

# Verificar variável de ambiente
echo "🔍 Verificando configuração..."
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Variável DATABASE_URL não encontrada"
    echo "   Certifique-se de configurar no arquivo .env"
else
    echo "✅ DATABASE_URL configurada"
fi

# Testar conexão com banco (se possível)
if command -v psql >/dev/null 2>&1 && [ ! -z "$DATABASE_URL" ]; then
    echo "🔗 Testando conexão com banco..."
    if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ Conexão com banco OK"
    else
        echo "⚠️  Não foi possível conectar ao banco"
    fi
else
    echo "⚠️  psql não encontrado ou DATABASE_URL não configurada"
fi

echo ""
echo "✅ Configuração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Configure DATABASE_URL no arquivo .env"
echo "   2. Teste um backup: npm run backup:daily"
echo "   3. Verifique estatísticas: npm run backup:stats"
echo "   4. Acesse a interface: /settings/backup"
echo ""
echo "📚 Documentação: backups/README.md"
