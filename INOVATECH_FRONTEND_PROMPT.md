# INOVATECH — Front-End Completo

## Contexto do Projeto

Você irá desenvolver o **front-end completo** do sistema **INOVATECH**, uma plataforma moderna de gestão clínica para a **Clínica Vida Plena**.

O sistema deve seguir todas as informações presentes nos arquivos:
- `README.md`
- `INOVATECH_PROJECT.md`
- `INOVATECH_BACKEND_PROMPT.md`
- `BACKEND_PLAN.md`

O objetivo é criar uma interface extremamente moderna, dinâmica, intuitiva e visualmente impactante, conectada totalmente ao backend em FastAPI.

---

# Objetivo Principal

Criar um sistema web profissional de alto nível para gestão clínica médica, com:

- Dashboard administrativo
- Gestão de pacientes
- Gestão de médicos
- Controle de consultas
- Controle financeiro
- Controle de ponto
- Portal do paciente
- Gestão de prontuários
- Administração de usuários
- Relatórios e gráficos
- Sistema responsivo
- Experiência premium

O sistema deve transmitir:

- Tecnologia
- Inovação
- Organização
- Segurança
- Modernidade
- Elegância
- Acessibilidade

---

# Stack Obrigatória do Front-End

## Framework
- React.js
- Next.js 15+
- TypeScript

## Estilização
- TailwindCSS
- Framer Motion
- Shadcn/UI
- Lucide React

## Gerenciamento de Estado
- Zustand

## Requisições
- Axios
- React Query / TanStack Query

## Formulários
- React Hook Form
- Zod

## Gráficos
- Recharts

## Tabelas
- TanStack Table

## Calendário
- FullCalendar

---

# Identidade Visual

## Paleta Principal

### Branco
Utilizado como base principal para trazer limpeza e profissionalismo.

### Roxo
Representando inovação, tecnologia e sofisticação.

### Azul Escuro
Transmitindo confiança, segurança e estabilidade.

---

# Direção de Design

O sistema precisa ter aparência de produto SaaS premium.

## O design deve conter:

- Gradientes modernos
- Glassmorphism
- Cards sofisticados
- Microinterações
- Hover animations
- Loading animations
- Sombras suaves
- Ícones personalizados
- Componentes reutilizáveis
- Layout extremamente organizado
- Espaçamentos bem definidos
- Responsividade completa
- Sidebar moderna
- Dashboard elegante
- Componentes vivos e dinâmicos

---

# Conceito Visual

O visual deve misturar:

- Modernidade médica
- Tecnologia premium
- Inteligência visual
- Interfaces futuristas
- Elementos flutuantes
- Transparências suaves
- Luzes e brilhos discretos
- Efeitos neon leves em roxo e azul

---

# Estrutura de Pastas Obrigatória

```bash
frontend/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── pacientes/
│   │   ├── consultas/
│   │   ├── financeiro/
│   │   ├── prontuarios/
│   │   ├── ponto/
│   │   └── shared/
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   ├── lib/
│   ├── types/
│   ├── styles/
│   └── utils/
├── .env.local
├── package.json
├── tsconfig.json
└── next.config.js
```

---

# Layout Global

## Sidebar
A sidebar deve possuir:

- Logo moderna do INOVATECH
- Ícones animados
- Hover elegante
- Indicadores ativos
- Transições suaves
- Modo colapsável
- Gradientes em roxo e azul

## Navbar Superior
Deve conter:

- Busca global
- Perfil do usuário
- Notificações
- Alternância de tema
- Breadcrumb
- Indicadores rápidos

---

# Páginas Obrigatórias

## 1. Login

Tela extremamente moderna contendo:

- Glassmorphism
- Gradientes vivos
- Background animado
- Inputs sofisticados
- Validação em tempo real
- Login JWT
- Persistência segura

---

## 2. Dashboard

O dashboard deve possuir:

- Cards estatísticos animados
- Gráficos financeiros
- Agenda do dia
- Consultas futuras
- Pacientes recentes
- Indicadores financeiros
- Sistema de cores inteligentes
- Widgets interativos
- Loading skeleton

---

## 3. Gestão de Pacientes

Funcionalidades:

- Cadastro completo
- Busca dinâmica
- Filtros inteligentes
- Tabela avançada
- Modal moderno
- Upload de documentos
- Histórico médico
- Paginação
- Exportação Excel

---

## 4. Gestão de Médicos

Funcionalidades:

- Cadastro
- Especialidades
- Agenda médica
- Disponibilidade
- Foto de perfil
- Controle de horários

---

## 5. Consultas

O sistema de consultas deve conter:

- Calendário visual moderno
- Drag and drop
- Status por cores
- Alertas visuais
- Confirmações
- Modal detalhado
- Reagendamento
- Histórico
- Timeline

---

## 6. Prontuários

Interface sofisticada contendo:

- Editor organizado
- Histórico médico
- Diagnósticos
- Prescrições
- Anexos
- Exames
- Timeline clínica
- Busca rápida

---

## 7. Financeiro

Deve conter:

- Dashboard financeiro
- Gráficos animados
- Receitas
- Despesas
- Convênios
- Inadimplência
- Fluxo de caixa
- Exportação
- Indicadores em tempo real

---

## 8. Controle de Ponto

Funcionalidades:

- Registro de entrada e saída
- Histórico
- Relatórios
- Status em tempo real
- Jornada diária
- Banco de horas

---

## 9. Portal do Paciente

Área exclusiva do paciente contendo:

- Resultados de exames
- Consultas agendadas
- Histórico médico
- Perfil
- Atualização cadastral

---

# Experiência do Usuário (UX)

O sistema deve transmitir sensação de fluidez.

## Implementar:

- Skeleton loading
- Feedback visual
- Toasts elegantes
- Transições suaves
- Estados vazios personalizados
- Empty states modernos
- Tooltips inteligentes
- Animações fluidas
- Responsividade completa
- Performance otimizada

---

# Responsividade

O sistema precisa funcionar perfeitamente em:

- Desktop
- Notebook
- Tablet
- Mobile

A experiência mobile deve ser extremamente refinada.

---

# Regras Visuais

## NÃO criar:

- Interfaces simples demais
- Visual genérico
- Componentes sem animação
- Layouts ultrapassados
- Tabelas básicas
- Inputs comuns

## O sistema deve parecer:

- Startup de tecnologia premium
- Plataforma SaaS moderna
- Produto de alto investimento
- Sistema empresarial sofisticado

---

# Componentes Obrigatórios

## Cards
- Glassmorphism
- Hover effects
- Bordas suaves
- Blur background

## Botões
- Gradientes
- Hover animado
- Sombras modernas
- Ripple effect

## Inputs
- Estados de foco premium
- Ícones internos
- Validações visuais
- Bordas iluminadas

## Modais
- Background blur
- Entrada animada
- Fechamento suave
- Organização impecável

---

# Integração com Backend

Consumir todas as rotas FastAPI:

- Auth
- Usuários
- Pacientes
- Médicos
- Consultas
- Financeiro
- Ponto
- Prontuários
- Dashboard
- Excel
- Administração

---

# Segurança

Implementar:

- JWT Authentication
- Refresh Token
- Rotas protegidas
- Controle de acesso
- Persistência segura
- Logout automático
- Interceptors Axios

---

# Qualidade Técnica

O projeto deve seguir:

- Clean Code
- Componentização
- Escalabilidade
- Organização profissional
- Separação de responsabilidades
- Arquitetura moderna
- Código reutilizável
- Performance otimizada

---

# Diferenciais Visuais

Adicionar:

- Backgrounds tecnológicos
- Efeitos de brilho
- Shapes abstratos
- Elementos médicos modernos
- Partículas leves
- Gradientes vivos
- Indicadores animados
- Status coloridos
- Navegação premium

---

# Objetivo Final

O resultado final deve parecer um sistema:

- Premium
- Tecnológico
- Sofisticado
- Futurista
- Profissional
- Extremamente bonito
- Moderno
- Diferenciado
- Memorável

A interface deve impressionar visualmente e transmitir imediatamente sensação de qualidade, inovação e alto nível técnico.

