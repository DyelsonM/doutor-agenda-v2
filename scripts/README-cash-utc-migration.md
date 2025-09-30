# Sistema de Caixa com UTC - Solução Definitiva

O sistema foi modificado para usar **UTC** para armazenar os dados de caixa no banco de dados, garantindo consistência independente do fuso horário do servidor.

## 🔍 Problema Resolvido

- **Antes**: Datas eram salvas em horário local, causando inconsistências entre localhost e produção
- **Depois**: Datas são salvas em UTC e convertidas para horário local na exibição

## ✅ Solução Implementada

### 1. **Armazenamento em UTC**

- Todas as datas de caixa são salvas em UTC no banco de dados
- Conversão automática para UTC antes de salvar
- Consistência independente do fuso horário do servidor

### 2. **Exibição em Horário Local**

- Conversão automática de UTC para horário local (Brasil) na interface
- Usuário sempre vê as datas no horário correto
- Funciona corretamente em qualquer ambiente

### 3. **Componentes Atualizados**

- `src/actions/daily-cash/index.ts` - Actions convertem para UTC antes de salvar
- `src/app/(protected)/daily-cash/_components/cash-status-card.tsx` - Componente converte UTC para local na exibição

## 📋 Scripts de Migração

### `scripts/convert-cash-to-utc.js`

**Função**: Converte dados existentes de caixa para UTC
**Uso**: `node scripts/convert-cash-to-utc.js`
**Segurança**: ⚠️ **ALTERA DADOS NO BANCO DE DADOS**

## 🚀 Processo de Migração

### Passo 1: Backup (OBRIGATÓRIO)

```bash
node scripts/backup-production-cash.js
```

### Passo 2: Conversão para UTC

```bash
node scripts/convert-cash-to-utc.js
```

Este comando irá:

- Buscar todos os registros de caixa existentes
- Converter datas de horário local para UTC
- Atualizar o banco de dados com as datas corretas
- Exibir progresso em tempo real
- Mostrar resumo da operação

## 🔧 Como Funciona

### **Fluxo de Dados:**

1. **Entrada do Usuário**: Usuário abre caixa às 09:00 (horário local)
2. **Conversão para UTC**: Sistema converte para 12:00 UTC (Brasil é UTC-3)
3. **Armazenamento**: Banco salva 12:00 UTC
4. **Exibição**: Sistema converte 12:00 UTC para 09:00 local para mostrar ao usuário

### **Exemplo Prático:**

```
Usuário abre caixa: 29/09/2025 09:00 (horário local)
Sistema converte: 29/09/2025 12:00 UTC
Banco armazena: 29/09/2025 12:00 UTC
Interface exibe: 29/09/2025 09:00 (horário local)
```

## 🎯 Benefícios

- ✅ **Consistência**: Funciona igual em localhost e produção
- ✅ **Precisão**: Datas sempre corretas independente do servidor
- ✅ **Manutenibilidade**: Código mais robusto e previsível
- ✅ **Escalabilidade**: Funciona em qualquer fuso horário
- ✅ **Compatibilidade**: Mantém compatibilidade com dados existentes

## ⚠️ Importante

1. **SEMPRE execute o backup antes da conversão**
2. **Execute fora do horário de pico** para evitar conflitos
3. **Monitore a aplicação** após a conversão
4. **Reinicie a aplicação** após a conversão
5. **Teste a abertura de um novo caixa**

## 🔄 Reversão (se necessário)

Se algo der errado, você pode reverter usando o backup:

```bash
# Exemplo de reversão (substitua pelo arquivo correto)
psql $DATABASE_URL -f backups/cash-backup-YYYY-MM-DDTHH-MM-SS.sql
```

## 📊 O que a Conversão Faz

A conversão identifica caixas com datas em horário local e converte para UTC, assumindo que as datas foram salvas em horário local (Brasil) e precisam ser convertidas para UTC.

**Exemplos de conversão:**

- Data local: 2025-09-29T09:00:00-03:00 → Data UTC: 2025-09-29T12:00:00Z
- Horário local: 2025-09-29T21:04:00-03:00 → Horário UTC: 2025-09-30T00:04:00Z

## 🎉 Resultado Esperado

Após a conversão:

- Caixas abertos no dia 29/09 aparecerão como 29/09
- Horários de abertura serão exibidos corretamente
- Interface mostrará datas corretas
- Novos caixas já funcionam corretamente (devido às correções no código)
- Sistema funciona igual em localhost e produção

## 🔧 Correções no Código

### **Actions (`src/actions/daily-cash/index.ts`):**

```typescript
// Antes:
const today = dayjs().tz("America/Sao_Paulo").startOf("day").toDate();

// Depois:
const today = dayjs().tz("America/Sao_Paulo").startOf("day").utc().toDate();
```

### **Componentes (`src/app/(protected)/daily-cash/_components/cash-status-card.tsx`):**

```typescript
// Antes:
format(new Date(cash.date), "dd/MM/yyyy", { locale: ptBR });

// Depois:
format(dayjs(cash.date).utc().tz("America/Sao_Paulo").toDate(), "dd/MM/yyyy", {
  locale: ptBR,
});
```

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se o `DATABASE_URL` está configurado corretamente
2. Confirme que tem permissões de escrita no banco
3. Execute o backup antes de qualquer operação
4. Monitore os logs durante a execução
5. Reinicie a aplicação após a conversão

## 📝 Logs de Exemplo

```
🔄 Convertendo dados de caixa para UTC...

--- Processando Caixa abc123 (Dyelson Mota) ---
Status: open
Data original: 2025-09-29T09:00:00.000Z
Horário abertura original: 2025-09-29T21:04:00.000Z
Data UTC: 2025-09-29T12:00:00.000Z
Horário abertura UTC: 2025-09-30T00:04:00.000Z
🔧 CONVERTENDO: De horário local para UTC
✅ Caixa convertido com sucesso!

📊 Resumo da conversão:
✅ Caixas convertidos: 1
⏭️  Caixas ignorados: 0
❌ Erros: 0
📈 Total processado: 1
```

## 🎯 Comparação com Agendamentos

Esta solução segue exatamente o mesmo padrão implementado para os agendamentos:

- ✅ Armazenamento em UTC
- ✅ Conversão para horário local na exibição
- ✅ Scripts de migração para dados existentes
- ✅ Consistência entre ambientes
- ✅ Robustez e manutenibilidade

O sistema de caixa agora funciona de forma idêntica ao sistema de agendamentos, garantindo consistência e confiabilidade em todos os ambientes.
