# Prompt — Claude Code: Desenvolvimento do Backend INOVATECH

> Copie e cole este prompt diretamente no Claude Code para iniciar o desenvolvimento do backend.

---

## Contexto do Projeto

Você vai desenvolver o **backend completo** do **Inova Tech**, um sistema de gestão clínica para a Clínica Vida Plena. O sistema gerencia agendamentos, prontuários, cadastros, financeiro, ponto de funcionários e administração de usuários.

Este é um projeto acadêmico do SENAI "Mariano Ferraz", disciplina de Engenharia de Software.

---

## Stack Tecnológica (não negociável)

- **Framework:** FastAPI
- **Servidor:** Uvicorn (ASGI)
- **ORM:** SQLAlchemy (modo síncrono)
- **Migrações:** Alembic
- **Banco de Dados:** PostgreSQL com driver `psycopg`
- **Schemas/Validação:** Pydantic v2 + Pydantic Settings
- **Autenticação:** JWT via PyJWT + HttpOnly cookie
- **Senhas:** Passlib + bcrypt
- **Upload:** python-multipart
- **Excel:** openpyxl (escrita/exportação) + pandas (leitura/importação)
- **Containerização:** Docker + Docker Compose

---

## Estrutura de Pastas Obrigatória

Crie exatamente esta estrutura:

```
inovatech/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── models/
│   │   │   ├── usuario.py
│   │   │   ├── paciente.py
│   │   │   ├── medico.py
│   │   │   ├── consulta.py
│   │   │   ├── prontuario.py
│   │   │   ├── lancamento_financeiro.py
│   │   │   ├── registro_ponto.py
│   │   │   └── log_auditoria.py
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   ├── usuario.py
│   │   │   ├── paciente.py
│   │   │   ├── medico.py
│   │   │   ├── consulta.py
│   │   │   ├── prontuario.py
│   │   │   ├── financeiro.py
│   │   │   └── ponto.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── usuarios.py
│   │   │   ├── pacientes.py
│   │   │   ├── medicos.py
│   │   │   ├── consultas.py
│   │   │   ├── prontuarios.py
│   │   │   ├── financeiro.py
│   │   │   ├── ponto.py
│   │   │   ├── admin.py
│   │   │   ├── portal.py
│   │   │   └── excel.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── consulta_service.py
│   │   │   ├── financeiro_service.py
│   │   │   ├── prontuario_service.py
│   │   │   ├── ponto_service.py
│   │   │   ├── auditoria_service.py
│   │   │   └── excel_service.py
│   │   ├── repositories/
│   │   │   ├── usuario_repository.py
│   │   │   ├── paciente_repository.py
│   │   │   ├── medico_repository.py
│   │   │   ├── consulta_repository.py
│   │   │   ├── prontuario_repository.py
│   │   │   ├── financeiro_repository.py
│   │   │   ├── ponto_repository.py
│   │   │   └── auditoria_repository.py
│   │   └── dependencies/
│   │       └── auth.py
│   ├── alembic/
│   ├── alembic.ini
│   ├── .env.example
│   ├── requirements.txt
│   └── seed.py
├── docker-compose.yml
└── README.md
```

---

## Modelos de Dados (SQLAlchemy)

Implemente as tabelas abaixo com todos os campos, tipos e constraints especificados.

### `usuarios`
```python
id: int (PK, autoincrement)
nome: str (not null)
perfil: Enum("gestor", "recepcionista", "medico", "paciente") (not null)
login: str (unique, not null)
email: str (unique, not null)
password_hash: str (not null)
ultimo_acesso: datetime (nullable)
status: Enum("ativo", "inativo") (default="ativo")
modulos_permitidos: JSON (nullable)  # lista de strings
observacao: str (nullable)
created_at: datetime (default=now)
updated_at: datetime (onupdate=now)
```

### `pessoas` (superclasse compartilhada)
```python
id: int (PK, autoincrement)
nome_completo: str (not null)
cpf: str (unique, not null)       # formato: "000.000.000-00"
telefone: str (nullable)
email: str (nullable)
status: Enum("ativo", "inativo") (default="ativo")
tipo: Enum("paciente", "medico") (not null)
```

### `pacientes` (estende pessoa)
```python
id: int (PK, autoincrement)
pessoa_id: int (FK → pessoas.id, not null)
data_nascimento: date (nullable)
convenio: str (nullable)           # Ex.: "Unimed", "Particular", "Bradesco Saúde"
endereco: str (nullable)
```

### `medicos` (estende pessoa)
```python
id: int (PK, autoincrement)
pessoa_id: int (FK → pessoas.id, not null)
crm: str (unique, not null)        # Ex.: "CRM-SP 12345"
especialidade: str (not null)      # Ex.: "Clínica Geral", "Cardiologia"
data_formatura: date (nullable)
```

### `consultas`
```python
id: int (PK, autoincrement)
paciente_id: int (FK → pacientes.id, not null)
medico_id: int (FK → medicos.id, not null)
data: date (not null)
horario: time (not null)
tipo_consulta: str (not null)      # Ex.: "Clínica Geral", "Cardiologia"
convenio: str (nullable)
valor: Numeric(10, 2) (not null)
status: Enum("agendada", "confirmada", "realizada", "cancelada") (default="agendada")
created_at: datetime (default=now)
updated_at: datetime (onupdate=now)
```

### `prontuarios`
```python
id: int (PK, autoincrement)
paciente_id: int (FK → pacientes.id, not null)
medico_id: int (FK → medicos.id, not null)
data: date (not null)
cid: str (not null)                # Ex.: "I10", "J06.9", "M54.5"
diagnostico: Text (not null)
prescricao: Text (not null)
retorno_em_dias: int (default=0)   # 0 = sem retorno previsto
laudo_liberado: bool (default=False)
created_at: datetime (default=now)
updated_at: datetime (onupdate=now)
```

### `lancamentos_financeiros`
```python
id: int (PK, autoincrement)
consulta_id: int (FK → consultas.id, nullable)
paciente_id: int (FK → pacientes.id, not null)
medico_id: int (FK → medicos.id, nullable)
data: date (not null)
servico: str (not null)
convenio: str (nullable)
valor: Numeric(10, 2) (not null)
status: Enum("pago", "pendente", "atrasado") (default="pendente")
forma_pagamento: str (nullable)    # "Convênio", "Cartão de Crédito", "Dinheiro", "Pix"
observacao: str (nullable)
created_at: datetime (default=now)
updated_at: datetime (onupdate=now)
```

### `registros_ponto`
```python
id: int (PK, autoincrement)
usuario_id: int (FK → usuarios.id, not null)
data: date (not null)
entrada: time (nullable)
saida: time (nullable)
h_trabalhadas: Numeric(4, 2) (nullable)   # calculado automaticamente
h_esperadas: Numeric(4, 2) (default=8.0)
diferenca: Numeric(4, 2) (nullable)        # h_trabalhadas - h_esperadas
situacao: Enum("normal", "atraso", "falta", "h_extra") (nullable)
```

### `log_auditoria`
```python
id: int (PK, autoincrement)
data_hora: datetime (default=now, not null)
usuario_id: int (FK → usuarios.id, nullable)    # nullable para login falho
acao: str (not null)                             # "login", "criar", "editar", "excluir", "backup"
modulo: str (not null)                           # "agenda", "prontuario", etc.
ip: str (nullable)
resultado: Enum("sucesso", "falha") (not null)
detalhes: Text (nullable)
```

---

## Regras de Negócio Críticas

Implemente **obrigatoriamente** nos services. Nunca apenas no frontend.

### RN01 — Lançamento Financeiro Automático
Em `consulta_service.py`, no método de atualização de status:
- Quando `status` mudar para `"realizada"`, criar automaticamente um `LancamentoFinanceiro` com:
  - `status = "pendente"`
  - `data = consulta.data`
  - `servico = consulta.tipo_consulta`
  - `valor = consulta.valor`
  - `convenio = consulta.convenio`
  - `paciente_id`, `medico_id` e `consulta_id` vinculados

### RN02 — Bloqueio de Laudo sem Liberação Médica
Em `prontuario_service.py`:
- A rota `/portal/laudos/{id}/download` deve verificar `prontuario.laudo_liberado == True` antes de retornar o arquivo
- Se `laudo_liberado == False`, retornar `HTTP 403 Forbidden`
- A liberação (`PATCH /prontuarios/{id}/liberar-laudo`) é exclusiva do perfil `"medico"`

### RN03 — Cálculo Automático de Horas no Ponto
Em `ponto_service.py`, no registro de saída:
```python
h_trabalhadas = (saida - entrada).seconds / 3600
diferenca = h_trabalhadas - h_esperadas

# Classificação da situação:
if entrada is None and saida is None:
    situacao = "falta"
elif diferenca > 1.0:
    situacao = "h_extra"
elif diferenca < 0:
    situacao = "atraso"
else:
    situacao = "normal"
```

### RN04 — Log de Auditoria Universal
Em `auditoria_service.py`, criar função `registrar_acao(db, usuario_id, acao, modulo, ip, resultado, detalhes)`.
Chamar essa função em **toda** operação: login, logout, criar, editar, excluir, backup.
O log deve ser gerado mesmo em caso de falha — registrando `resultado = "falha"`.

### RN05 — Permissões por Perfil
Em `dependencies/auth.py`, implementar `require_role(*perfis)`:
```python
def require_role(*perfis: str):
    def dependency(current_user: Usuario = Depends(get_current_user)):
        if current_user.perfil not in perfis:
            raise HTTPException(status_code=403, detail="Acesso negado para este perfil")
        return current_user
    return dependency
```

Mapeamento de acesso:
- `gestor` → todos os módulos
- `recepcionista` → agenda, cadastro
- `medico` → agenda, prontuario
- `paciente` → portal (somente laudos liberados)

### RN06 — Lembrete WhatsApp (stub)
Em `consulta_service.py`, quando `status` mudar para `"confirmada"`:
```python
def enviar_lembrete_whatsapp(telefone: str, nome_paciente: str, data: date, horario: time):
    # STUB: Integração futura com WhatsApp Business API
    # Por ora, registrar tentativa no log de auditoria
    print(f"[WHATSAPP STUB] Lembrete para {nome_paciente} ({telefone}) - {data} {horario}")
```

### RN07 — Validação de CPF e CRM
Em `services/` e `repositories/`:
- CPF: único por paciente — verificar antes de `INSERT`
- CRM: único por médico — verificar antes de `INSERT`
- Formato CPF: validar dígitos verificadores (algoritmo padrão)
- Formato CRM: aceitar padrão `"CRM-SP 00000"` ou similar
- Em caso de duplicidade: `HTTP 409 Conflict`

---

## Rotas da API

### Autenticação (`routes/auth.py`)
```
POST /auth/login         → Valida credenciais, seta HttpOnly cookie com JWT
POST /auth/logout        → Limpa o cookie JWT
GET  /auth/me            → Retorna dados do usuário autenticado
```

### Pacientes (`routes/pacientes.py`)
```
GET    /pacientes              → Lista todos (perfis: gestor, recepcionista)
POST   /pacientes              → Cria novo (perfis: gestor, recepcionista)
GET    /pacientes/{id}         → Busca por ID
PATCH  /pacientes/{id}         → Atualiza dados
DELETE /pacientes/{id}         → Soft delete (status = "inativo")
```

### Médicos (`routes/medicos.py`)
```
GET    /medicos                → Lista todos
POST   /medicos                → Cria novo (perfis: gestor)
GET    /medicos/{id}           → Busca por ID
PATCH  /medicos/{id}           → Atualiza dados (perfis: gestor)
```

### Consultas / Agenda (`routes/consultas.py`)
```
GET    /consultas              → Lista com filtros: data, medico_id, status
POST   /consultas              → Cria nova consulta
GET    /consultas/{id}         → Busca por ID
PATCH  /consultas/{id}         → Atualiza status → dispara RN01 e RN06
DELETE /consultas/{id}         → Remove consulta
GET    /consultas/hoje         → Consultas do dia atual (para Dashboard)
```

### Prontuários (`routes/prontuarios.py`)
```
GET    /prontuarios                          → Lista (perfis: gestor, medico)
POST   /prontuarios                          → Cria novo (perfis: medico)
GET    /prontuarios/{id}                     → Busca por ID
PATCH  /prontuarios/{id}                     → Edita (perfis: medico)
PATCH  /prontuarios/{id}/liberar-laudo       → Libera laudo (perfil: medico)
GET    /prontuarios/paciente/{paciente_id}   → Histórico completo do paciente
```

### Financeiro (`routes/financeiro.py`)
```
GET    /financeiro             → Lista lançamentos (perfil: gestor)
GET    /financeiro/indicadores → Retorna: receita_paga, a_receber, atrasado, total_lancado
POST   /financeiro             → Cria lançamento manual
PATCH  /financeiro/{id}        → Atualiza status do lançamento
```

### Folha de Ponto (`routes/ponto.py`)
```
GET    /ponto                  → Lista registros com filtros
POST   /ponto                  → Registra entrada (ou entrada+saída)
GET    /ponto/{id}             → Busca por ID
PATCH  /ponto/{id}             → Atualiza registro → recalcula RN03
GET    /ponto/totais           → Totais do período selecionado
```

### Administrativo (`routes/admin.py`)
```
GET    /admin/usuarios         → Lista usuários (perfil: gestor)
POST   /admin/usuarios         → Cria usuário
PATCH  /admin/usuarios/{id}    → Edita usuário
GET    /admin/log-auditoria    → Lista logs com filtros (perfil: gestor)
GET    /admin/backup           → Trigger de backup manual → registra no log
```

### Portal do Paciente (`routes/portal.py`)
```
GET    /portal/consultas               → Consultas do paciente autenticado
GET    /portal/laudos                  → Prontuários com laudo_liberado = True
GET    /portal/laudos/{id}/download    → Download PDF do laudo (verifica RN02)
```

### Excel — Exportação e Importação (`routes/excel.py`)
```
# Exportação (GET → retorna .xlsx como download)
GET  /excel/export/pacientes
GET  /excel/export/medicos
GET  /excel/export/consultas
GET  /excel/export/prontuarios
GET  /excel/export/financeiro
GET  /excel/export/ponto
GET  /excel/export/usuarios
GET  /excel/export/log-auditoria

# Importação (POST → recebe .xlsx via multipart/form-data)
POST /excel/import/pacientes
POST /excel/import/medicos
POST /excel/import/consultas
POST /excel/import/prontuarios
POST /excel/import/financeiro
POST /excel/import/ponto
POST /excel/import/usuarios
```
Todas as rotas Excel requerem perfil `gestor` e registram no log de auditoria (RN04).

### Dashboard
```
GET  /dashboard/indicadores
```
Retorna JSON:
```json
{
  "total_pacientes": 0,
  "consultas_hoje": 0,
  "receita_mes": 0.00,
  "valores_pendentes": 0.00
}
```

---

## Autenticação e Segurança

### JWT em HttpOnly Cookie
```python
# Em core/security.py
def criar_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# Em routes/auth.py — POST /auth/login
response.set_cookie(
    key="access_token",
    value=token,
    httponly=True,
    secure=False,    # True em produção
    samesite="lax",
    max_age=60 * ACCESS_TOKEN_EXPIRE_MINUTES
)
```

### Dependência `get_current_user`
```python
# Em dependencies/auth.py
async def get_current_user(request: Request, db: Session = Depends(get_db)) -> Usuario:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Não autenticado")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = db.get(Usuario, int(user_id))
    if not user or user.status == "inativo":
        raise HTTPException(status_code=401, detail="Usuário inativo ou não encontrado")
    return user
```

---

## Variáveis de Ambiente

Arquivo `.env.example`:
```
DATABASE_URL=postgresql+psycopg://inovatech:senha@localhost:5432/inovatech_db
JWT_SECRET=troque_por_uma_chave_secreta_longa
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
FRONTEND_URL=http://localhost:5173
```

Em `core/config.py` usar `Pydantic Settings`:
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    frontend_url: str = "http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## Docker Compose

Criar `docker-compose.yml` com três serviços:
1. **postgres** — PostgreSQL 16, porta 5432, volume persistente
2. **backend** — FastAPI + Uvicorn, porta 8000, com hot-reload em dev
3. (frontend será adicionado depois)

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: inovatech
      POSTGRES_PASSWORD: senha
      POSTGRES_DB: inovatech_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: ./backend/.env
    depends_on:
      - postgres
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  postgres_data:
```

---

## Seed de Dados Iniciais

Criar `backend/seed.py` que popula o banco com dados de exemplo consistentes com o protótipo Excel:

**Usuários:**
- Roberto Admin → perfil: gestor, login: roberto
- Ana Lima → perfil: recepcionista, login: ana
- Dr. Carlos Lima → perfil: medico, login: carlos
- Dra. Renata Souza → perfil: medico, login: renata
- Dr. Marcos Teles → perfil: medico, login: marcos

**Pacientes (5):** com CPF, convênio e demais campos

**Médicos (3):** Dr. Carlos Lima (Clínica Geral), Dra. Renata Souza (Cardiologia), Dr. Marcos Teles (Ortopedia)

**Consultas (6):** com diferentes status (agendada, confirmada, realizada, cancelada)

**Prontuários (4):** com CIDs reais: I10, J06.9, M54.5, S82.0

**Lançamentos financeiros (6):** com status Pago, Pendente e Atrasado

**Registros de Ponto (7):** incluindo Normal, H.Extra, Atraso e Falta

**Log de Auditoria (6):** entradas de exemplo

Senha padrão para todos os usuários do seed: `Inovatech@2026`

---

## Excel Service

Em `services/excel_service.py`, implementar:

**Exportação** com `openpyxl`:
```python
def exportar_para_xlsx(dados: list[dict], colunas: list[str]) -> BytesIO:
    # Cria workbook, define cabeçalhos, preenche linhas, retorna BytesIO
```

**Importação** com `pandas`:
```python
def importar_de_xlsx(arquivo: UploadFile, colunas_obrigatorias: list[str]) -> tuple[list[dict], list[str]]:
    # Lê arquivo, valida colunas obrigatórias, retorna (registros_validos, erros)
    # Erros de linha não interrompem as demais linhas
```

A resposta das rotas de exportação deve usar:
```python
return StreamingResponse(
    buffer,
    media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    headers={"Content-Disposition": f"attachment; filename={nome_arquivo}.xlsx"}
)
```

---

## CORS

Em `main.py`, configurar CORS para aceitar requisições do frontend React:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,    # Necessário para cookies
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Requirements.txt

```
fastapi
uvicorn[standard]
sqlalchemy
alembic
psycopg[binary]
pydantic[email]
pydantic-settings
pyjwt
passlib[bcrypt]
python-multipart
openpyxl
pandas
python-dotenv
```

---

## Ordem de Implementação Sugerida

Execute na seguinte ordem para evitar dependências quebradas:

1. `requirements.txt` e `.env.example`
2. `core/config.py` e `core/security.py`
3. `database.py` (engine + session + Base)
4. Todos os `models/` (ordem: usuario → pessoa → paciente → medico → consulta → prontuario → lancamento → ponto → log)
5. Migração inicial com Alembic (`alembic init`, `alembic revision --autogenerate`, `alembic upgrade head`)
6. Todos os `schemas/`
7. Todos os `repositories/`
8. `dependencies/auth.py`
9. Todos os `services/` (ordem: auditoria → auth → paciente → medico → consulta → prontuario → financeiro → ponto → excel)
10. Todos os `routes/`
11. `main.py` (registrar todos os routers, configurar CORS, lifespan)
12. `docker-compose.yml` e `Dockerfile` do backend
13. `seed.py`

---

## Critérios de Qualidade

- Toda rota protegida usa `Depends(get_current_user)` e `require_role(...)`
- Todo repository usa `db: Session = Depends(get_db)` — nunca instancia sessão diretamente
- Todo service chama `auditoria_service.registrar_acao(...)` ao final de cada operação
- Schemas Pydantic separados para `Create`, `Update` e `Response`
- Nunca retornar `password_hash` em nenhum endpoint
- Datas no formato ISO 8601 (`YYYY-MM-DD`) nas respostas JSON
- Erros de validação retornam HTTP 422 com detalhe claro
- Erros de negócio retornam HTTP 409 (conflito), 403 (acesso negado) ou 404 (não encontrado) conforme o caso

---

## Entregável Esperado

Ao final, o backend deve:

1. Iniciar com `docker-compose up` sem erros
2. Ter banco criado e populado com `python seed.py`
3. Responder em `http://localhost:8000`
4. Ter documentação automática em `http://localhost:8000/docs` (Swagger UI)
5. Passar no fluxo completo: login → criar consulta → marcar como realizada → verificar lançamento financeiro criado automaticamente → liberar laudo → acessar portal do paciente → exportar Excel

---

*Projeto: INOVATECH — Sistema de Gestão Clínica · SENAI Mariano Ferraz · 2026*
