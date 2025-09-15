# Sistema de Backup - Doutor Agenda

Sistema completo de backup para o Doutor Agenda, incluindo backup do banco de dados PostgreSQL, arquivos do sistema e limpeza automática.

## 📁 Estrutura

```
backups/
├── database/
│   ├── daily/          # Backups diários do banco
│   ├── weekly/         # Backups semanais do banco
│   └── monthly/        # Backups mensais do banco
├── files/
│   ├── daily/          # Backups diários de arquivos
│   ├── weekly/         # Backups semanais de arquivos
│   └── monthly/        # Backups mensais de arquivos
├── temp/               # Arquivos temporários
└── cleanup.log         # Log de limpeza automática

scripts/
├── backup-database.js  # Script de backup do banco
├── backup-files.js     # Script de backup de arquivos
├── backup-manager.js   # Gerenciador principal
└── cleanup-backups.js  # Sistema de limpeza
```

## 🚀 Comandos Disponíveis

### Via npm scripts:

```bash
# Backups completos
npm run backup:daily     # Backup diário completo
npm run backup:weekly    # Backup semanal completo
npm run backup:monthly   # Backup mensal completo

# Backups individuais
npm run backup:db        # Apenas banco de dados
npm run backup:files     # Apenas arquivos

# Gerenciamento
npm run backup:list      # Listar todos os backups
npm run backup:stats     # Mostrar estatísticas
npm run backup:cleanup   # Executar limpeza manual
npm run backup:schedule  # Iniciar limpeza automática
```

### Via scripts diretos:

```bash
# Backup completo
node scripts/backup-manager.js daily
node scripts/backup-manager.js weekly
node scripts/backup-manager.js monthly

# Listar backups
node scripts/backup-manager.js list

# Restaurar backup
node scripts/backup-manager.js restore daily backup_daily_2024-01-15_10-30-00.sql --confirm

# Estatísticas
node scripts/cleanup-backups.js stats

# Limpeza manual
node scripts/cleanup-backups.js run
```

## ⚙️ Configuração

### Variáveis de Ambiente

Certifique-se de que a variável `DATABASE_URL` está configurada:

```env
DATABASE_URL=postgres://user:password@host:port/database
```

### Retenção de Backups

Por padrão, o sistema mantém:

- **Diários**: 7 backups
- **Semanais**: 4 backups
- **Mensais**: 12 backups

Para alterar, edite os arquivos de script.

## 📊 O que é Incluído nos Backups

### Banco de Dados

- Todas as tabelas e dados
- Estrutura completa do banco
- Índices e constraints

### Arquivos

- `public/uploads/` - Arquivos enviados pelos usuários
- `.env` - Configurações de ambiente
- `drizzle.config.ts` - Configuração do Drizzle
- `package.json` e `package-lock.json` - Dependências

## 🔄 Limpeza Automática

O sistema inclui limpeza automática que:

- Remove backups antigos baseado na política de retenção
- Executa diariamente às 2:00 AM
- Registra todas as operações no log
- Libera espaço em disco automaticamente

Para iniciar a limpeza automática:

```bash
npm run backup:schedule
```

## 🛠️ Restauração

### Restaurar Banco de Dados

```bash
# Restaurar backup específico
node scripts/backup-manager.js restore daily backup_daily_2024-01-15_10-30-00.sql --confirm

# Restaurar com arquivos
node scripts/backup-manager.js restore daily backup_daily_2024-01-15_10-30-00.sql --files --confirm
```

### Restaurar Arquivos

```bash
# Restaurar arquivos para diretório específico
node scripts/backup-files.js restore daily files_backup_daily_2024-01-15_10-30-00.tar.gz /path/to/restore --confirm
```

## 🖥️ Interface Web

Acesse a interface de backup em:

- **URL**: `/settings/backup`
- **Permissão**: Apenas administradores
- **Funcionalidades**:
  - Criar backups manuais
  - Visualizar estatísticas
  - Listar backups existentes
  - Restaurar backups (em desenvolvimento)

## 📝 Logs

Os logs são salvos em:

- `backups/cleanup.log` - Log de limpeza automática
- Console - Logs em tempo real dos scripts

## ⚠️ Importante

1. **Teste os backups**: Sempre teste a restauração em ambiente de desenvolvimento
2. **Monitore espaço**: Verifique regularmente o espaço em disco
3. **Backup externo**: Considere fazer backup dos arquivos para local externo
4. **Permissões**: Certifique-se de que o usuário tem permissões adequadas no PostgreSQL

## 🔧 Solução de Problemas

### Erro de Permissão

```bash
# Dar permissão de execução aos scripts
chmod +x scripts/*.js
```

### Erro de Conexão com Banco

- Verifique se `DATABASE_URL` está correto
- Teste a conexão: `psql $DATABASE_URL`

### Erro de Espaço em Disco

- Execute limpeza manual: `npm run backup:cleanup`
- Verifique estatísticas: `npm run backup:stats`

### Script não Encontrado

- Instale dependências: `npm install`
- Verifique se está no diretório correto do projeto
