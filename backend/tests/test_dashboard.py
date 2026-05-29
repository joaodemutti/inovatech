from fastapi.testclient import TestClient


class TestDashboard:
    def test_indicadores_autenticado(self, gestor_client: TestClient):
        r = gestor_client.get("/dashboard/indicadores")
        assert r.status_code == 200
        data = r.json()
        assert "total_pacientes" in data
        assert "consultas_hoje" in data
        assert "receita_mes" in data
        assert "valores_pendentes" in data

    def test_valores_sao_numericos(self, gestor_client: TestClient):
        r = gestor_client.get("/dashboard/indicadores")
        data = r.json()
        assert isinstance(data["total_pacientes"], int)
        assert isinstance(data["consultas_hoje"], int)
        assert isinstance(data["receita_mes"], (int, float))
        assert isinstance(data["valores_pendentes"], (int, float))

    def test_medico_acessa(self, medico_client: TestClient):
        r = medico_client.get("/dashboard/indicadores")
        assert r.status_code == 200

    def test_recepcionista_acessa(self, recep_client: TestClient):
        r = recep_client.get("/dashboard/indicadores")
        assert r.status_code == 200

    def test_sem_auth_negado(self, client: TestClient):
        r = client.get("/dashboard/indicadores")
        assert r.status_code == 401

    def test_consultas_hoje_reflete_dados(self, gestor_client: TestClient, consulta):
        r = gestor_client.get("/dashboard/indicadores")
        assert r.json()["consultas_hoje"] >= 1

    def test_total_pacientes_reflete_dados(self, gestor_client: TestClient, paciente):
        r = gestor_client.get("/dashboard/indicadores")
        assert r.json()["total_pacientes"] >= 1
