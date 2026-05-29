# INOVATECH — Frontend

Interface web da plataforma de gestão clínica **Clínica Vida Plena**, desenvolvida com Next.js 15, shadcn/ui e TailwindCSS.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Estilização | TailwindCSS v4 + shadcn/ui |
| Animações | Framer Motion |
| Ícones | Lucide React |
| Estado | Zustand |
| Requisições | Axios + TanStack Query |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts |
| Calendário | FullCalendar |
| Testes E2E | Playwright |

---

## Pré-requisitos

- Node.js 20+
- npm 10+
- Backend INOVATECH rodando em `http://localhost:8000`

---

## Instalação

```bash
cd frontend
npm install
```

---

## Configuração

Crie o arquivo `.env.local` na raiz do `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Executar

```bash
# Desenvolvimento
npm run dev
# → http://localhost:3000

# Build de produção
npm run build
npm start
```

---

## Credenciais padrão (seed)

| Perfil | Login | Senha |
|---|---|---|
| Gestor | `admin` | `Inovatech@2026` |
| Médico | `dr.silva` | `Inovatech@2026` |
| Recepcionista | `recepcao` | `Inovatech@2026` |
| Paciente | `joao.paciente` | `Inovatech@2026` |

---

## Estrutura de pastas

```
src/
├── app/                  # Rotas (Next.js App Router)
│   ├── login/
│   ├── dashboard/
│   ├── pacientes/
│   ├── medicos/
│   ├── consultas/
│   ├── prontuarios/
│   ├── financeiro/
│   ├── ponto/
│   ├── admin/
│   └── portal/
├── components/
│   ├── layout/           # Sidebar, Topbar, AppLayout
│   ├── ui/               # Componentes shadcn/ui + custom
│   └── shared/           # FormField e helpers
├── hooks/                # useAuth, useRole
├── services/             # Chamadas à API (um arquivo por módulo)
├── stores/               # Zustand (auth.store)
├── types/                # Tipos TypeScript por domínio
└── lib/                  # api.ts (Axios), utils.ts, providers.tsx
```

---

## Controle de acesso por perfil

| Página | Gestor | Recepcionista | Médico | Paciente |
|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | — |
| Pacientes | CRUD + Export | CRUD | Leitura | — |
| Médicos | CRUD + Export | Leitura | Leitura | — |
| Consultas | CRUD + Export | CRUD | CRUD | — |
| Prontuários | Leitura + Export | — | CRUD + Laudo | — |
| Financeiro | ✅ Completo | 🚫 | 🚫 | — |
| Ponto | ✅ + Export | Registrar | Registrar | — |
| Administração | ✅ Completo | 🚫 | 🚫 | — |
| Portal | — | — | — | ✅ |

---

## Testes E2E (Playwright)

### Instalação

```bash
npm install -D @playwright/test
npx playwright install chromium
```

### Configurar credenciais de teste

Edite `tests/.env.test` com os logins do seu seed:

```env
GESTOR_LOGIN=admin
GESTOR_PASSWORD=Inovatech@2026
```

### Executar

```bash
# Todos os testes (gera relatório HTML)
npm test

# Interface visual — recomendado para debug
npm run test:ui

# Modo headed (ver o browser)
npm run test:headed

# Abrir relatório gerado
npm run test:report
```

### Relatório

Após rodar `npm test`, o relatório é gerado em `playwright-report/index.html` com:

- Status por teste (✅ passou / ❌ falhou)
- Screenshot em caso de falha
- Vídeo do fluxo (em retry)
- Tempo de execução por spec

### Cobertura dos testes

| Spec | O que cobre |
|---|---|
| `auth.spec.ts` | Login, logout, redirect, validação, rota protegida |
| `dashboard.spec.ts` | KPIs, gráficos, sidebar, navegação |
| `pacientes.spec.ts` | Listar, criar, editar, buscar, filtrar, exportar |
| `medicos.spec.ts` | Listar, criar, buscar, exportar |
| `consultas.spec.ts` | Calendário, criar, navegar, exportar |
| `prontuarios.spec.ts` | Listar, editar, buscar, exportar |
| `financeiro.spec.ts` | Indicadores, lançamento, filtro, exportar |
| `ponto.spec.ts` | Cards, filtro data, registrar, exportar |
| `admin.spec.ts` | Tabs, usuários, auditoria, criar usuário |
| `roles.spec.ts` | Restrições por perfil |

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | URL base do backend |
| `PLAYWRIGHT_BASE_URL` | `http://localhost:3000` | URL base para testes E2E |
