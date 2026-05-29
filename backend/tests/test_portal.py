import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.consulta import Consulta
from app.models.prontuario import Prontuario
from app.core.security import criar_token


@pytest.fixture()
def paciente_vinculado(db: Session, paciente_user, paciente):
    """
    Vincula o usuário paciente à entidade Paciente pelo mesmo ID.
    No sistema real o usuário e o paciente são entidades separadas;
    aqui forçamos o sub do token a ser o ID do usuário paciente.
    """
    return paciente_user, paciente


@pytest.fixture()
def paciente_auth_client(client: TestClient, paciente_user):
    token = criar_token({"sub": paciente_user.id})
    client.cookies.set("access_token", token)
    return client


@pytest.fixture()
def consulta_paciente(db: Session, paciente, medico):
    from datetime import time as dtime
    c = Consulta(
        paciente_id=paciente.id,
        medico_id=medico.id,
        data=date.today(),
        horario=dtime(14, 0),
        tipo_consulta="Retorno",
        valor=100.00,
        status="confirmada",
    )
    db.add(c)
    db.flush()
    return c


@pytest.fixture()
def laudo_liberado(db: Session, paciente, medico):
    p = Prontuario(
        paciente_id=paciente.id,
        medico_id=medico.id,
        data=date.today(),
        cid="K21",
        diagnostico="Refluxo gastroesofágico",
        prescricao="Omeprazol 20mg",
        retorno_em_dias=60,
        laudo_liberado=True,
    )
    db.add(p)
    db.flush()
    return p


class TestPortalConsultas:
    def test_paciente_ve_consultas(self, paciente_auth_client: TestClient):
        r = paciente_auth_client.get("/portal/consultas")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_gestor_negado(self, gestor_client: TestClient):
        r = gestor_client.get("/portal/consultas")
        assert r.status_code == 403

    def test_medico_negado(self, medico_client: TestClient):
        r = medico_client.get("/portal/consultas")
        assert r.status_code == 403

    def test_sem_auth_negado(self, client: TestClient):
        r = client.get("/portal/consultas")
        assert r.status_code == 401


class TestPortalLaudos:
    def test_paciente_ve_laudos_liberados(self, paciente_auth_client: TestClient, laudo_liberado):
        r = paciente_auth_client.get("/portal/laudos")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        # Todos laudos retornados devem estar liberados
        for laudo in r.json():
            assert laudo["laudo_liberado"] is True

    def test_gestor_negado(self, gestor_client: TestClient):
        r = gestor_client.get("/portal/laudos")
        assert r.status_code == 403

    def test_sem_auth_negado(self, client: TestClient):
        r = client.get("/portal/laudos")
        assert r.status_code == 401


class TestPortalDownloadLaudo:
    def test_paciente_baixa_laudo_liberado(self, paciente_auth_client: TestClient, laudo_liberado):
        r = paciente_auth_client.get(f"/portal/laudos/{laudo_liberado.id}/download")
        assert r.status_code == 200
        data = r.json()
        assert "diagnostico" in data
        assert "prescricao" in data
        assert data["laudo_liberado"] is True

    def test_laudo_nao_liberado_negado(self, paciente_auth_client: TestClient, db: Session, paciente, medico):
        nao_liberado = Prontuario(
            paciente_id=paciente.id,
            medico_id=medico.id,
            data=date.today(),
            cid="X00",
            diagnostico="X",
            prescricao="X",
            laudo_liberado=False,
        )
        db.add(nao_liberado)
        db.flush()
        r = paciente_auth_client.get(f"/portal/laudos/{nao_liberado.id}/download")
        assert r.status_code in (403, 404)

    def test_gestor_negado(self, gestor_client: TestClient, laudo_liberado):
        r = gestor_client.get(f"/portal/laudos/{laudo_liberado.id}/download")
        assert r.status_code == 403
