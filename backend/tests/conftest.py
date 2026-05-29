"""
Fixtures globais para todos os testes.

Banco de dados de teste isolado: cada teste roda dentro de uma transação
que é revertida ao final — garantindo isolamento sem custo de recriar tabelas.

Pré-requisito:
  CREATE DATABASE inovatech_test OWNER inovatech;
"""

import os
import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from app.main import app
from app.database import get_db, Base
from app.models.usuario import Usuario
from app.models.pessoa import Pessoa
from app.models.paciente import Paciente
from app.models.medico import Medico
from app.models.consulta import Consulta
from app.core.security import criar_hash_senha, criar_token

# ── Banco de teste ────────────────────────────────────────────────────────────

TEST_DB_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg://inovatech:senha@localhost:5432/inovatech_test",
)

_engine = create_engine(TEST_DB_URL, echo=False)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    Base.metadata.create_all(_engine)
    yield
    Base.metadata.drop_all(_engine)


@pytest.fixture()
def db():
    """Sessão isolada via savepoint — revertida após cada teste."""
    connection = _engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection, autoflush=False)()

    # Emulate nested transactions so rollback inside the app doesn't break isolation
    session.begin_nested()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db: Session):
    """TestClient com override do get_db apontando para a sessão isolada."""
    def _override():
        yield db

    app.dependency_overrides[get_db] = _override
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()


# ── Helpers de criação de entidades ──────────────────────────────────────────

SENHA_PADRAO = "Inovatech@2026"


def _make_usuario(db: Session, perfil: str, login: str, email: str) -> Usuario:
    u = Usuario(
        nome=f"Teste {perfil.capitalize()}",
        perfil=perfil,
        login=login,
        email=email,
        password_hash=criar_hash_senha(SENHA_PADRAO),
        status="ativo",
    )
    db.add(u)
    db.flush()
    return u


def _make_pessoa(db: Session, tipo: str, cpf: str, nome: str) -> Pessoa:
    p = Pessoa(
        nome_completo=nome,
        cpf=cpf,
        telefone="11999990000",
        email=f"{cpf}@test.com",
        status="ativo",
        tipo=tipo,
    )
    db.add(p)
    db.flush()
    return p


# ── Fixtures de usuários por perfil ──────────────────────────────────────────

@pytest.fixture()
def gestor(db: Session) -> Usuario:
    return _make_usuario(db, "gestor", "test_gestor", "gestor@test.com")


@pytest.fixture()
def recepcionista(db: Session) -> Usuario:
    return _make_usuario(db, "recepcionista", "test_recep", "recep@test.com")


@pytest.fixture()
def medico_user(db: Session) -> Usuario:
    return _make_usuario(db, "medico", "test_medico", "medico@test.com")


@pytest.fixture()
def paciente_user(db: Session) -> Usuario:
    return _make_usuario(db, "paciente", "test_paciente", "paciente@test.com")


# ── Fixtures de cookies autenticados ─────────────────────────────────────────

def _auth_client(client: TestClient, user: Usuario) -> TestClient:
    token = criar_token({"sub": user.id})
    client.cookies.set("access_token", token)
    return client


@pytest.fixture()
def gestor_client(client: TestClient, gestor: Usuario) -> TestClient:
    return _auth_client(client, gestor)


@pytest.fixture()
def recep_client(client: TestClient, recepcionista: Usuario) -> TestClient:
    return _auth_client(client, recepcionista)


@pytest.fixture()
def medico_client(client: TestClient, medico_user: Usuario) -> TestClient:
    return _auth_client(client, medico_user)


@pytest.fixture()
def paciente_client(client: TestClient, paciente_user: Usuario) -> TestClient:
    return _auth_client(client, paciente_user)


# ── Fixtures de entidades de domínio ─────────────────────────────────────────

@pytest.fixture()
def pessoa_paciente(db: Session) -> Pessoa:
    return _make_pessoa(db, "paciente", "11111111111", "Maria Teste")


@pytest.fixture()
def paciente(db: Session, pessoa_paciente: Pessoa) -> Paciente:
    p = Paciente(
        pessoa_id=pessoa_paciente.id,
        data_nascimento=date(1990, 5, 15),
        convenio="Unimed",
        endereco="Rua Teste, 123",
    )
    db.add(p)
    db.flush()
    return p


@pytest.fixture()
def pessoa_medico(db: Session) -> Pessoa:
    return _make_pessoa(db, "medico", "22222222222", "Dr. Carlos Teste")


@pytest.fixture()
def medico(db: Session, pessoa_medico: Pessoa) -> Medico:
    m = Medico(
        pessoa_id=pessoa_medico.id,
        crm="CRM12345SP",
        especialidade="Clínica Geral",
        data_formatura=date(2005, 12, 1),
    )
    db.add(m)
    db.flush()
    return m


@pytest.fixture()
def consulta(db: Session, paciente: Paciente, medico: Medico) -> Consulta:
    from datetime import time
    c = Consulta(
        paciente_id=paciente.id,
        medico_id=medico.id,
        data=date.today(),
        horario=time(9, 0),
        tipo_consulta="Consulta",
        valor=150.00,
        status="agendada",
    )
    db.add(c)
    db.flush()
    return c
