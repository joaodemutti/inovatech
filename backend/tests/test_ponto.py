import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.registro_ponto import RegistroPonto


def payload_ponto(usuario_id: int, **kwargs):
    return {
        "usuario_id": usuario_id,
        "data": str(date.today()),
        "entrada": "08:00:00",
        "saida": "17:00:00",
        **kwargs,
    }


@pytest.fixture()
def registro_ponto(db: Session, gestor):
    r = RegistroPonto(
        usuario_id=gestor.id,
        data=date.today(),
        entrada="08:00:00",
        saida="17:00:00",
        h_esperadas=8.0,
    )
    db.add(r)
    db.flush()
    return r


class TestTotaisPonto:
    def test_gestor_acessa(self, gestor_client: TestClient, registro_ponto):
        r = gestor_client.get("/ponto/totais")
        assert r.status_code == 200
        data = r.json()
        assert "total_registros" in data
        assert "total_horas_trabalhadas" in data
        assert "faltas" in data
        assert "atrasos" in data
        assert "horas_extras" in data

    def test_com_filtro_usuario(self, gestor_client: TestClient, gestor, registro_ponto):
        r = gestor_client.get("/ponto/totais", params={"usuario_id": gestor.id})
        assert r.status_code == 200

    def test_com_filtro_data(self, gestor_client: TestClient, registro_ponto):
        r = gestor_client.get("/ponto/totais", params={
            "data_inicio": str(date.today()),
            "data_fim": str(date.today()),
        })
        assert r.status_code == 200

    def test_recepcionista_negado(self, recep_client: TestClient):
        r = recep_client.get("/ponto/totais")
        assert r.status_code == 403


class TestListarPonto:
    def test_autenticado_lista(self, gestor_client: TestClient, registro_ponto):
        r = gestor_client.get("/ponto")
        assert r.status_code == 200
        assert any(p["id"] == registro_ponto.id for p in r.json())

    def test_filtro_usuario(self, gestor_client: TestClient, gestor, registro_ponto):
        r = gestor_client.get("/ponto", params={"usuario_id": gestor.id})
        assert r.status_code == 200

    def test_sem_auth_negado(self, client: TestClient):
        r = client.get("/ponto")
        assert r.status_code == 401


class TestCriarPonto:
    def test_cria_registro(self, gestor_client: TestClient, gestor):
        r = gestor_client.post("/ponto", json=payload_ponto(gestor.id))
        assert r.status_code == 201
        data = r.json()
        assert data["usuario_id"] == gestor.id
        assert data["entrada"] is not None

    def test_so_entrada(self, gestor_client: TestClient, gestor):
        r = gestor_client.post("/ponto", json={
            "usuario_id": gestor.id,
            "data": str(date.today()),
            "entrada": "08:00:00",
        })
        assert r.status_code == 201
        assert r.json()["saida"] is None

    def test_campos_obrigatorios(self, gestor_client: TestClient):
        r = gestor_client.post("/ponto", json={})
        assert r.status_code == 422

    def test_sem_auth_negado(self, client: TestClient):
        r = client.post("/ponto", json={})
        assert r.status_code == 401


class TestObterPonto:
    def test_obter_por_id(self, gestor_client: TestClient, registro_ponto):
        r = gestor_client.get(f"/ponto/{registro_ponto.id}")
        assert r.status_code == 200
        assert r.json()["id"] == registro_ponto.id

    def test_inexistente_404(self, gestor_client: TestClient):
        r = gestor_client.get("/ponto/999999")
        assert r.status_code == 404


class TestAtualizarPonto:
    def test_atualiza_saida(self, gestor_client: TestClient, registro_ponto):
        r = gestor_client.patch(f"/ponto/{registro_ponto.id}", json={"saida": "18:00:00"})
        assert r.status_code == 200

    def test_atualiza_h_esperadas(self, gestor_client: TestClient, registro_ponto):
        r = gestor_client.patch(f"/ponto/{registro_ponto.id}", json={"h_esperadas": 6.0})
        assert r.status_code == 200
