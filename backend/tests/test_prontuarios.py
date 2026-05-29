import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.prontuario import Prontuario


def payload_prontuario(paciente_id: int, medico_id: int):
    return {
        "paciente_id": paciente_id,
        "medico_id": medico_id,
        "data": str(date.today()),
        "cid": "J00",
        "diagnostico": "Resfriado comum com sintomas leves",
        "prescricao": "Repouso e hidratação por 3 dias",
        "retorno_em_dias": 7,
    }


@pytest.fixture()
def prontuario(db: Session, paciente, medico):
    p = Prontuario(
        paciente_id=paciente.id,
        medico_id=medico.id,
        data=date.today(),
        cid="M54",
        diagnostico="Lombalgia crônica",
        prescricao="Anti-inflamatório por 5 dias",
        retorno_em_dias=30,
        laudo_liberado=False,
    )
    db.add(p)
    db.flush()
    return p


class TestListarProntuarios:
    def test_gestor_lista(self, gestor_client: TestClient, prontuario):
        r = gestor_client.get("/prontuarios")
        assert r.status_code == 200
        assert any(p["id"] == prontuario.id for p in r.json())

    def test_medico_lista(self, medico_client: TestClient):
        r = medico_client.get("/prontuarios")
        assert r.status_code == 200

    def test_recepcionista_negado(self, recep_client: TestClient):
        r = recep_client.get("/prontuarios")
        assert r.status_code == 403

    def test_sem_auth_negado(self, client: TestClient):
        r = client.get("/prontuarios")
        assert r.status_code == 401


class TestCriarProntuario:
    def test_medico_cria(self, medico_client: TestClient, paciente, medico):
        r = medico_client.post("/prontuarios", json=payload_prontuario(paciente.id, medico.id))
        assert r.status_code == 201
        data = r.json()
        assert data["cid"] == "J00"
        assert data["laudo_liberado"] is False

    def test_gestor_nao_pode_criar(self, gestor_client: TestClient, paciente, medico):
        r = gestor_client.post("/prontuarios", json=payload_prontuario(paciente.id, medico.id))
        assert r.status_code == 403

    def test_campos_obrigatorios(self, medico_client: TestClient):
        r = medico_client.post("/prontuarios", json={})
        assert r.status_code == 422


class TestObterProntuario:
    def test_obter_por_id(self, gestor_client: TestClient, prontuario):
        r = gestor_client.get(f"/prontuarios/{prontuario.id}")
        assert r.status_code == 200
        assert r.json()["id"] == prontuario.id

    def test_por_paciente(self, gestor_client: TestClient, prontuario, paciente):
        r = gestor_client.get(f"/prontuarios/paciente/{paciente.id}")
        assert r.status_code == 200
        assert any(p["id"] == prontuario.id for p in r.json())

    def test_inexistente_404(self, gestor_client: TestClient):
        r = gestor_client.get("/prontuarios/999999")
        assert r.status_code == 404


class TestAtualizarProntuario:
    def test_medico_atualiza_diagnostico(self, medico_client: TestClient, prontuario):
        r = medico_client.patch(f"/prontuarios/{prontuario.id}", json={"diagnostico": "Atualizado"})
        assert r.status_code == 200
        assert r.json()["diagnostico"] == "Atualizado"

    def test_gestor_nao_pode_atualizar(self, gestor_client: TestClient, prontuario):
        r = gestor_client.patch(f"/prontuarios/{prontuario.id}", json={"diagnostico": "X"})
        assert r.status_code == 403


class TestLiberarLaudo:
    def test_medico_libera(self, medico_client: TestClient, prontuario):
        r = medico_client.patch(f"/prontuarios/{prontuario.id}/liberar-laudo")
        assert r.status_code == 200
        assert r.json()["laudo_liberado"] is True

    def test_gestor_nao_pode_liberar(self, gestor_client: TestClient, prontuario):
        r = gestor_client.patch(f"/prontuarios/{prontuario.id}/liberar-laudo")
        assert r.status_code == 403
