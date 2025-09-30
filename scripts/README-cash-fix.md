# Correção de Datas de Caixa - PRODUÇÃO

Este conjunto de scripts foi criado para corrigir o problema de datas de caixa que estão sendo exibidas incorretamente em **PRODUÇÃO** (ex: caixa aberto no dia 29/09 mas aparece como 28/09).

## 🔍 Problema Identificado

Os caixas em **PRODUÇÃO** foram salvos com datas incorretas devido a problemas de conversão UTC/local. No ambiente local os dados estão corretos, mas em produção há diferença de fuso horário.

### Causa do Problema

- **Localhost**: Servidor roda no fuso horário local (Brasil)
- **Produção**: Servidor roda em UTC ou outro fuso horário
- **Solução**: Usar `dayjs` com timezone "America/Sao_Paulo" em todas as operações

## 📋 Scripts para Produção

### 1. `backup-production-cash.js`

**Função**: Cria backup completo dos dados de caixa de produção antes da correção
**Uso**: `node scripts/backup-production-cash.js`
**Segurança**: ✅ Apenas leitura, cria arquivos de backup

### 2. `fix-production-cash-dates.js`

**Função**: Executa a correção das datas dos caixas em produção
**Uso**: `node scripts/fix-production-cash-dates.js`
**Segurança**: ⚠️ **ALTERA DADOS NO BANCO DE PRODUÇÃO**

## 🚀 Processo para Produção

### Passo 1: Backup (OBRIGATÓRIO)

```bash
node scripts/backup-production-cash.js
```

Este comando criará:

- Backup em JSON com todos os dados de caixa e operações
- Backup em SQL com comandos de reversão
- Arquivos salvos em `backups/` com timestamp
- Estatísticas dos dados (caixas abertos, fechados, operações)

### Passo 2: Execução da Correção

```bash
node scripts/fix-production-cash-dates.js
```

Este comando irá:

- Mostrar detalhes de cada caixa processado
- Detectar diferenças de timezone entre UTC e horário local
- Corrigir datas e horários que estão com diferença significativa
- Exibir progresso em tempo real
- Mostrar resumo final da operação

## ⚠️ Importante para Produção

1. **SEMPRE execute o backup antes da correção**
2. **Execute fora do horário de pico** para evitar conflitos
3. **Monitore a aplicação** após a correção
4. **Reinicie a aplicação** após a correção para garantir que as mudanças sejam refletidas
5. **Teste a interface** após a correção

## 🔄 Reversão (se necessário)

Se algo der errado, você pode reverter usando o backup SQL:

```bash
# Exemplo de reversão (substitua pelo arquivo correto)
psql $DATABASE_URL -f backups/cash-backup-YYYY-MM-DDTHH-MM-SS.sql
```

## 📊 O que a Correção Faz

A correção identifica caixas com datas/horários que têm diferença significativa (mais de 1 hora) entre UTC e horário local, assumindo que foram salvos incorretamente devido a problemas de fuso horário.

**Exemplos de correção:**

- Data UTC: 2025-09-28T21:00:00Z → Data Local: 2025-09-29T00:00:00-03:00
- Horário UTC: 2025-09-28T21:04:00Z → Horário Local: 2025-09-29T00:04:00-03:00

## 🎯 Resultado Esperado

Após a correção:

- Caixas abertos no dia 29/09 aparecerão como 29/09
- Horários de abertura serão exibidos corretamente
- Interface mostrará datas corretas
- Novos caixas já funcionam corretamente (devido às correções no código)

## 🔧 Correções no Código

As seguintes correções foram implementadas no código:

1. **`src/actions/daily-cash/index.ts`**:

   - Adicionado `dayjs` com plugins `utc` e `timezone`
   - Substituído `new Date()` por `dayjs().tz("America/Sao_Paulo")`
   - Corrigido todas as funções de criação e busca de caixa

2. **Funções corrigidas**:
   - `openCashAction`: Criação de caixa com timezone correto
   - `getDailyCashAction`: Busca de caixa com timezone correto
   - `getOpenCashAction`: Busca de caixa aberto com timezone correto

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se o `DATABASE_URL` está configurado corretamente
2. Confirme que tem permissões de escrita no banco
3. Execute o backup antes de qualquer operação
4. Monitore os logs durante a execução
5. Reinicie a aplicação após a correção

## 📝 Logs de Exemplo

```
🔧 Corrigindo datas de caixa em PRODUÇÃO...

--- Processando Caixa abc123 (Dyelson Mota) ---
Status: open
Data original: 2025-09-28T21:00:00.000Z
Data local (SP): 2025-09-29 00:00:00
Horário abertura original: 2025-09-28T21:04:00.000Z
Horário abertura local (SP): 2025-09-29 00:04:00
Diferença de data: 3 horas
Diferença de horário: 3 horas
🔧 CORRIGINDO: Convertendo de UTC para horário local
Data corrigida: 2025-09-29T00:00:00.000Z
Horário corrigido: 2025-09-29T00:04:00.000Z
✅ Caixa corrigido com sucesso!

📊 Resumo da correção:
✅ Caixas corrigidos: 1
⏭️  Caixas ignorados: 0
❌ Erros: 0
📈 Total processado: 1
```
