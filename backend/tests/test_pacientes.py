import pytest
from fastapi.testclient import TestClient


PAYLOAD_BASE = {
    "nome_completo": "João da Silva",
    "cpf": "33333333333",
    "telefone": "11988887777",
    "email": "joao@test.com",
    "convenio": "Unimed",
}


class TestListarPacientes:
    def test_gestor_lista(self, gestor_client: TestClient, paciente):
        r = gestor_client.get("/pacientes")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert len(r.json()) >= 1

    def test_medico_lista(self, medico_client: TestClient):
        r = medico_client.get("/pacientes")
        assert r.status_code == 200

    def test_recepcionista_lista(self, recep_client: TestClient):
        r = recep_client.get("/pacientes")
        assert r.status_code == 200

    def test_sem_auth_negado(self, client: TestClient):
        r = client.get("/pacientes")
        assert r.status_code == 401


class TestCriarPaciente:
    def test_gestor_cria(self, gestor_client: TestClient):
        r = gestor_client.post("/pacientes", json=PAYLOAD_BASE)
        assert r.status_code == 201
        data = r.json()
        assert data["nome_completo"] == PAYLOAD_BASE["nome_completo"]
        assert data["cpf"] == PAYLOAD_BASE["cpf"]
        assert data["status"] == "ativo"

    def test_recepcionista_cria(self, recep_client: TestClient):
        payload = {**PAYLOAD_BASE, "cpf": "44444444444"}
        r = recep_client.post("/pacientes", json=payload)
        assert r.status_code == 201

    def test_cpf_duplicado_retorna_409(self, gestor_client: TestClient, paciente):
        payload = {**PAYLOAD_BASE, "cpf": paciente.pessoa.cpf}
        r = gestor_client.post("/pacientes", json=payload)
        assert r.status_code == 409

    def test_medico_nao_pode_criar(self, medico_client: TestClient):
        r = medico_client.post("/pacientes", json={**PAYLOAD_BASE, "cpf": "55555555555"})
        assert r.status_code == 403

    def test_campos_obrigatorios(self, gestor_client: TestClient):
        r = gestor_client.post("/pacientes", json={})
        assert r.status_code == 422


class TestObterPaciente:
    def test_obter_por_id(self, gestor_client: TestClient, paciente):
        r = gestor_client.get(f"/pacientes/{paciente.id}")
        assert r.status_code == 200
        assert r.json()["id"] == paciente.id

    def test_paciente_inexistente_404(self, gestor_client: TestClient):
        r = gestor_client.get("/pacientes/999999")
        assert r.status_code == 404

    def test_retorna_campos_esperados(self, gestor_client: TestClient, paciente):
        r = gestor_client.get(f"/pacientes/{paciente.id}")
        data = r.json()
        assert "nome_completo" in data
        assert "cpf" in data
        assert "status" in data
        assert "convenio" in data


class TestAtualizarPaciente:
    def test_atualiza_telefone(self, gestor_client: TestClient, paciente):
        r = gestor_client.patch(f"/pacientes/{paciente.id}", json={"telefone": "11000000000"})
        assert r.status_code == 200
        assert r.json()["telefone"] == "11000000000"

    def test_atualiza_convenio(self, gestor_client: TestClient, paciente):
        r = gestor_client.patch(f"/pacientes/{paciente.id}", json={"convenio": "Bradesco"})
        assert r.status_code == 200
        assert r.json()["convenio"] == "Bradesco"

    def test_desativa_paciente(self, gestor_client: TestClient, paciente):
        r = gestor_client.patch(f"/pacientes/{paciente.id}", json={"status": "inativo"})
        assert r.status_code == 200
        assert r.json()["status"] == "inativo"


class TestDeletarPaciente:
    def test_soft_delete(self, gestor_client: TestClient, paciente):
        r = gestor_client.delete(f"/pacientes/{paciente.id}")
        assert r.status_code == 204
        # Confirma soft delete: still listable but status=inativo
        r2 = gestor_client.get(f"/pacientes/{paciente.id}")
        assert r2.json()["status"] == "inativo"

    def test_medico_nao_pode_deletar(self, medico_client: TestClient, paciente):
        r = medico_client.delete(f"/pacientes/{paciente.id}")
        assert r.status_code == 403
