# Sistema de Agendamentos com UTC

O sistema foi modificado para usar **UTC** para armazenar os agendamentos no banco de dados, garantindo consistência independente do fuso horário do servidor.

## 🔄 Mudanças Implementadas

### 1. **Criação de Agendamentos**

- ✅ Agendamentos são salvos em **UTC** no banco de dados
- ✅ Validação de horários funciona com horário local
- ✅ Conversão automática para UTC antes de salvar

### 2. **Exibição de Agendamentos**

- ✅ Lista de agendamentos converte UTC para horário local
- ✅ Calendário exibe horários corretos
- ✅ Modal de detalhes mostra horários corretos

### 3. **Validação de Disponibilidade**

- ✅ Horários disponíveis são calculados corretamente
- ✅ Verificação de conflitos funciona com UTC

## 🚀 Scripts para Migração

### `scripts/convert-appointments-to-utc.js`

**Função**: Converte agendamentos existentes para UTC
**Uso**: `node scripts/convert-appointments-to-utc.js`
**Segurança**: ⚠️ **ALTERA DADOS NO BANCO**

## 📋 Processo de Migração

### Passo 1: Backup (OBRIGATÓRIO)

```bash
node scripts/backup-production-appointments.js
```

### Passo 2: Conversão para UTC

```bash
node scripts/convert-appointments-to-utc.js
```

### Passo 3: Reiniciar Aplicação

```bash
# Reinicie a aplicação para aplicar as mudanças
```

## 🎯 Como Funciona Agora

### **Criação de Agendamento:**

1. Usuário seleciona horário local (ex: 09:00)
2. Sistema converte para UTC antes de salvar
3. Banco armazena em UTC (ex: 12:00 UTC)

### **Exibição de Agendamento:**

1. Sistema busca dados em UTC do banco
2. Converte UTC para horário local para exibição
3. Usuário vê horário correto (ex: 09:00)

## ⚠️ Importante

1. **Execute o backup antes da conversão**
2. **Reinicie a aplicação após a conversão**
3. **Teste a interface após a conversão**
4. **Novos agendamentos já funcionam corretamente**

## 🔍 Verificação

Após a migração:

- ✅ Agendamentos marcados às 09:00 aparecerão como 09:00
- ✅ Horários no calendário serão exibidos corretamente
- ✅ Lista de agendamentos mostrará horários corretos
- ✅ Sistema funciona independente do fuso horário do servidor

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se o backup foi criado
2. Confirme que a conversão foi executada
3. Reinicie a aplicação
4. Teste criando um novo agendamento
