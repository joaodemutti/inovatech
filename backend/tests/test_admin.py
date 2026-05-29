from fastapi.testclient import TestClient


class TestLogAuditoria:
    def test_gestor_lista_logs(self, gestor_client: TestClient):
        r = gestor_client.get("/admin/log-auditoria")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_filtro_modulo(self, gestor_client: TestClient):
        r = gestor_client.get("/admin/log-auditoria", params={"modulo": "auth"})
        assert r.status_code == 200

    def test_filtro_resultado(self, gestor_client: TestClient):
        r = gestor_client.get("/admin/log-auditoria", params={"resultado": "sucesso"})
        assert r.status_code == 200
        for log in r.json():
            assert log["resultado"] == "sucesso"

    def test_filtro_usuario(self, gestor_client: TestClient, gestor):
        r = gestor_client.get("/admin/log-auditoria", params={"usuario_id": gestor.id})
        assert r.status_code == 200

    def test_paginacao(self, gestor_client: TestClient):
        r = gestor_client.get("/admin/log-auditoria", params={"skip": 0, "limit": 10})
        assert r.status_code == 200
        assert len(r.json()) <= 10

    def test_campos_esperados(self, gestor_client: TestClient):
        r = gestor_client.get("/admin/log-auditoria")
        if r.json():
            log = r.json()[0]
            assert "data_hora" in log
            assert "acao" in log
            assert "modulo" in log
            assert "resultado" in log

    def test_recepcionista_negado(self, recep_client: TestClient):
        r = recep_client.get("/admin/log-auditoria")
        assert r.status_code == 403

    def test_medico_negado(self, medico_client: TestClient):
        r = medico_client.get("/admin/log-auditoria")
        assert r.status_code == 403

    def test_sem_auth_negado(self, client: TestClient):
        r = client.get("/admin/log-auditoria")
        assert r.status_code == 401


class TestBackup:
    def test_gestor_registra_backup(self, gestor_client: TestClient):
        r = gestor_client.get("/admin/backup")
        assert r.status_code == 200
        assert "message" in r.json()

    def test_recepcionista_negado(self, recep_client: TestClient):
        r = recep_client.get("/admin/backup")
        assert r.status_code == 403
