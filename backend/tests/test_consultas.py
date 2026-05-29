import pytest
from datetime import date, time
from fastapi.testclient import TestClient


def payload_consulta(paciente_id: int, medico_id: int, **kwargs):
    return {
        "paciente_id": paciente_id,
        "medico_id": medico_id,
        "data": str(date.today()),
        "horario": "10:00:00",
        "tipo_consulta": "Consulta",
        "valor": 200.00,
        **kwargs,
    }


class TestConsultasHoje:
    def test_retorna_lista(self, gestor_client: TestClient, consulta):
        r = gestor_client.get("/consultas/hoje")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        ids = [c["id"] for c in r.json()]
        assert consulta.id in ids

    def test_sem_auth_negado(self, client: TestClient):
        r = client.get("/consultas/hoje")
        assert r.status_code == 401


class TestListarConsultas:
    def test_lista_com_filtro_data(self, gestor_client: TestClient, consulta):
        r = gestor_client.get("/consultas", params={"data": str(date.today())})
        assert r.status_code == 200
        assert any(c["id"] == consulta.id for c in r.json())

    def test_lista_com_filtro_status(self, gestor_client: TestClient, consulta):
        r = gestor_client.get("/consultas", params={"status": "agendada"})
        assert r.status_code == 200

    def test_lista_com_filtro_medico(self, gestor_client: TestClient, consulta, medico):
        r = gestor_client.get("/consultas", params={"medico_id": medico.id})
        assert r.status_code == 200

    def test_paginacao(self, gestor_client: TestClient):
        r = gestor_client.get("/consultas", params={"skip": 0, "limit": 5})
        assert r.status_code == 200
        assert len(r.json()) <= 5


class TestCriarConsulta:
    def test_cria_consulta(self, gestor_client: TestClient, paciente, medico):
        r = gestor_client.post("/consultas", json=payload_consulta(paciente.id, medico.id))
        assert r.status_code == 201
        data = r.json()
        assert data["status"] == "agendada"
        assert data["paciente_id"] == paciente.id
        assert data["medico_id"] == medico.id

    def test_cria_com_convenio(self, gestor_client: TestClient, paciente, medico):
        r = gestor_client.post("/consultas", json=payload_consulta(
            paciente.id, medico.id, convenio="Unimed"
        ))
        assert r.status_code == 201
        assert r.json()["convenio"] == "Unimed"

    def test_campos_obrigatorios(self, gestor_client: TestClient):
        r = gestor_client.post("/consultas", json={})
        assert r.status_code == 422

    def test_sem_auth_negado(self, client: TestClient):
        r = client.post("/consultas", json={})
        assert r.status_code == 401


class TestObterConsulta:
    def test_obter_por_id(self, gestor_client: TestClient, consulta):
        r = gestor_client.get(f"/consultas/{consulta.id}")
        assert r.status_code == 200
        assert r.json()["id"] == consulta.id

    def test_inexistente_404(self, gestor_client: TestClient):
        r = gestor_client.get("/consultas/999999")
        assert r.status_code == 404


class TestAtualizarConsulta:
    def test_atualiza_status(self, gestor_client: TestClient, consulta):
        r = gestor_client.patch(f"/consultas/{consulta.id}", json={"status": "confirmada"})
        assert r.status_code == 200
        assert r.json()["status"] == "confirmada"

    def test_atualiza_valor(self, gestor_client: TestClient, consulta):
        r = gestor_client.patch(f"/consultas/{consulta.id}", json={"valor": 350.00})
        assert r.status_code == 200
        assert float(r.json()["valor"]) == 350.00

    def test_cancela_consulta(self, gestor_client: TestClient, consulta):
        r = gestor_client.patch(f"/consultas/{consulta.id}", json={"status": "cancelada"})
        assert r.status_code == 200
        assert r.json()["status"] == "cancelada"


class TestDeletarConsulta:
    def test_gestor_deleta(self, gestor_client: TestClient, consulta):
        r = gestor_client.delete(f"/consultas/{consulta.id}")
        assert r.status_code == 204

    def test_recepcionista_deleta(self, recep_client: TestClient, consulta):
        r = recep_client.delete(f"/consultas/{consulta.id}")
        assert r.status_code == 204

    def test_medico_nao_pode_deletar(self, medico_client: TestClient, consulta):
        r = medico_client.delete(f"/consultas/{consulta.id}")
        assert r.status_code == 403

    def test_inexistente_404(self, gestor_client: TestClient):
        r = gestor_client.delete("/consultas/999999")
        assert r.status_code == 404
