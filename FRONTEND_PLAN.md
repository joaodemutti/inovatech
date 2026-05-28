# Plan: INOVATECH Frontend — Complete Implementation

## Context

The INOVATECH project has a complete FastAPI backend for the "Clínica Vida Plena" medical management system. There is **no frontend yet**. This plan implements the full React/Next.js 15 frontend as specified in `INOVATECH_FRONTEND_PROMPT.md` — a premium SaaS-style UI with glassmorphism, animations, and full API integration.

**Backend runs on:** `http://localhost:8000`  
**Frontend will run on:** `http://localhost:3000` (Next.js default)  
> ⚠️ Backend `.env` has `FRONTEND_URL=http://localhost:5173`. Must update to `http://localhost:3000`.

---

## Phase 0 — Backend CORS Fix

Update `backend/.env` (or `docker-compose.yml` env) to set:
```
FRONTEND_URL=http://localhost:3000
```

---

## Phase 1 — Project Scaffolding

### 1.1 Create Next.js 15 App
```bash
npx create-next-app@latest frontend --typescript --tailwind --app --src-dir --import-alias "@/*"
```

### 1.2 Install All Dependencies
```bash
cd frontend
npm install \
  axios @tanstack/react-query zustand \
  react-hook-form @hookform/resolvers zod \
  framer-motion \
  recharts \
  @tanstack/react-table \
  @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction \
  lucide-react \
  sonner \
  date-fns \
  clsx tailwind-merge class-variance-authority \
  @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select \
  @radix-ui/react-tooltip @radix-ui/react-tabs @radix-ui/react-badge \
  @radix-ui/react-avatar @radix-ui/react-separator @radix-ui/react-scroll-area \
  @radix-ui/react-switch @radix-ui/react-label @radix-ui/react-checkbox

npx shadcn@latest init
```

---

## Phase 2 — Core Infrastructure

### 2.1 TypeScript Types (`src/types/`)

- `auth.ts` — `User`, `LoginRequest`, `LoginResponse`
- `paciente.ts` — `Paciente`, `PacienteCreate`, `PacienteUpdate`
- `medico.ts` — `Medico`, `MedicoCreate`, `MedicoUpdate`
- `consulta.ts` — `Consulta`, `ConsultaCreate`, `ConsultaUpdate`, `ConsultaStatus`
- `prontuario.ts` — `Prontuario`, `ProntuarioCreate`, `ProntuarioUpdate`
- `financeiro.ts` — `Lancamento`, `LancamentoCreate`, `IndicadoresFinanceiros`
- `ponto.ts` — `RegistroPonto`, `PontoCreate`, `TotaisPonto`
- `dashboard.ts` — `DashboardIndicadores`
- `usuario.ts` — `Usuario`, `UsuarioCreate`

### 2.2 API Client (`src/lib/api.ts`)

Axios instance with:
- `baseURL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'`
- `withCredentials: true` (cookie-based JWT)
- Response interceptor: redirect to `/login` on 401

### 2.3 API Services (`src/services/`)

One file per domain — thin wrappers around the Axios instance:
- `auth.service.ts` — login, logout, me
- `pacientes.service.ts`
- `medicos.service.ts`
- `consultas.service.ts`
- `prontuarios.service.ts`
- `financeiro.service.ts`
- `ponto.service.ts`
- `dashboard.service.ts`
- `usuarios.service.ts`
- `excel.service.ts`
- `admin.service.ts`
- `portal.service.ts`

### 2.4 Zustand Stores (`src/stores/`)

- `auth.store.ts` — `user`, `setUser`, `clearUser`

### 2.5 React Query Provider (`src/lib/providers.tsx`)

`QueryClientProvider` + `Toaster` (sonner) wrapped for the app.

### 2.6 Custom Hooks (`src/hooks/`)

- `useAuth.ts` — calls `/auth/me`, populates store
- `usePacientes.ts`, `useMedicos.ts`, `useConsultas.ts`, etc. — TanStack Query wrappers

---

## Phase 3 — Layout Components (`src/components/layout/`)

### Sidebar (`Sidebar.tsx`)
- Collapsible with icon-only mode
- Purple→blue gradient background
- Nav items: Dashboard, Pacientes, Médicos, Consultas, Prontuários, Financeiro, Ponto, Administração, Portal do Paciente
- Active state indicator with glow
- Logo area with INOVATECH brand
- Framer Motion slide/collapse animation
- Role-based nav item visibility

### Topbar (`Topbar.tsx`)
- Global search input (mock for now)
- User avatar + dropdown (profile, logout)
- Notifications bell with badge
- Breadcrumb
- Dark/light toggle (optional)

### Protected Layout (`AppLayout.tsx`)
- Wraps all authenticated pages
- Checks auth on mount via `useAuth`, redirects to `/login` if no session
- Renders Sidebar + Topbar + `{children}`

---

## Phase 4 — Pages

### 4.1 `/` → `/login`

File: `src/app/(auth)/login/page.tsx`

- Full-screen animated background (CSS/Framer Motion particles or gradient mesh)
- Glassmorphism card centered
- Logo + "Clínica Vida Plena"
- `login` + `password` fields with React Hook Form + Zod
- Submit → `POST /auth/login` → redirect to `/dashboard`
- Animated error shake on invalid credentials

### 4.2 `/dashboard`

File: `src/app/(app)/dashboard/page.tsx`

- 4 KPI cards (Pacientes, Consultas Hoje, Receita do Mês, Valores Pendentes) — data from `GET /dashboard/indicadores`
- Bar chart of financial overview (Recharts) — mock monthly or live
- Today's appointments table — `GET /consultas/hoje`
- Recent patients list
- Skeleton loading on all sections

### 4.3 `/pacientes`

File: `src/app/(app)/pacientes/page.tsx`

- TanStack Table with search, status filter, pagination
- Columns: Nome, CPF, Convênio, Status, Actions
- "Novo Paciente" button → modal with full form (React Hook Form + Zod)
- Row actions: View detail drawer, Edit (modal), Deactivate
- Export Excel button → `GET /excel/export/pacientes`

### 4.4 `/medicos`

File: `src/app/(app)/medicos/page.tsx`

- Similar table structure to Pacientes
- Columns: Nome, CRM, Especialidade, Status, Actions
- Create/edit modal
- Export Excel

### 4.5 `/consultas`

File: `src/app/(app)/consultas/page.tsx`

- FullCalendar (month/week/day views) showing appointments
- Status color coding: `agendada`=blue, `confirmada`=green, `realizada`=purple, `cancelada`=red
- Click on slot → create appointment modal
- Click on event → detail/edit modal
- Status change dropdown
- Upcoming list sidebar

### 4.6 `/prontuarios`

File: `src/app/(app)/prontuarios/page.tsx`

- Search by patient name
- Record list with patient, doctor, date, CID
- Create prontuário modal (for `medico` role)
- Detail view: diagnóstico, prescrição, retorno, laudo status
- "Liberar Laudo" button (medico only)
- Patient history timeline

### 4.7 `/financeiro`

File: `src/app/(app)/financeiro/page.tsx`

- 4 indicator cards: Receita Paga, A Receber, Atrasado, Total Lançado — from `GET /financeiro/indicadores`
- Recharts area/bar chart for trend visualization
- TanStack Table of transactions with status badges
- Status filter (pago/pendente/atrasado)
- Update transaction status inline
- Export Excel

### 4.8 `/ponto`

File: `src/app/(app)/ponto/page.tsx`

- Summary cards: Horas Trabalhadas, Faltas, Atrasos, Horas Extras — from `GET /ponto/totais`
- Date range filter
- Table of `RegistroPonto` records
- Clock in/out form
- Edit records (gestor)

### 4.9 `/admin`

File: `src/app/(app)/admin/page.tsx`

- Tabs: Usuários | Log de Auditoria
- **Usuários tab**: table with `GET /usuarios`, create/edit user modal
- **Auditoria tab**: filterable log table (modulo, resultado, usuario)
- Gestor role only (redirect otherwise)

### 4.10 `/portal`

File: `src/app/(app)/portal/page.tsx`

- Patient role only
- Cards: upcoming appointments from `GET /portal/consultas`
- Released reports list from `GET /portal/laudos`
- Download laudo button → `GET /portal/laudos/{id}/download`
- Patient profile summary

---

## Phase 5 — Shared Components (`src/components/`)

### UI Primitives (`components/ui/`)
Shadcn components + custom:
- `GlassCard.tsx` — glassmorphism card
- `StatCard.tsx` — KPI card with icon, value, trend, animation
- `GradientButton.tsx` — purple→blue gradient button with hover
- `DataTable.tsx` — TanStack Table wrapper with pagination
- `PageHeader.tsx` — page title + breadcrumb + action buttons
- `EmptyState.tsx` — illustrated empty state
- `StatusBadge.tsx` — color-coded status chip
- `SkeletonCard.tsx` / `SkeletonTable.tsx` — loading skeletons

### Form Components (`components/shared/`)
- `PacienteForm.tsx`
- `MedicoForm.tsx`
- `ConsultaForm.tsx`
- `ProntuarioForm.tsx`
- `FinanceiroForm.tsx`
- `UsuarioForm.tsx`

---

## Phase 6 — Design Tokens & Theme

### `tailwind.config.ts`
Extend colors:
```ts
colors: {
  brand: {
    purple: '#7C3AED',  // primary
    'purple-light': '#A855F7',
    blue: '#1E3A8A',    // dark
    'blue-mid': '#3B82F6',
  }
}
```

### `src/styles/globals.css`
- CSS variables for glassmorphism: `--glass-bg`, `--glass-border`
- Custom scrollbar styling
- Base gradient utilities

---

## Phase 7 — Environment & Config

### `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### `frontend/next.config.ts`
```ts
const nextConfig = {
  async rewrites() {
    return []; // direct Axios calls, no proxy needed
  }
};
```

---

## File Creation Order

1. `src/types/*.ts` (all types)
2. `src/lib/api.ts` + `src/lib/providers.tsx`
3. `src/services/*.ts` (all services)
4. `src/stores/auth.store.ts`
5. `src/hooks/*.ts`
6. Layout components (Sidebar, Topbar, AppLayout)
7. Login page
8. Dashboard page + StatCard
9. Remaining pages in order: Pacientes, Médicos, Consultas, Prontuários, Financeiro, Ponto, Admin, Portal
10. Shared components as needed per page

---

## Verification

1. `cd frontend && npm run dev` — confirm server starts on port 3000
2. Navigate to `/login` — verify animated background and form renders
3. Log in with seed credentials — confirm redirect to `/dashboard`
4. Verify dashboard KPI cards populate from `GET /dashboard/indicadores`
5. Navigate to `/pacientes` — verify table loads and create modal works
6. Navigate to `/consultas` — verify FullCalendar renders appointments
7. Check role-based nav visibility (gestor vs. paciente)
8. Verify Excel export downloads file
9. Check responsiveness at mobile viewport
