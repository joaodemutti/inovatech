# INOVATECH — Sistema de Gestão de Clínica Médica
> Projeto Acadêmico · SENAI "Mariano Ferraz" · Análise e Desenvolvimento de Software · 2026
> Disciplina: Engenharia de Software · Prof. Dr. Émerson Cruz
> Equipe: João Demutti · Luiz Fratti · Mariana Paiva · Natália Bastazini · Samuel Siqueira

---

## Sumário

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Contexto e Problema](#2-contexto-e-problema)
3. [Solução Proposta](#3-solução-proposta)
4. [Atores e Perfis de Acesso](#4-atores-e-perfis-de-acesso)
5. [Módulos do Sistema](#5-módulos-do-sistema)
6. [Modelo de Dados](#6-modelo-de-dados)
7. [Requisitos](#7-requisitos)
8. [Stack Tecnológica](#8-stack-tecnológica)
9. [Arquitetura do Sistema](#9-arquitetura-do-sistema)
10. [Estrutura de Pastas](#10-estrutura-de-pastas)
11. [Autenticação e Segurança](#11-autenticação-e-segurança)
12. [Rotas da API](#12-rotas-da-api)
13. [Páginas do Frontend](#13-páginas-do-frontend)
14. [Regras de Negócio Críticas](#14-regras-de-negócio-críticas)
15. [Fonte da Verdade — Excel Protótipo](#15-fonte-da-verdade--excel-protótipo)
16. [Cronograma](#16-cronograma)
17. [Escopo](#17-escopo)

---

## 1. Visão Geral do Projeto

O **Inova Tech** é uma aplicação web de gestão clínica desenvolvida para a **Clínica Vida Plena**, uma clínica médica de pequeno porte que atende as especialidades de Clínica Geral, Pediatria, Ginecologia/Obstetrícia e Cardiologia.

O sistema nasce da necessidade de digitalizar e centralizar processos que hoje são conduzidos de forma manual ou fragmentada — agendas em papel, prontuários físicos, controles financeiros descentralizados — substituindo-os por uma plataforma web modular, segura e intuitiva.

O projeto é desenvolvido como **MVP acadêmico**, com foco em funcionalidade, clareza de arquitetura e aderência às necessidades reais levantadas diretamente com a gestora da clínica.

---

## 2. Contexto e Problema

A gestora da Clínica Vida Plena, Dona Marta, identificou os seguintes problemas operacionais durante a entrevista de levantamento de requisitos:

- Agenda gerenciada manualmente, sem sistema de cores ou alertas, causando faltas e retrabalho da recepção
- Prontuários físicos de difícil acesso, sem rastreabilidade de diagnósticos e prescrições
- Controle financeiro descentralizado, sem visibilidade em tempo real de receita, inadimplência e convênios
- Pacientes precisam ligar para a clínica para obter resultados de exames e laudos
- Ausência de controle de ponto eletrônico para funcionários
- Sem controle de acesso por perfil ou log de auditoria das ações no sistema
- Sistema depende 100% da conexão com internet, sem fallback offline

> Segundo o CFM (2023), mais de 60% das clínicas de pequeno porte no Brasil ainda utilizam métodos manuais ou semi-automatizados para gestão de consultas e prontuários.

---

## 3. Solução Proposta

Uma aplicação web composta por **seis módulos integrados**, acessados a partir de um painel central (Menu/Dashboard), que centraliza:

| Módulo | Finalidade |
|---|---|
| Agenda | Agendamento, confirmação e cancelamento de consultas com sistema de cores por status |
| Prontuário Eletrônico | Registro clínico com CID, diagnóstico, prescrição e histórico do paciente |
| Cadastro | Base de dados unificada de pacientes e médicos |
| Financeiro | Controle de receitas, convênios, inadimplência e relatórios mensais |
| Folha de Ponto | Registro de entrada/saída e cálculo automático de horas trabalhadas |
| Administrativo | Gestão de usuários, permissões por perfil e log de auditoria |

---

## 4. Atores e Perfis de Acesso

O sistema possui quatro perfis de usuário com permissões distintas:

### Gestor
- Acesso a **todos os módulos**
- Visualiza painel de indicadores (Dashboard)
- Gerencia usuários e permissões
- Acessa log de auditoria completo
- Exemplo: Roberto Admin

### Recepcionista
- Acesso a **Agenda** e **Cadastro**
- Cria, confirma e cancela consultas
- Cadastra novos pacientes
- Exemplo: Ana Lima

### Médico
- Acesso a **Agenda** e **Prontuário**
- Registra diagnósticos com CID, prescrições e data de retorno
- Libera laudos para visualização do paciente
- Exemplos: Dr. Carlos Lima (Clínica Geral), Dra. Renata Souza (Cardiologia), Dr. Marcos Teles (Ortopedia)

### Paciente
- Acesso restrito ao **Portal do Paciente**
- Consulta agendamentos próprios
- Faz download de laudos e exames **somente após liberação médica**

---

## 5. Módulos do Sistema

### 5.1 Menu Principal (Dashboard)

Tela inicial após login, exibe um painel de indicadores em tempo real:

| Indicador | Descrição |
|---|---|
| Total de Pacientes | Contagem total de pacientes ativos cadastrados |
| Consultas Hoje | Número de consultas agendadas para o dia atual |
| Receita do Mês (R$) | Total de receita com status "Pago" no mês corrente |
| Valores Pendentes (R$) | Total de lançamentos com status "Pendente" ou "Atrasado" |

Navegação direta para todos os seis módulos a partir desta tela.

---

### 5.2 Módulo de Agenda

Gerencia o ciclo completo de uma consulta médica.

**Campos de uma consulta:**

| Campo | Tipo | Observação |
|---|---|---|
| ID | Inteiro | Gerado automaticamente |
| Paciente | Texto / FK | Nome + CPF |
| CPF Paciente | Texto | Vinculado ao cadastro |
| Médico | Texto / FK | Vinculado ao cadastro |
| Data | Data | Formato DD/MM/AAAA |
| Horário | Hora | Formato HH:MM |
| Tipo de Consulta | Texto | Ex.: Clínica Geral, Cardiologia, Ortopedia |
| Convênio | Texto | Ex.: Unimed, Bradesco Saúde, SulAmérica, Particular |
| Valor (R$) | Decimal | Gerado conforme tipo/convênio |
| Status | Enum | Agendada · Confirmada · Realizada · Cancelada |

**Sistema de cores por status:**
- 🟡 Agendada
- 🟢 Confirmada
- 🔵 Realizada
- 🔴 Cancelada

**Envio automático de lembrete via WhatsApp** ao confirmar o agendamento.

**Totalizador mensal:** total de consultas realizadas vs. total agendadas.

---

### 5.3 Módulo de Prontuário Eletrônico

Registra o histórico clínico completo do paciente.

**Campos do prontuário:**

| Campo | Tipo | Observação |
|---|---|---|
| Nº | Inteiro | Gerado automaticamente |
| Data | Data | Data do atendimento |
| Paciente | Texto / FK | Nome + CPF |
| CPF | Texto | Identificador único |
| Médico Responsável | Texto / FK | Quem atendeu |
| CID | Texto | Código obrigatório — Ex.: I10, J06.9, M54.5, S82.0 |
| Diagnóstico / Queixa | Texto longo | Descrição clínica |
| Prescrição / Conduta | Texto longo | Medicamentos, orientações, encaminhamentos |
| Retorno em (dias) | Inteiro | 0 = sem retorno previsto |

**Exemplos reais do protótipo:**
- I10 — Hipertensão arterial sistêmica (Losartana 50mg 1x/dia, retorno em 30 dias)
- J06.9 — Resfriado comum (Dipirona 500mg se febre, repouso 3 dias)
- M54.5 — Dorsalgia / lombalgia crônica (Raio-X + Ibuprofeno 600mg)
- S82.0 — Fratura de tíbia pós-op (Curativo diário, fisioterapia 3x/semana)

**Regra crítica:** laudos e exames só ficam visíveis no portal do paciente após liberação explícita do médico responsável.

---

### 5.4 Módulo Financeiro

Controle de receitas, convênios e inadimplência.

**Indicadores do topo:**

| Indicador | Valor de Exemplo |
|---|---|
| Receita Paga | R$ 950,00 |
| A Receber | R$ 400,00 |
| Atrasado | R$ 250,00 |
| Total Lançado | R$ 3.200,00 |

**Campos de um lançamento:**

| Campo | Tipo | Observação |
|---|---|---|
| Nº | Inteiro | Gerado automaticamente |
| Data | Data | Data do lançamento |
| Paciente | Texto / FK | Nome do paciente |
| Serviço | Texto | Ex.: Consulta Clínica, Retorno Ortopedia |
| Médico | Texto / FK | Médico responsável pela consulta |
| Convênio | Texto | Ex.: Unimed, Particular, Bradesco |
| Valor (R$) | Decimal | Valor do serviço |
| Status | Enum | Pago · Pendente · Atrasado |
| Forma de Pagamento | Texto | Convênio, Cartão de Crédito, Dinheiro, Pix |
| Observação | Texto | Ex.: "3ª notificação enviada", "Aguardando autorização" |

Quando uma consulta muda para status **Realizada** na Agenda, um lançamento financeiro correspondente é **criado automaticamente**.

---

### 5.5 Módulo de Folha de Ponto

Controle de frequência dos funcionários.

**Campos do registro de ponto:**

| Campo | Tipo | Observação |
|---|---|---|
| Nº | Inteiro | Gerado automaticamente |
| Data | Data | Data do registro |
| Funcionário | Texto / FK | Nome do funcionário |
| Cargo | Texto | Ex.: Médico, Recepcionista |
| Entrada | Hora | Formato HH:MM |
| Saída | Hora | Formato HH:MM |
| H. Trabalhadas | Decimal | Calculado automaticamente |
| H. Esperadas | Decimal | Padrão: 8h |
| Diferença (h) | Decimal | H. Trabalhadas − H. Esperadas |
| Situação | Enum | Normal · Atraso · Falta · H.Extra |

**Regras de classificação automática:**
- `Diferença >= 0` e entrada pontual → **Normal**
- `Diferença < 0` e entrada atrasada → **Atraso**
- Sem entrada e saída registrados → **Falta**
- `Diferença > 1` → **H.Extra**

**Exemplos reais do protótipo:**
- Ana Lima: entrada 08:30, saída 18:15 → 9,75h → H.Extra
- Dra. Renata Souza: entrada 09:20, saída 17:00 → 7,67h → Atraso
- Dr. Marcos Teles: sem registro → Falta

---

### 5.6 Módulo Administrativo

Dividido em duas seções: Usuários e Log de Auditoria.

**Gestão de Usuários:**

| Campo | Tipo | Observação |
|---|---|---|
| ID | Inteiro | Gerado automaticamente |
| Nome | Texto | Nome completo |
| Perfil | Enum | Gestor · Recepcionista · Médico · Paciente |
| Login | Texto | Único no sistema |
| Último Acesso | DateTime | Atualizado a cada login |
| Status | Enum | Ativo · Inativo |
| Módulos Permitidos | Lista | Conforme perfil |
| Observação | Texto | Campo livre |

**Log de Auditoria:**

| Campo | Tipo | Observação |
|---|---|---|
| # | Inteiro | Sequencial |
| Data/Hora | DateTime | Timestamp da ação |
| Usuário | Texto | Login do usuário |
| Ação | Texto | Login · Criar · Editar · Excluir · Backup |
| Módulo | Texto | Qual módulo foi acessado |
| IP | Texto | IP de origem |
| Resultado | Enum | Sucesso · Falha |
| Detalhes | Texto | Descrição da ação |

**Toda ação no sistema gera um registro automático no log**, incluindo login, criação, edição, exclusão e backup automático diário.

---

## 6. Modelo de Dados

### Entidades e Relacionamentos

```
Pessoa (superclasse)
├── Paciente (herda de Pessoa)
│   ├── dataNascimento
│   ├── convenio
│   └── endereco
└── Medico (herda de Pessoa)
    ├── crm
    ├── especialidade
    └── dataFormatura

Consulta
├── FK → Paciente
├── FK → Medico
└── FK → LancamentoFinanceiro (gerado automaticamente ao marcar como Realizada)

Prontuario
├── FK → Paciente
└── FK → Medico

LancamentoFinanceiro
└── FK → Consulta

RegistroPonto
└── FK → Funcionario (Usuario com perfil Medico ou Recepcionista)

Usuario
└── perfil: Gestor | Recepcionista | Medico | Paciente

LogAuditoria
└── FK → Usuario
```

### Tabelas Principais

**pessoas** — campos comuns a pacientes e médicos
```
id, nome_completo, cpf, telefone, email, status, tipo (paciente/medico)
```

**pacientes** — herda / estende pessoa
```
id, pessoa_id (FK), data_nascimento, convenio, endereco
```

**medicos** — herda / estende pessoa
```
id, pessoa_id (FK), crm, especialidade, data_formatura
```

**consultas**
```
id, paciente_id (FK), medico_id (FK), data, horario, tipo_consulta,
convenio, valor, status (agendada/confirmada/realizada/cancelada),
created_at, updated_at
```

**prontuarios**
```
id, paciente_id (FK), medico_id (FK), data, cid, diagnostico,
prescricao, retorno_em_dias, laudo_liberado (boolean)
```

**lancamentos_financeiros**
```
id, consulta_id (FK), paciente_id (FK), medico_id (FK), data,
servico, convenio, valor, status (pago/pendente/atrasado),
forma_pagamento, observacao
```

**registros_ponto**
```
id, usuario_id (FK), data, entrada, saida, h_trabalhadas,
h_esperadas, diferenca, situacao (normal/atraso/falta/h_extra)
```

**usuarios**
```
id, nome, perfil (gestor/recepcionista/medico/paciente),
login, email, password_hash, ultimo_acesso, status,
modulos_permitidos (JSON array), created_at, updated_at
```

**log_auditoria**
```
id, data_hora, usuario_id (FK), acao, modulo, ip, resultado, detalhes
```

---

## 7. Requisitos

### 7.1 Requisitos Funcionais

| ID | Módulo | Descrição |
|---|---|---|
| RF01 | Agenda | Agendar, confirmar, cancelar e marcar consultas como realizadas, com sistema de cores por status |
| RF02 | Prontuário | Registrar histórico clínico com CID obrigatório, diagnóstico, prescrição e data de retorno |
| RF03 | Cadastro | Cadastrar pacientes (CPF, nascimento, telefone, e-mail, convênio, endereço) e médicos (CRM, especialidade) |
| RF04 | Financeiro | Registrar lançamentos por consulta com status de pagamento e calcular totais de receita paga, a receber e em atraso |
| RF05 | Ponto | Registrar entrada/saída e calcular automaticamente horas trabalhadas, classificando a situação |
| RF06 | Admin | Gerenciar usuários com perfis e permissões por módulo, com log de auditoria completo |
| RF07 | Dashboard | Exibir painel com indicadores: total de pacientes, consultas do dia, receita do mês e pendências |
| RF08 | Backup | Realizar backup automático diário dos dados com registro no log de auditoria |
| RF09 | Agenda → Financeiro | Ao registrar consulta como Realizada, criar lançamento financeiro automaticamente |
| RF10 | Portal Paciente | Disponibilizar download de laudos em PDF somente após liberação explícita do médico |

### 7.2 Requisitos Não Funcionais

| ID | Categoria | Descrição |
|---|---|---|
| RNF01 | Usabilidade | Interface intuitiva com menus visíveis, ícones descritivos e sistema de cores para status |
| RNF02 | Desempenho | Prontuário e agenda devem carregar em menos de 2 segundos em conexão padrão |
| RNF03 | Disponibilidade Offline | Funcionalidades essenciais (agenda e prontuário) devem funcionar com internet instável via cache local |
| RNF04 | Segurança | Acesso a laudos controlado por liberação médica explícita; dados protegidos conforme LGPD |
| RNF05 | Controle de Acesso | Cada perfil de usuário acessa somente os módulos pertinentes à sua função |
| RNF06 | Rastreabilidade | Toda ação no sistema registrada no log de auditoria com usuário, data/hora e IP |
| RNF07 | Compatibilidade | Funcionar nos principais navegadores modernos (Chrome, Firefox, Edge) e ser responsivo para mobile |

---

## 8. Stack Tecnológica

### Frontend

| Tecnologia | Versão / Uso |
|---|---|
| React | Biblioteca principal de UI |
| Vite | Build tool e servidor de desenvolvimento |
| TypeScript | Tipagem estática em todo o frontend |
| React Router | Roteamento de páginas |
| TanStack Query (React Query) | Gerenciamento de estado do servidor |
| Axios | Cliente HTTP centralizado (`src/api/axios.ts`) |
| TailwindCSS | Estilização utility-first |

### Backend

| Tecnologia | Uso |
|---|---|
| FastAPI | Framework principal da API REST |
| Uvicorn | Servidor ASGI |
| SQLAlchemy | ORM — modelos e queries |
| Alembic | Migrações de banco de dados |
| Pydantic | Schemas de request/response e validação |
| Pydantic Settings | Configurações via `.env` |
| PyJWT | Criação e validação de tokens JWT |
| Passlib + bcrypt | Hash de senhas |
| python-multipart | Upload de arquivos (laudos/exames) |
| openpyxl | Leitura e escrita de arquivos Excel (.xlsx) |
| pandas | Manipulação e exportação de dados tabulares |

### Banco de Dados

| Tecnologia | Uso |
|---|---|
| PostgreSQL | Banco de dados relacional principal |
| psycopg | Driver de conexão Python ↔ PostgreSQL |

### Infra / Deploy

| Tecnologia | Uso |
|---|---|
| Docker | Containerização dos serviços |
| Docker Compose | Orquestração local (postgres + backend + frontend) |
| Nginx / Caddy | Reverse proxy para produção |

### Por que openpyxl + pandas no backend?

O Excel protótipo (`Clínica.xlsx`) funciona como **fonte da verdade** do projeto — é a referência de todas as tabelas, campos, tipos de dado e regras de negócio. O backend utiliza:

- **pandas** → para importar dados do Excel e popular o banco durante desenvolvimento/testes
- **openpyxl** → para gerar relatórios financeiros e exportações em `.xlsx` a partir dos dados do banco

---

## 9. Arquitetura do Sistema

### Fluxo de Dados

```
Usuário (Browser)
  └── React Page
        └── Custom Hook (TanStack Query)
              └── API Function (Axios)
                    └── FastAPI Route
                          └── Service (regras de negócio)
                                └── Repository (SQLAlchemy queries)
                                      └── PostgreSQL
```

### Camadas do Backend

| Camada | Responsabilidade |
|---|---|
| `routes/` | Receber requisições HTTP, chamar services, retornar respostas |
| `services/` | Regras de negócio, validações, orquestração |
| `repositories/` | Queries SQLAlchemy, acesso ao banco de dados |
| `models/` | Definição das tabelas (SQLAlchemy ORM) |
| `schemas/` | Validação de entrada e formato de saída (Pydantic) |
| `core/` | Configuração, segurança, JWT, hash de senha |
| `dependencies/` | `get_current_user`, `get_db`, permissões por perfil |

### Camadas do Frontend

| Camada | Responsabilidade |
|---|---|
| `pages/` | Telas completas, compõem componentes e hooks |
| `components/` | Componentes reutilizáveis de UI e de domínio |
| `hooks/` | React Query hooks por domínio |
| `api/` | Funções de chamada HTTP por domínio |
| `types/` | Tipos TypeScript compartilhados |
| `utils/` | Funções utilitárias puras (formatação de datas, CPF, etc.) |
| `routes/` | ProtectedRoute e lógica de redirecionamento |

---

## 10. Estrutura de Pastas

```
inovatech/
├── backend/
│   ├── app/
│   │   ├── main.py                    # Entrypoint FastAPI
│   │   ├── database.py                # Engine, Session, Base
│   │   │
│   │   ├── core/
│   │   │   ├── config.py              # Pydantic Settings (.env)
│   │   │   └── security.py            # JWT, bcrypt
│   │   │
│   │   ├── models/
│   │   │   ├── usuario.py
│   │   │   ├── paciente.py
│   │   │   ├── medico.py
│   │   │   ├── consulta.py
│   │   │   ├── prontuario.py
│   │   │   ├── lancamento_financeiro.py
│   │   │   ├── registro_ponto.py
│   │   │   └── log_auditoria.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── usuario.py
│   │   │   ├── paciente.py
│   │   │   ├── medico.py
│   │   │   ├── consulta.py
│   │   │   ├── prontuario.py
│   │   │   ├── financeiro.py
│   │   │   └── ponto.py
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── usuarios.py
│   │   │   ├── pacientes.py
│   │   │   ├── medicos.py
│   │   │   ├── consultas.py
│   │   │   ├── prontuarios.py
│   │   │   ├── financeiro.py
│   │   │   ├── ponto.py
│   │   │   └── admin.py
│   │   │
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── consulta_service.py    # Inclui disparo de lembrete WhatsApp
│   │   │   ├── financeiro_service.py  # Criação automática de lançamento
│   │   │   ├── prontuario_service.py  # Controle de liberação de laudo
│   │   │   ├── ponto_service.py       # Cálculo automático de horas/situação
│   │   │   └── auditoria_service.py   # Registro de log em todas as ações
│   │   │
│   │   ├── repositories/
│   │   │   ├── usuario_repository.py
│   │   │   ├── paciente_repository.py
│   │   │   ├── medico_repository.py
│   │   │   ├── consulta_repository.py
│   │   │   ├── prontuario_repository.py
│   │   │   ├── financeiro_repository.py
│   │   │   ├── ponto_repository.py
│   │   │   └── auditoria_repository.py
│   │   │
│   │   └── dependencies/
│   │       └── auth.py                # get_current_user, require_role
│   │
│   ├── alembic/
│   ├── alembic.ini
│   ├── .env
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── api/
│       │   ├── axios.ts
│       │   ├── auth.ts
│       │   ├── pacientes.ts
│       │   ├── medicos.ts
│       │   ├── consultas.ts
│       │   ├── prontuarios.ts
│       │   ├── financeiro.ts
│       │   ├── ponto.ts
│       │   └── admin.ts
│       │
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useCurrentUser.ts
│       │   ├── useConsultas.ts
│       │   ├── useProntuarios.ts
│       │   ├── useFinanceiro.ts
│       │   ├── usePonto.ts
│       │   └── useAdmin.ts
│       │
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Agenda.tsx
│       │   ├── Prontuario.tsx
│       │   ├── Cadastro.tsx
│       │   ├── Financeiro.tsx
│       │   ├── Ponto.tsx
│       │   ├── Admin.tsx
│       │   └── PortalPaciente.tsx
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── Navbar.tsx
│       │   │   └── PageContainer.tsx
│       │   ├── ui/
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Badge.tsx         # Status coloridos
│       │   │   ├── Modal.tsx
│       │   │   ├── Table.tsx
│       │   │   ├── Loading.tsx
│       │   │   └── ErrorMessage.tsx
│       │   ├── dashboard/
│       │   │   └── IndicadorCard.tsx
│       │   ├── agenda/
│       │   │   ├── ConsultaForm.tsx
│       │   │   └── ConsultaRow.tsx
│       │   ├── prontuario/
│       │   │   └── ProntuarioForm.tsx
│       │   ├── financeiro/
│       │   │   └── LancamentoRow.tsx
│       │   └── ponto/
│       │       └── RegistroPontoRow.tsx
│       │
│       ├── routes/
│       │   └── ProtectedRoute.tsx
│       │
│       ├── types/
│       │   ├── auth.ts
│       │   ├── usuario.ts
│       │   ├── consulta.ts
│       │   ├── prontuario.ts
│       │   ├── financeiro.ts
│       │   └── ponto.ts
│       │
│       ├── utils/
│       │   ├── formatDate.ts
│       │   ├── formatCPF.ts
│       │   └── calcularHoras.ts
│       │
│       ├── App.tsx
│       └── main.tsx
│
├── docker-compose.yml
└── README.md
```

---

## 11. Autenticação e Segurança

### Estratégia de Autenticação

- **JWT stateless** armazenado em **HttpOnly cookie** (nunca em localStorage ou sessionStorage)
- Frontend nunca lê o token diretamente — o browser o envia automaticamente a cada requisição
- Backend valida o token em cada rota protegida via dependency injection (`get_current_user`)

### Fluxo de Login

```
1. Usuário submete login/senha no React
2. React envia POST /auth/login via Axios (withCredentials: true)
3. Backend valida credenciais (bcrypt)
4. Backend gera JWT (PyJWT) com id, perfil e expiração
5. Backend define JWT em HttpOnly cookie
6. Browser armazena cookie automaticamente
7. Todas as próximas requisições incluem o cookie automaticamente
```

### Controle de Acesso por Perfil

A dependência `require_role` no backend bloqueia acesso a rotas não permitidas:

```
Gestor       → todos os módulos
Recepcionista → Agenda, Cadastro
Médico       → Agenda, Prontuário
Paciente     → Portal do Paciente (somente laudos liberados)
```

### Configuração de Cookie

| Ambiente | httponly | secure | samesite |
|---|---|---|---|
| Desenvolvimento local | true | false | lax |
| Produção (HTTPS) | true | true | none |

### Variáveis de Ambiente

**Backend (`.env`):**
```
DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/inovatech
JWT_SECRET=<secret_key>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
FRONTEND_URL=http://localhost:5173
```

**Frontend (`.env`):**
```
VITE_API_URL=http://localhost:8000
```

---

## 12. Rotas da API

### Autenticação
```
POST /auth/login
POST /auth/logout
GET  /auth/me
```

### Pacientes
```
GET    /pacientes
POST   /pacientes
GET    /pacientes/{id}
PATCH  /pacientes/{id}
DELETE /pacientes/{id}
```

### Médicos
```
GET    /medicos
POST   /medicos
GET    /medicos/{id}
PATCH  /medicos/{id}
```

### Consultas (Agenda)
```
GET    /consultas
POST   /consultas
GET    /consultas/{id}
PATCH  /consultas/{id}          # Atualiza status (dispara lembrete e/ou lançamento financeiro)
DELETE /consultas/{id}
GET    /consultas/hoje           # Consultas do dia para o dashboard
```

### Prontuários
```
GET    /prontuarios
POST   /prontuarios
GET    /prontuarios/{id}
PATCH  /prontuarios/{id}
PATCH  /prontuarios/{id}/liberar-laudo  # Libera laudo para o paciente
GET    /prontuarios/paciente/{paciente_id}
```

### Financeiro
```
GET    /financeiro
GET    /financeiro/indicadores   # Receita paga, a receber, atrasado, total
POST   /financeiro
PATCH  /financeiro/{id}
```

### Folha de Ponto
```
GET    /ponto
POST   /ponto
GET    /ponto/{id}
PATCH  /ponto/{id}
GET    /ponto/totais             # Totais do período
```

### Administrativo
```
GET    /admin/usuarios
POST   /admin/usuarios
PATCH  /admin/usuarios/{id}
GET    /admin/log-auditoria
GET    /admin/backup             # Trigger manual de backup
```

### Portal do Paciente
```
GET    /portal/consultas         # Consultas do paciente autenticado
GET    /portal/laudos            # Laudos liberados do paciente autenticado
GET    /portal/laudos/{id}/download  # Download do PDF do laudo
```

---

## 13. Páginas do Frontend

| Rota | Página | Perfis com Acesso | Descrição |
|---|---|---|---|
| `/login` | Login | Todos | Formulário de autenticação |
| `/dashboard` | Dashboard | Gestor, Recepcionista, Médico | Painel com indicadores e acesso aos módulos |
| `/agenda` | Agenda | Gestor, Recepcionista, Médico | Tabela de consultas com filtros e formulário de agendamento |
| `/prontuario` | Prontuário | Gestor, Médico | Histórico clínico por paciente |
| `/cadastro` | Cadastro | Gestor, Recepcionista | Cadastro unificado de pacientes e médicos |
| `/financeiro` | Financeiro | Gestor | Lançamentos financeiros com indicadores |
| `/ponto` | Folha de Ponto | Gestor, Médico, Recepcionista | Registro e consulta de ponto |
| `/admin` | Administrativo | Gestor | Usuários, permissões e log de auditoria |
| `/portal` | Portal do Paciente | Paciente | Agendamentos e download de laudos |

---

## 14. Regras de Negócio Críticas

Estas regras devem ser implementadas no backend (`services/`) e jamais apenas no frontend:

### RN01 — Lançamento Financeiro Automático
Quando uma consulta tem seu status atualizado para **Realizada**, o sistema cria automaticamente um `LancamentoFinanceiro` com status **Pendente**, vinculado à consulta, ao paciente e ao médico.

### RN02 — Bloqueio de Laudo sem Liberação Médica
O paciente **não pode visualizar nem baixar** nenhum laudo ou exame enquanto o campo `laudo_liberado` do prontuário for `false`. A liberação é uma ação exclusiva do médico responsável.

### RN03 — Cálculo Automático de Horas no Ponto
Ao registrar saída, o sistema calcula automaticamente:
- `h_trabalhadas = saida - entrada` (em horas decimais)
- `diferenca = h_trabalhadas - h_esperadas` (padrão: 8h)
- `situacao` = Normal | Atraso | Falta | H.Extra conforme as regras de classificação

### RN04 — Log de Auditoria Universal
Toda ação realizada no sistema deve gerar um registro em `log_auditoria` com: usuário, data/hora, módulo, ação, IP e resultado. Isso inclui login, logout, criação, edição, exclusão e backup automático.

### RN05 — Permissões por Perfil
Rotas protegidas devem usar a dependência `require_role` para garantir que apenas perfis autorizados acessem cada módulo. Uma recepcionista não pode acessar o módulo financeiro; um médico não pode acessar o administrativo.

### RN06 — Envio de Lembrete WhatsApp
Ao confirmar um agendamento (status muda para **Confirmada**), o sistema deve disparar um lembrete automático para o telefone do paciente via WhatsApp Business API.

### RN07 — Validação de CPF e CRM
CPF é único por paciente; CRM é único por médico. O sistema deve validar o formato e a unicidade antes de persistir.

---

## 15. Fonte da Verdade — Excel Protótipo

O arquivo `Clínica.xlsx` é o protótipo funcional do sistema, com dados reais de exemplo validados pela gestora e pelos médicos da clínica. Ele contém 7 abas que espelham os módulos do sistema:

| Aba | Conteúdo |
|---|---|
| 🏠 Menu | Dashboard com 4 indicadores + navegação entre módulos |
| 📅 Agenda | 6 consultas de exemplo com pacientes, médicos, convênios e status |
| 📋 Prontuário | 4 registros clínicos com CID, diagnóstico e prescrição |
| 💰 Financeiro | 6 lançamentos com status Pago/Pendente/Atrasado + indicadores totais |
| 👥 Cadastro | 5 pacientes + 3 médicos cadastrados com todos os campos |
| 🕐 Ponto | 7 registros de ponto com cálculo automático de horas e situação |
| ⚙️ Admin | 5 usuários com perfis/permissões + 6 entradas no log de auditoria |

**Uso no desenvolvimento:**
- O backend usa `pandas` + `openpyxl` para importar os dados do Excel e popular o banco durante desenvolvimento e testes
- O Excel define os campos exatos, os tipos de dado e os valores de enum de cada tabela
- Quaisquer dúvidas sobre estrutura de dados devem ser resolvidas consultando o Excel protótipo

---

## 16. Cronograma

| Atividade | Jan | Fev | Mar | Abr | Mai | Jun | Jul | Ago | Set | Out | Nov | Dez |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Levantamento de requisitos | ✓ | ✓ | | | | | | | | | | |
| Análise do sistema | | | ✓ | ✓ | | | | | | | | |
| Projeto da arquitetura | | | | | ✓ | ✓ | | | | | | |
| Implementação | | | | | | | ✓ | ✓ | | | | |
| Testes | | | | | | | | | ✓ | | | |
| Documentação | | | | | | | | | | ✓ | | |
| Entrega final | | | | | | | | | | | | ✓ |

---

## 17. Escopo

### Dentro do escopo (MVP)

- Seis módulos completos: Agenda, Prontuário, Cadastro, Financeiro, Ponto, Administrativo
- Dashboard com indicadores em tempo real
- Autenticação JWT com controle de acesso por perfil
- Log de auditoria automático em todas as ações
- Integração com WhatsApp Business API para lembretes de consulta
- Portal do paciente para download de laudos liberados
- Backup automático diário com registro no log
- Exportação de relatórios financeiros em Excel
- Import inicial de dados a partir do Excel protótipo
- Funcionamento offline das funcionalidades essenciais (cache local)

### Fora do escopo (versão futura)

- Integração direta com sistemas de convênios (TISS/ANS)
- Emissão de notas fiscais eletrônicas
- Telemedicina / videochamadas integradas
- Aplicativo mobile nativo (iOS/Android)
- Prescrição digital integrada com farmácias
- Sugestão de diagnósticos por Inteligência Artificial
- Integração com Prontuário Nacional de Saúde

---

## Referências

- SHORTLIFFE, E. H.; CIMINO, J. J. *Biomedical Informatics*. 4. ed. Springer, 2014.
- LAUDON, K. C.; LAUDON, J. P. *Management Information Systems*. 16. ed. Pearson, 2021.
- SOMMERVILLE, I. *Engenharia de Software*. 10. ed. Pearson, 2019.
- CFM. *Digitalização dos serviços de saúde no Brasil*. Brasília: CFM, 2023.
- BRASIL. *Lei Geral de Proteção de Dados Pessoais (LGPD)* — Lei nº 13.709/2018.

---

> **Próximos passos:** Com este documento como base conceitual, os prompts de desenvolvimento do **Back-end** e **Front-end** serão gerados separadamente, focando na implementação técnica de cada camada.
