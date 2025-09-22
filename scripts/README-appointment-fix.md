# Correção de Horários de Agendamentos

Este conjunto de scripts foi criado para corrigir o problema de horários de agendamentos que estão sendo exibidos com 3 horas de diferença (ex: marcado às 09:00 mas aparece como 06:00).

## 🔍 Problema Identificado

Os agendamentos existentes no banco de dados foram salvos com horários incorretos devido a problemas de conversão UTC/local. As correções no código só afetam novos agendamentos.

## 📋 Scripts Disponíveis

### 1. `analyze-appointment-times.js`

**Função**: Analisa todos os agendamentos e mostra quais precisam de correção
**Uso**: `node scripts/analyze-appointment-times.js`
**Segurança**: ✅ Apenas leitura, não altera dados

### 2. `backup-appointments-before-fix.js`

**Função**: Cria backup completo dos agendamentos antes da correção
**Uso**: `node scripts/backup-appointments-before-fix.js`
**Segurança**: ✅ Apenas leitura, cria arquivos de backup

### 3. `fix-appointment-times-execute.js`

**Função**: Executa a correção dos horários dos agendamentos
**Uso**: `node scripts/fix-appointment-times-execute.js`
**Segurança**: ⚠️ **ALTERA DADOS NO BANCO**

## 🚀 Processo Recomendado

### Passo 1: Análise

```bash
node scripts/analyze-appointment-times.js
```

Este comando mostrará:

- Quantos agendamentos precisam de correção
- Lista detalhada dos agendamentos que serão afetados
- Horários atuais vs. horários corrigidos

### Passo 2: Backup (OBRIGATÓRIO)

```bash
node scripts/backup-appointments-before-fix.js
```

Este comando criará:

- Backup em JSON com todos os dados
- Backup em SQL com comandos de reversão
- Arquivos salvos em `backups/` com timestamp

### Passo 3: Execução da Correção

```bash
node scripts/fix-appointment-times-execute.js
```

Este comando irá:

- Corrigir os horários dos agendamentos identificados
- Mostrar progresso em tempo real
- Exibir resumo final da operação

## ⚠️ Importante

1. **SEMPRE execute o backup antes da correção**
2. **Teste primeiro em ambiente de desenvolvimento** se possível
3. **Execute fora do horário de pico** para evitar conflitos
4. **Monitore a aplicação** após a correção

## 🔄 Reversão (se necessário)

Se algo der errado, você pode reverter usando o backup SQL:

```bash
# Exemplo de reversão (substitua pelo arquivo correto)
psql $DATABASE_URL -f backups/appointments-backup-YYYY-MM-DDTHH-MM-SS.sql
```

## 📊 O que a Correção Faz

A correção identifica agendamentos com horários entre 00:00 e 06:59 e adiciona 3 horas, assumindo que foram salvos incorretamente devido a problemas de fuso horário.

**Exemplos de correção:**

- 06:00 → 09:00
- 08:30 → 11:30
- 14:00 → 17:00

## 🎯 Resultado Esperado

Após a correção:

- Agendamentos marcados às 09:00 aparecerão como 09:00
- Horários no calendário serão exibidos corretamente
- Lista de agendamentos mostrará horários corretos
- Novos agendamentos já funcionam corretamente (devido às correções no código)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se o `DATABASE_URL` está configurado
2. Confirme que tem permissões de escrita no banco
3. Execute o backup antes de qualquer operação
4. Monitore os logs durante a execução
