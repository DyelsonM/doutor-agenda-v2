# Guia de Execução em Produção - Correção de Caixa

Este guia mostra como executar os scripts de correção de caixa em diferentes plataformas de hospedagem.

## 🚀 Métodos de Execução

### **Método 1: Script Automatizado (Recomendado)**

```bash
# Execute localmente, mas conecta na produção
node scripts/production-cash-fixer.js full
```

Este script detecta automaticamente o ambiente e executa os comandos apropriados.

### **Método 2: Manual por Plataforma**

---

## 🌐 **Vercel**

### Via Vercel CLI:

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Fazer login
vercel login

# Conectar ao projeto
vercel link

# Executar scripts
vercel env pull .env.production
node scripts/backup-production-cash.js
node scripts/fix-production-cash-dates.js

# Fazer redeploy
vercel --prod
```

### Via Dashboard:

1. Acesse [vercel.com](https://vercel.com)
2. Vá para seu projeto
3. Clique em "Functions" → "View Function Logs"
4. Use o terminal integrado (se disponível)

---

## 🚂 **Railway**

### Via Railway CLI:

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Fazer login
railway login

# Conectar ao projeto
railway link

# Executar scripts
railway run node scripts/backup-production-cash.js
railway run node scripts/fix-production-cash-dates.js

# Fazer redeploy
railway redeploy
```

### Via Dashboard:

1. Acesse [railway.app](https://railway.app)
2. Vá para seu projeto
3. Clique em "Deployments" → "View Logs"
4. Use o terminal integrado

---

## 🎨 **Render**

### Via Render CLI:

```bash
# Instalar Render CLI
npm install -g @render/cli

# Fazer login
render login

# Executar scripts
render run node scripts/backup-production-cash.js
render run node scripts/fix-production-cash-dates.js

# Fazer redeploy
render redeploy
```

### Via Dashboard:

1. Acesse [render.com](https://render.com)
2. Vá para seu serviço
3. Clique em "Logs"
4. Use o terminal integrado (se disponível)

---

## 🟣 **Heroku**

### Via Heroku CLI:

```bash
# Instalar Heroku CLI
npm install -g heroku

# Fazer login
heroku login

# Conectar ao projeto
heroku git:remote -a seu-app-name

# Executar scripts
heroku run node scripts/backup-production-cash.js
heroku run node scripts/fix-production-cash-dates.js

# Reiniciar aplicação
heroku restart
```

### Via Dashboard:

1. Acesse [dashboard.heroku.com](https://dashboard.heroku.com)
2. Vá para seu app
3. Clique em "More" → "Run console"
4. Execute os comandos

---

## 🐳 **Docker**

### Container em execução:

```bash
# Encontrar container
docker ps

# Executar scripts
docker exec -it nome-do-container node scripts/backup-production-cash.js
docker exec -it nome-do-container node scripts/fix-production-cash-dates.js

# Reiniciar container
docker restart nome-do-container
```

### Container temporário:

```bash
# Executar scripts
docker run --rm -v $(pwd):/app -w /app -e DATABASE_URL=$DATABASE_URL node:18 node scripts/backup-production-cash.js
docker run --rm -v $(pwd):/app -w /app -e DATABASE_URL=$DATABASE_URL node:18 node scripts/fix-production-cash-dates.js
```

---

## 🖥️ **VPS/Servidor Próprio**

### Via SSH:

```bash
# Conectar ao servidor
ssh usuario@seu-servidor.com

# Navegar para aplicação
cd /caminho/para/sua/app

# Executar scripts
node scripts/backup-production-cash.js
node scripts/fix-production-cash-dates.js

# Reiniciar aplicação
# Para PM2:
pm2 restart sua-app

# Para systemd:
sudo systemctl restart sua-app

# Para Docker:
docker restart container-name
```

---

## ☁️ **Outras Plataformas**

### **Netlify Functions:**

```bash
# Via Netlify CLI
netlify functions:invoke backup-production-cash
netlify functions:invoke fix-production-cash-dates
```

### **AWS Lambda:**

```bash
# Via AWS CLI
aws lambda invoke --function-name sua-funcao response.json
```

### **Google Cloud Functions:**

```bash
# Via gcloud CLI
gcloud functions call sua-funcao
```

---

## ⚠️ **Checklist Antes de Executar**

- [ ] **Backup**: Sempre execute o backup primeiro
- [ ] **Horário**: Execute fora do horário de pico
- [ ] **Variáveis**: Verifique se `DATABASE_URL` está configurada
- [ ] **Permissões**: Confirme acesso ao banco de dados
- [ ] **Monitoramento**: Tenha acesso aos logs da aplicação

---

## 🔄 **Processo Completo**

```bash
# 1. Backup (OBRIGATÓRIO)
node scripts/backup-production-cash.js

# 2. Correção
node scripts/fix-production-cash-dates.js

# 3. Reiniciar aplicação (depende da plataforma)
# Vercel: vercel --prod
# Railway: railway redeploy
# Render: render redeploy
# Heroku: heroku restart
# Docker: docker restart container-name

# 4. Testar
# - Abrir um novo caixa
# - Verificar se a data está correta
# - Confirmar que não há mais problemas
```

---

## 🆘 **Solução de Problemas**

### **Erro: DATABASE_URL não encontrada**

```bash
# Verificar variáveis de ambiente
echo $DATABASE_URL

# Configurar variável (exemplo)
export DATABASE_URL="postgresql://user:pass@host:port/db"
```

### **Erro: Permissão negada**

```bash
# Verificar permissões do banco
# Confirmar se o usuário tem acesso de escrita
```

### **Erro: Script não encontrado**

```bash
# Verificar se está no diretório correto
pwd
ls scripts/

# Navegar para o diretório da aplicação
cd /caminho/para/sua/app
```

### **Aplicação não reinicia**

```bash
# Verificar status da aplicação
# Reiniciar manualmente via dashboard da plataforma
# Verificar logs para erros
```

---

## 📞 **Suporte por Plataforma**

- **Vercel**: [vercel.com/support](https://vercel.com/support)
- **Railway**: [railway.app/support](https://railway.app/support)
- **Render**: [render.com/support](https://render.com/support)
- **Heroku**: [help.heroku.com](https://help.heroku.com)
- **Docker**: [docs.docker.com](https://docs.docker.com)
