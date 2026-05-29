# INOVATECH — Backend

API REST da plataforma de gestão clínica **Clínica Vida Plena**, desenvolvida com FastAPI e PostgreSQL.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | FastAPI |
| Linguagem | Python 3.12+ |
| ORM | SQLAlchemy 2.0 |
| Banco de dados | PostgreSQL 17 |
| Migrations | Alembic |
| Autenticação | JWT (PyJWT + bcrypt) |
| Validação | Pydantic v2 |
| Excel | Pandas + openpyxl |
| Testes | pytest + pytest-cov + pytest-html |

---

## Pré-requisitos

- Python 3.12+
- PostgreSQL 17
- Docker + Docker Compose (opcional)

---

## Instalação local

```bash
cd backend

# Criar e ativar ambiente virtual
python -m venv .venv
source .venv/bin/activate      # Linux/Mac
.venv\Scripts\activate         # Windows

# Instalar dependências
pip install -r requirements.txt
```

---

## Configuração

Crie o arquivo `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://inovatech:senha@localhost:5432/inovatech_db
JWT_SECRET=sua_chave_secreta_aqui
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
FRONTEND_URL=http://localhost:3000
```

> **Nunca commite o `.env`** — ele já está no `.gitignore`.

---

## Executar

### Com Docker Compose (recomendado)

```bash
# Na raiz do repositório
docker-compose up --build
# → API disponível em http://localhost:8000
```

### Local (sem Docker)

```bash
# Criar banco de dados
createdb -U postgres inovatech_db

# Rodar migrations
alembic upgrade head

# Popular banco com dados iniciais
python seed.py

# Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Credenciais padrão (seed)

| Nome | Perfil | Login | Senha |
|---|---|---|---|
| Roberto | Gestor | `admin` | `Inovatech@2026` |
| Ana | Recepcionista | `recepcao` | `Inovatech@2026` |
| Carlos | Médico | `dr.silva` | `Inovatech@2026` |
| Renata | Médico | `dra.renata` | `Inovatech@2026` |
| João | Paciente | `joao.paciente` | `Inovatech@2026` |

---

## Documentação da API

Com o servidor rodando, acesse:

| URL | Descrição |
|---|---|
| `http://localhost:8000/docs` | Swagger UI (interativo) |
| `http://localhost:8000/redoc` | ReDoc (documentação) |

---

## Rotas disponíveis

| Prefixo | Módulo | Perfis com acesso |
|---|---|---|
| `POST /auth/login` | Autenticação | Público |
| `GET /auth/me` | Usuário atual | Autenticado |
| `GET/POST /usuarios` | Usuários | gestor |
| `GET/POST /pacientes` | Pacientes | gestor, recepcionista, medico |
| `GET/POST /medicos` | Médicos | Autenticado (escrita: gestor) |
| `GET/POST /consultas` | Consultas | Autenticado |
| `GET/POST /prontuarios` | Prontuários | gestor, medico |
| `GET/POST /financeiro` | Financeiro | gestor |
| `GET/POST /ponto` | Ponto | Autenticado |
| `GET /dashboard/indicadores` | Dashboard | Autenticado |
| `GET /admin/log-auditoria` | Auditoria | gestor |
| `GET /excel/export/{modulo}` | Exportação | gestor |
| `POST /excel/import/{modulo}` | Importação | gestor |
| `GET /portal/consultas` | Portal paciente | paciente |
| `GET /portal/laudos` | Laudos | paciente |

---

## Migrations (Alembic)

```bash
# Criar nova migration
alembic revision --autogenerate -m "descricao"

# Aplicar todas as migrations pendentes
alembic upgrade head

# Reverter última migration
alembic downgrade -1

# Ver histórico
alembic history
```

---

## Testes

### Pré-requisito: banco de teste

```sql
-- Execute uma vez no PostgreSQL
CREATE DATABASE inovatech_test OWNER inovatech;
```

### Instalar dependências de teste

```bash
pip install -r requirements-test.txt
```

### Executar

```bash
# Todos os testes + relatório HTML + cobertura
bash run_tests.sh

# Ou diretamente com pytest
pytest

# Módulo específico
pytest tests/test_pacientes.py -v

# Com banco de teste personalizado
TEST_DATABASE_URL=postgresql+psycopg://user:pass@host/db pytest
```

### Relatórios gerados

| Arquivo | Conteúdo |
|---|---|
| `reports/report.html` | Resultado por teste, tempo, stacktrace |
| `reports/coverage/index.html` | Cobertura de código por módulo |

### Cobertura dos testes

| Arquivo | O que cobre |
|---|---|
| `test_health.py` | Health check |
| `test_auth.py` | Login, logout, /me, tokens, usuário inativo |
| `test_usuarios.py` | CRUD, duplicatas login/email, roles |
| `test_pacientes.py` | CRUD, soft delete, CPF duplicado, roles |
| `test_medicos.py` | CRUD, CRM/CPF duplicado, roles |
| `test_consultas.py` | CRUD, filtros, hoje, roles |
| `test_prontuarios.py` | CRUD, liberar laudo, roles medico |
| `test_financeiro.py` | Indicadores, CRUD, roles gestor |
| `test_ponto.py` | Totais, CRUD, filtros de data |
| `test_dashboard.py` | Indicadores refletem banco |
| `test_admin.py` | Log de auditoria, backup, roles |
| `test_excel.py` | Export 8 módulos, bytes PK, roles |
| `test_portal.py` | Consultas/laudos/download paciente |

---

## Estrutura de pastas

```
backend/
├── app/
│   ├── core/             # config.py, security.py (JWT/bcrypt)
│   ├── dependencies/     # auth.py (get_current_user, require_role)
│   ├── models/           # SQLAlchemy ORM models
│   ├── repositories/     # Camada de acesso a dados
│   ├── routes/           # Endpoints FastAPI (um arquivo por módulo)
│   ├── schemas/          # Pydantic schemas (request/response)
│   ├── services/         # Regras de negócio
│   ├── database.py       # Engine, SessionLocal, get_db
│   └── main.py           # FastAPI app, CORS, routers
├── alembic/              # Migrations
├── tests/                # Suite de testes pytest
├── reports/              # Relatórios gerados (gitignored)
├── seed.py               # Dados iniciais
├── requirements.txt
├── requirements-test.txt
├── pytest.ini
├── run_tests.sh
└── Dockerfile
```

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `DATABASE_URL` | — | URL de conexão PostgreSQL |
| `JWT_SECRET` | — | Chave secreta para assinar tokens |
| `JWT_ALGORITHM` | `HS256` | Algoritmo JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` | Expiração do token (8 horas) |
| `FRONTEND_URL` | `http://localhost:3000` | Origem permitida no CORS |
| `TEST_DATABASE_URL` | *(ver acima)* | Banco exclusivo para testes |
