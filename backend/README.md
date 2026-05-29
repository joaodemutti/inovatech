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
| Testes | pytest + httpx + pytest-html |

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
| Roberto | Gestor | `roberto` | `Inovatech@2026` |
| Ana | Recepcionista | `ana` | `Inovatech@2026` |
| Carlos | Medico | `carlos` | `Inovatech@2026` |
| Renata | Medico | `renata` | `Inovatech@2026` |
| Maria | Paciente | `maria` | `Inovatech@2026` |
| Joao | Paciente | `joao` | `Inovatech@2026` |

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

## Testes E2E de API

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
# Todos os testes E2E de API contra uma API ja rodando
bash run_tests.sh

# Ou diretamente com pytest
E2E_API_URL=http://localhost:8000 pytest tests_e2e

# Módulo específico
pytest tests_e2e/test_cadastro.py -v

# Com Docker Compose, subindo banco + API + runner E2E
docker compose -f ../docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from api-e2e
```

### Relatórios gerados

| Arquivo | Conteúdo |
|---|---|
| `reports/report.html` | Resultado por teste, tempo, stacktrace |

### Cobertura dos testes

| Arquivo | O que cobre |
|---|---|
| `test_auth_roles.py` | Login, logout, /me e permissoes por perfil |
| `test_cadastro.py` | Pacientes e medicos pela API real |
| `test_agenda_financeiro.py` | Consultas, status e agenda -> financeiro |
| `test_prontuario_portal.py` | Prontuario, liberacao de laudo e portal |
| `test_ponto_admin_excel.py` | Ponto, admin, backup e Excel import/export |

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
├── tests_e2e/            # Suite E2E de API via pytest + httpx
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
