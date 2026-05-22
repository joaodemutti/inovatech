# Plan: INOVATECH Backend — Implementação Completa

## Context

O repositório `inovatech` contém apenas arquivos de documentação (README, specs). Nenhum código existe ainda. Este plano implementa o backend completo conforme o `INOVATECH_BACKEND_PROMPT.md`: uma API FastAPI para gestão clínica da Clínica Vida Plena, projeto acadêmico do SENAI Mariano Ferraz.

---

## Abordagem

Seguir exatamente a ordem de implementação prescrita no prompt para evitar dependências circulares. Todos os arquivos serão criados do zero dentro de `backend/` e `docker-compose.yml` na raiz.

---

## Estrutura a Criar

```
inovatech/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── .env.example
│   ├── alembic.ini
│   ├── seed.py
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   └── app/
│       ├── main.py
│       ├── database.py
│       ├── core/
│       │   ├── config.py
│       │   └── security.py
│       ├── models/
│       │   ├── __init__.py
│       │   ├── usuario.py
│       │   ├── pessoa.py
│       │   ├── paciente.py
│       │   ├── medico.py
│       │   ├── consulta.py
│       │   ├── prontuario.py
│       │   ├── lancamento_financeiro.py
│       │   ├── registro_ponto.py
│       │   └── log_auditoria.py
│       ├── schemas/
│       │   ├── auth.py
│       │   ├── usuario.py
│       │   ├── paciente.py
│       │   ├── medico.py
│       │   ├── consulta.py
│       │   ├── prontuario.py
│       │   ├── financeiro.py
│       │   └── ponto.py
│       ├── repositories/
│       │   ├── usuario_repository.py
│       │   ├── paciente_repository.py
│       │   ├── medico_repository.py
│       │   ├── consulta_repository.py
│       │   ├── prontuario_repository.py
│       │   ├── financeiro_repository.py
│       │   ├── ponto_repository.py
│       │   └── auditoria_repository.py
│       ├── dependencies/
│       │   └── auth.py
│       ├── services/
│       │   ├── auditoria_service.py
│       │   ├── auth_service.py
│       │   ├── consulta_service.py
│       │   ├── financeiro_service.py
│       │   ├── prontuario_service.py
│       │   ├── ponto_service.py
│       │   └── excel_service.py
│       └── routes/
│           ├── auth.py
│           ├── usuarios.py
│           ├── pacientes.py
│           ├── medicos.py
│           ├── consultas.py
│           ├── prontuarios.py
│           ├── financeiro.py
│           ├── ponto.py
│           ├── admin.py
│           ├── portal.py
│           ├── excel.py
│           └── dashboard.py
├── docker-compose.yml
└── (README.md já existe)
```

---

## Passos de Implementação

### Passo 1 — Infraestrutura base
- `backend/requirements.txt` — dependências exatas do prompt
- `backend/.env.example` — variáveis de ambiente
- `backend/Dockerfile` — imagem Python 3.12-slim, instala deps, expõe porta 8000
- `docker-compose.yml` — serviços `postgres` (PostgreSQL 16) e `backend` (FastAPI + hot-reload)

### Passo 2 — Configuração e segurança
- `backend/app/core/config.py` — `Settings` com Pydantic Settings lendo `.env`
- `backend/app/core/security.py` — `criar_token()`, `verificar_senha()`, `criar_hash_senha()`

### Passo 3 — Database
- `backend/app/database.py` — engine síncrono `psycopg`, `SessionLocal`, `Base`, `get_db()`

### Passo 4 — Models (na ordem para evitar FK quebradas)
1. `models/usuario.py` — tabela `usuarios`, enum perfil/status, JSON modulos_permitidos
2. `models/pessoa.py` — tabela `pessoas` (superclasse), enum tipo
3. `models/paciente.py` — tabela `pacientes`, FK → pessoas
4. `models/medico.py` — tabela `medicos`, FK → pessoas
5. `models/consulta.py` — tabela `consultas`, FK → pacientes + medicos
6. `models/prontuario.py` — tabela `prontuarios`, FK → pacientes + medicos
7. `models/lancamento_financeiro.py` — FK → consultas + pacientes + medicos
8. `models/registro_ponto.py` — FK → usuarios
9. `models/log_auditoria.py` — FK → usuarios (nullable)
10. `models/__init__.py` — importa todos para Alembic descobrir

### Passo 5 — Migrações Alembic
- `alembic init alembic`
- Ajustar `alembic/env.py` para importar `Base` e usar `DATABASE_URL` do `.env`
- `alembic revision --autogenerate -m "initial"`
- `alembic upgrade head`

### Passo 6 — Schemas Pydantic v2
Cada schema tem variantes `Create`, `Update`, `Response`. Nunca expor `password_hash`.
- `schemas/auth.py` — `LoginRequest`, `TokenResponse`
- `schemas/usuario.py` — `UsuarioCreate`, `UsuarioUpdate`, `UsuarioResponse`
- `schemas/paciente.py` — inclui campos de `pessoa` + campos de `paciente`
- `schemas/medico.py` — inclui campos de `pessoa` + CRM + especialidade
- `schemas/consulta.py`
- `schemas/prontuario.py`
- `schemas/financeiro.py`
- `schemas/ponto.py`

### Passo 7 — Repositories
Cada repository usa `db: Session`, implementa CRUD básico + queries específicas.
- `auditoria_repository.py` — `criar_log()`, `listar_logs(filtros)`
- `usuario_repository.py` — `buscar_por_login()`, `buscar_por_email()`
- `paciente_repository.py` — `buscar_por_cpf()` para validar unicidade (RN07)
- `medico_repository.py` — `buscar_por_crm()` para validar unicidade (RN07)
- `consulta_repository.py` — `listar_por_data()`, `listar_hoje()`
- `prontuario_repository.py` — `listar_por_paciente()`
- `financeiro_repository.py` — `calcular_indicadores()`
- `ponto_repository.py` — `calcular_totais(periodo)`

### Passo 8 — Dependencies
- `dependencies/auth.py`:
  - `get_current_user(request, db)` — lê cookie `access_token`, decodifica JWT, retorna `Usuario`
  - `require_role(*perfis)` — decorator que verifica `current_user.perfil`

### Passo 9 — Services (ordem: auditoria primeiro pois todos dependem dela)
- `auditoria_service.py` — `registrar_acao(db, usuario_id, acao, modulo, ip, resultado, detalhes)`
- `auth_service.py` — login (verifica senha, gera token, atualiza `ultimo_acesso`, loga auditoria)
- `consulta_service.py`:
  - **RN01**: ao mudar status → `"realizada"`, criar `LancamentoFinanceiro` automaticamente
  - **RN06**: ao mudar status → `"confirmada"`, chamar stub `enviar_lembrete_whatsapp()`
- `prontuario_service.py`:
  - **RN02**: `liberar_laudo()` só para perfil `"medico"`, `download_laudo()` verifica `laudo_liberado`
- `financeiro_service.py` — CRUD + cálculo de indicadores (receita_paga, a_receber, atrasado)
- `ponto_service.py`:
  - **RN03**: ao registrar saída, calcular `h_trabalhadas`, `diferenca`, classificar `situacao`
- `excel_service.py`:
  - `exportar_para_xlsx(dados, colunas) → BytesIO` usando `openpyxl`
  - `importar_de_xlsx(arquivo, colunas_obrigatorias) → (registros, erros)` usando `pandas`

### Passo 10 — Routes
Cada rota usa `Depends(get_current_user)` e `require_role(...)` conforme mapeamento.
- `routes/auth.py` — `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `routes/usuarios.py` — CRUD básico
- `routes/pacientes.py` — CRUD + soft delete (status = "inativo")
- `routes/medicos.py` — CRUD
- `routes/consultas.py` — CRUD + `GET /consultas/hoje` + filtros por data/medico/status
- `routes/prontuarios.py` — CRUD + `PATCH /{id}/liberar-laudo` + histórico por paciente
- `routes/financeiro.py` — CRUD + `GET /financeiro/indicadores`
- `routes/ponto.py` — CRUD + `GET /ponto/totais`
- `routes/admin.py` — usuários, log de auditoria, backup trigger
- `routes/portal.py` — consultas e laudos do paciente autenticado (RN02)
- `routes/excel.py` — 8 exports + 7 imports (tudo requer perfil `gestor`)
- `routes/dashboard.py` — `GET /dashboard/indicadores` (total_pacientes, consultas_hoje, receita_mes, valores_pendentes)

### Passo 11 — main.py
- Registrar todos os 12 routers com prefixos corretos
- Configurar `CORSMiddleware` com `allow_credentials=True` (necessário para cookies)
- `lifespan` context manager para verificar conexão DB na inicialização

### Passo 12 — seed.py
Popula o banco com dados consistentes:
- 5 usuários (1 gestor, 1 recepcionista, 3 médicos), senha: `Inovatech@2026`
- 5 pacientes com CPF e convênio
- 3 médicos vinculados a usuários
- 6 consultas com status variados
- 4 prontuários com CIDs reais (I10, J06.9, M54.5, S82.0)
- 6 lançamentos financeiros
- 7 registros de ponto
- 6 logs de auditoria

---

## Regras de Negócio — Resumo de Implementação

| RN | Onde | Descrição |
|----|------|-----------|
| RN01 | `consulta_service.py` | Cria `LancamentoFinanceiro` ao marcar consulta como `"realizada"` |
| RN02 | `prontuario_service.py` | Bloqueia download de laudo se `laudo_liberado == False` (HTTP 403) |
| RN03 | `ponto_service.py` | Calcula `h_trabalhadas`, `diferenca`, classifica `situacao` ao registrar saída |
| RN04 | `auditoria_service.py` | Log universal em toda operação, inclusive falhas |
| RN05 | `dependencies/auth.py` | `require_role(*perfis)` verifica perfil do usuário autenticado |
| RN06 | `consulta_service.py` | Stub WhatsApp ao confirmar consulta |
| RN07 | repositories | Valida unicidade de CPF e CRM antes de INSERT (HTTP 409) |

---

## Arquivos Críticos

| Arquivo | Responsabilidade |
|---------|-----------------|
| `backend/app/core/config.py` | Pydantic Settings — todas as env vars |
| `backend/app/core/security.py` | JWT create/verify, bcrypt hash/verify |
| `backend/app/database.py` | Engine, SessionLocal, Base, get_db |
| `backend/app/dependencies/auth.py` | get_current_user, require_role |
| `backend/app/services/auditoria_service.py` | registrar_acao — chamado por todos os services |
| `backend/app/services/consulta_service.py` | RN01 (financeiro auto) + RN06 (WhatsApp stub) |
| `backend/app/services/prontuario_service.py` | RN02 (bloqueio laudo) |
| `backend/app/services/ponto_service.py` | RN03 (cálculo horas) |
| `backend/app/main.py` | Registro de routers + CORS + lifespan |
| `backend/seed.py` | Dados iniciais consistentes |
| `docker-compose.yml` | Orquestração postgres + backend |

---

## Verificação (End-to-End)

1. `docker-compose up --build` → sem erros, backend em `http://localhost:8000`
2. `docker-compose exec backend python seed.py` → banco populado
3. `http://localhost:8000/docs` → Swagger UI com todos os endpoints listados
4. Fluxo completo via Swagger/curl:
   - `POST /auth/login` (roberto / Inovatech@2026) → cookie JWT setado
   - `POST /consultas` → criar consulta
   - `PATCH /consultas/{id}` com `{"status": "realizada"}` → verificar `GET /financeiro` com lançamento criado
   - `PATCH /prontuarios/{id}/liberar-laudo` → laudo liberado
   - `GET /portal/laudos` (autenticado como paciente) → laudo visível
   - `GET /excel/export/consultas` → download `.xlsx`
