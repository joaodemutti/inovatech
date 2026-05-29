import pytest
from fastapi.testclient import TestClient


PAYLOAD_BASE = {
    "nome_completo": "Dra. Ana Lima",
    "cpf": "66666666666",
    "crm": "CRM99999SP",
    "especialidade": "Pediatria",
    "telefone": "11977776666",
    "email": "ana@medico.com",
}


class TestListarMedicos:
    def test_qualquer_autenticado_lista(self, gestor_client, medico_client, recep_client):
        for c in (gestor_client, medico_client, recep_client):
            r = c.get("/medicos")
            assert r.status_code == 200

    def test_sem_auth_negado(self, client: TestClient):
        r = client.get("/medicos")
        assert r.status_code == 401

    def test_lista_com_medico_criado(self, gestor_client: TestClient, medico):
        r = gestor_client.get("/medicos")
        ids = [m["id"] for m in r.json()]
        assert medico.id in ids


class TestCriarMedico:
    def test_gestor_cria(self, gestor_client: TestClient):
        r = gestor_client.post("/medicos", json=PAYLOAD_BASE)
        assert r.status_code == 201
        data = r.json()
        assert data["crm"] == PAYLOAD_BASE["crm"]
        assert data["especialidade"] == PAYLOAD_BASE["especialidade"]

    def test_crm_duplicado_409(self, gestor_client: TestClient, medico):
        payload = {**PAYLOAD_BASE, "cpf": "77777777777", "crm": medico.crm}
        r = gestor_client.post("/medicos", json=payload)
        assert r.status_code == 409

    def test_cpf_duplicado_409(self, gestor_client: TestClient, medico):
        payload = {**PAYLOAD_BASE, "cpf": medico.pessoa.cpf, "crm": "CRMZZZZ"}
        r = gestor_client.post("/medicos", json=payload)
        assert r.status_code == 409

    def test_recepcionista_nao_pode_criar(self, recep_client: TestClient):
        payload = {**PAYLOAD_BASE, "cpf": "88888888888", "crm": "CRMYYY"}
        r = recep_client.post("/medicos", json=payload)
        assert r.status_code == 403

    def test_campos_obrigatorios(self, gestor_client: TestClient):
        r = gestor_client.post("/medicos", json={})
        assert r.status_code == 422


class TestObterMedico:
    def test_obter_por_id(self, gestor_client: TestClient, medico):
        r = gestor_client.get(f"/medicos/{medico.id}")
        assert r.status_code == 200
        assert r.json()["crm"] == medico.crm

    def test_inexistente_404(self, gestor_client: TestClient):
        r = gestor_client.get("/medicos/999999")
        assert r.status_code == 404


class TestAtualizarMedico:
    def test_gestor_atualiza_especialidade(self, gestor_client: TestClient, medico):
        r = gestor_client.patch(f"/medicos/{medico.id}", json={"especialidade": "Ortopedia"})
        assert r.status_code == 200
        assert r.json()["especialidade"] == "Ortopedia"

    def test_gestor_desativa_medico(self, gestor_client: TestClient, medico):
        r = gestor_client.patch(f"/medicos/{medico.id}", json={"status": "inativo"})
        assert r.status_code == 200
        assert r.json()["status"] == "inativo"

    def test_recepcionista_nao_pode_atualizar(self, recep_client: TestClient, medico):
        r = recep_client.patch(f"/medicos/{medico.id}", json={"especialidade": "X"})
        assert r.status_code == 403
