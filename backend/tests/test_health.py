from fastapi.testclient import TestClient


class TestHealth:
    def test_healthcheck(self, client: TestClient):
        r = client.get("/")
        assert r.status_code == 200
        data = r.json()
        assert data["status"] == "ok"
        assert data["app"] == "INOVATECH API"
        assert "version" in data

    def test_healthcheck_sem_auth(self, client: TestClient):
        """Health check é público, não requer autenticação."""
        r = client.get("/")
        assert r.status_code == 200
