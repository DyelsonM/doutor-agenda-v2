### Doutor Agenda

Aplicação moderna de agendamento para clínicas, construída com Next.js 15 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui, React 19, BetterAuth, Drizzle ORM e PostgreSQL. Inclui autenticação (e-mail/senha e Google), gestão de clínicas, médicos, pacientes e agendamentos, assinatura via Stripe e UI consistente com componentes reutilizáveis.

### Sumário

- **Visão geral**
- **Stack e ferramentas**
- **Estrutura de diretórios**
- **Arquitetura e fluxos principais**
- **Variáveis de ambiente**
- **Como rodar localmente**
- **Scripts úteis**
- **Padrões e convenções**

### Visão geral

- **Domínio**: clínicas possuem médicos e pacientes; pacientes fazem agendamentos com médicos. Disponibilidades de médicos são definidas por faixa de dias da semana e janelas de horário.
- **Autenticação**: BetterAuth com e-mail/senha e Google OAuth. A sessão é enriquecida com informações do plano e clínica do usuário.
- **Assinatura**: integração com Stripe Checkout para contratar o plano.
- **UI/UX**: Tailwind + shadcn/ui; formulários com React Hook Form e validação com Zod; feedback com Sonner.

### Stack e ferramentas

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Linguagem**: TypeScript (strict)
- **UI**: [Tailwind CSS 4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [lucide-react](https://lucide.dev/)
- **Formulários**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) + `@hookform/resolvers`
- **Estado remoto**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **URL state**: [nuqs](https://github.com/47ng/nuqs)
- **Toasts**: [sonner](https://sonner.emilkowal.ski/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Datas**: [dayjs](https://day.js.org/) (plugins `utc` e `timezone`)
- **Auth**: [BetterAuth](https://www.better-auth.com/) (com Drizzle adapter)
- **Banco**: PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/)
- **Pagamentos**: [Stripe](https://stripe.com/)
- **Ações seguras**: [next-safe-action](https://next-safe-action.dev/)
- **Qualidade**: ESLint (simple-import-sort), Prettier (plugin Tailwind)

### Estrutura de diretórios

```
src/
  app/                         # App Router (rotas e layouts)
    authentication/            # Tela de login e cadastro
    (protected)/               # Área logada (dashboard, doctors, patients, appointments, etc.)
    new-subscription/          # Fluxo de assinatura
    api/                       # Rotas API (se necessário)
    layout.tsx                 # Layout raiz (fontes, providers)
    globals.css                # Tailwind 4 + tokens de tema
  actions/                     # Server Actions (next-safe-action)
    upsert-doctor/             # Ex.: criar/editar médico
    add-appointment/           # Ex.: criar agendamento
    get-available-times/       # Ex.: horários disponíveis
    delete-appointment/        # Ex.: deletar agendamento
    create-clinic/             # Ex.: onboarding de clínica
    create-stripe-checkout/    # Ex.: checkout Stripe
  components/
    ui/                        # Componentes de UI (shadcn/ui adaptados)
      page-container.tsx       # Container padrão de páginas
      form.tsx                 # Wrapper RHF + shadcn
      ...
  db/
    schema.ts                  # Esquema Drizzle (tabelas e relações)
    index.ts                   # Cliente Drizzle (conexão Postgres)
  helpers/
    time.ts                    # Geração de time slots (intervalos de 30min)
  lib/
    auth.ts                    # Config BetterAuth (drizzleAdapter, plugins)
    auth-client.ts             # Cliente BetterAuth no front
    next-safe-action.ts        # Cliente padrão de ações seguras
    utils.ts                   # Funções utilitárias (cn)
  providers/
    react-query.tsx            # Provider do React Query
```

### Arquitetura e fluxos principais

- **App Router**: páginas em `src/app`, com `layout.tsx` global registrando fonte, React Query Provider, `NuqsAdapter` e `Toaster`.
- **Server Actions**: centralizadas em `src/actions`, sempre usando `next-safe-action` com schema Zod, autenticação via `auth.api.getSession`, e `revalidatePath` após mutações.
- **Banco de dados**:
  - Esquema em `src/db/schema.ts` com tabelas: `users`, `sessions`, `accounts`, `verifications`, `clinics`, `users_to_clinics`, `doctors`, `patients`, `appointments`.
  - Conexão em `src/db/index.ts` usando `drizzle(process.env.DATABASE_URL)`.
- **Autenticação**:
  - BetterAuth com adapter Drizzle e provider social Google.
  - Sessão personalizada via `customSession` para incluir `plan` e clínica atual do usuário.
  - Cliente no front em `src/lib/auth-client.ts` (métodos `signIn`, `signUp`, `signIn.social`).
- **Disponibilidade e agenda**:
  - Médicos possuem disponibilidade por faixa de dias da semana e janelas de horário (`availableFromWeekDay`/`availableToWeekDay` e `availableFromTime`/`availableToTime`).
  - Geração de horários em `helpers/time.ts` (de 05:00 a 23:30 a cada 30min).
  - Cálculos de horários consideram UTC/local com dayjs.
- **UI e formulários**:
  - Componentes shadcn/ui personalizados em `src/components/ui` (e.g., `button`, `dialog`, `select`, `table`, `sidebar`, `form`).
  - Formulários usando RHF + Zod + `Form` do shadcn. Máscaras com `react-number-format`.

### Variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```
# Banco de dados
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB

# Auth (Google OAuth)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_live_or_test...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Observações:

- O preço do produto no Stripe está referenciado diretamente na criação do checkout (chave `price`); ajuste conforme seu preço em `src/actions/create-stripe-checkout/index.ts`.
- Em produção, atualize `NEXT_PUBLIC_APP_URL` e todas as chaves nos providers.

### Como rodar localmente

1. Instale dependências

```bash
npm install
```

2. Configure `.env` (veja seção acima)

3. Suba o esquema do banco (Drizzle)

```bash
npx drizzle-kit push
```

4. Rode o servidor de desenvolvimento

```bash
npm run dev
```

Acesse `http://localhost:3000`.

### Scripts úteis

- `npm run dev`: inicia o servidor de desenvolvimento
- `npm run build`: build de produção
- `npm run start`: inicia o servidor em produção
- `npm run lint`: verifica o lint (ESLint + simple-import-sort)

### Padrões e convenções

- **TypeScript**: `strict: true`. Alias de importação `@/*` aponta para `src/*` (veja `tsconfig.json`).
- **Estilo de código**: Prettier com `prettier-plugin-tailwindcss`. ESLint com `simple-import-sort` para ordenação automática de imports/exports.
- **Nomenclatura**: kebab-case para pastas/arquivos; nomes de variáveis claros e descritivos.
- **UI**: sempre usar Tailwind e componentes shadcn/ui; páginas devem usar `PageContainer` quando aplicável.
- **Formulários**: RHF + Zod. Use o wrapper `src/components/ui/form.tsx` para consistência.
- **Server Actions**: manter em `src/actions`, usar `next-safe-action` + schemas Zod e `useAction` no client.
- **Datas/horários**: `dayjs` para parsing/format e conversões UTC/local. Horários de médicos são strings `HH:mm:ss`; datas de agendamentos são `timestamp`.

### Integrações

- **BetterAuth**: ver `src/lib/auth.ts` e `src/lib/auth-client.ts`. Ao adicionar novos campos ao usuário, declará-los em `additionalFields`.
- **Stripe**: ver `src/actions/create-stripe-checkout`. Ajuste `price` conforme o preço criado no painel da Stripe.
- **Drizzle**: ver `drizzle.config.ts` e `src/db/schema.ts`. Use `npx drizzle-kit push` para aplicar o esquema.

### Contribuição

- Padronize imports (salve com format). Evite duplicidade de código; prefira componentes/funções reutilizáveis.
- Ao criar novas páginas internas, crie componentes específicos em `_components` dentro da rota.
- Revalide páginas após mutações com `revalidatePath` quando necessário.

### Requisitos

- Node.js 18.18+ (recomendado 20+)
- PostgreSQL 14+

—
Para dúvidas ou melhorias, abra uma issue ou PR seguindo as convenções acima.
