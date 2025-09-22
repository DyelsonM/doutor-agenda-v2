# Correção de Horários de Agendamentos - PRODUÇÃO

Este conjunto de scripts foi criado para corrigir o problema de horários de agendamentos que estão sendo exibidos com 3 horas de diferença em **PRODUÇÃO** (ex: marcado às 09:00 mas aparece como 06:00).

## 🔍 Problema Identificado

Os agendamentos em **PRODUÇÃO** foram salvos com horários incorretos devido a problemas de conversão UTC/local. No ambiente local os dados estão corretos, mas em produção há diferença de 3 horas.

## 📋 Scripts para Produção

### 1. `backup-production-appointments.js`

**Função**: Cria backup completo dos agendamentos de produção antes da correção
**Uso**: `node scripts/backup-production-appointments.js`
**Segurança**: ✅ Apenas leitura, cria arquivos de backup

### 2. `fix-production-appointment-times.js`

**Função**: Executa a correção dos horários dos agendamentos em produção
**Uso**: `node scripts/fix-production-appointment-times.js`
**Segurança**: ⚠️ **ALTERA DADOS NO BANCO DE PRODUÇÃO**

## 🚀 Processo para Produção

### Passo 1: Backup (OBRIGATÓRIO)

```bash
node scripts/backup-production-appointments.js
```

Este comando criará:

- Backup em JSON com todos os dados
- Backup em SQL com comandos de reversão
- Arquivos salvos em `backups/` com timestamp

### Passo 2: Execução da Correção

```bash
node scripts/fix-production-appointment-times.js
```

Este comando irá:

- Mostrar detalhes de cada agendamento processado
- Corrigir apenas horários entre 00:00 e 06:59 (adicionando 3 horas)
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
psql $DATABASE_URL -f backups/production-appointments-backup-YYYY-MM-DDTHH-MM-SS.sql
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

1. Verifique se o `DATABASE_URL` está configurado corretamente
2. Confirme que tem permissões de escrita no banco
3. Execute o backup antes de qualquer operação
4. Monitore os logs durante a execução
5. Reinicie a aplicação após a correção
