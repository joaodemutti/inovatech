import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import criar_token
from tests.conftest import SENHA_PADRAO


class TestLogin:
    def test_login_sucesso(self, client: TestClient, gestor):
        r = client.post("/auth/login", json={"login": gestor.login, "password": SENHA_PADRAO})
        assert r.status_code == 200
        assert r.json()["message"] == "Login realizado com sucesso"
        assert "access_token" in r.cookies

    def test_login_senha_errada(self, client: TestClient, gestor):
        r = client.post("/auth/login", json={"login": gestor.login, "password": "errada"})
        assert r.status_code == 401

    def test_login_usuario_inexistente(self, client: TestClient):
        r = client.post("/auth/login", json={"login": "nao_existe", "password": "qualquer"})
        assert r.status_code == 401

    def test_login_usuario_inativo(self, client: TestClient, db: Session, gestor):
        gestor.status = "inativo"
        db.flush()
        r = client.post("/auth/login", json={"login": gestor.login, "password": SENHA_PADRAO})
        assert r.status_code == 401

    def test_login_campos_obrigatorios(self, client: TestClient):
        r = client.post("/auth/login", json={})
        assert r.status_code == 422


class TestLogout:
    def test_logout_limpa_cookie(self, gestor_client: TestClient):
        r = gestor_client.post("/auth/logout")
        assert r.status_code == 200
        assert r.json()["message"] == "Logout realizado com sucesso"

    def test_logout_sem_autenticacao(self, client: TestClient):
        r = client.post("/auth/logout")
        assert r.status_code == 200  # logout é público


class TestMe:
    def test_me_autenticado(self, gestor_client: TestClient, gestor):
        r = gestor_client.get("/auth/me")
        assert r.status_code == 200
        data = r.json()
        assert data["login"] == gestor.login
        assert data["perfil"] == "gestor"
        assert "password_hash" not in data

    def test_me_sem_token(self, client: TestClient):
        r = client.get("/auth/me")
        assert r.status_code == 401

    def test_me_token_invalido(self, client: TestClient):
        client.cookies.set("access_token", "token_invalido")
        r = client.get("/auth/me")
        assert r.status_code == 401

    def test_me_token_usuario_inativo(self, client: TestClient, db: Session, gestor):
        gestor.status = "inativo"
        db.flush()
        token = criar_token({"sub": gestor.id})
        client.cookies.set("access_token", token)
        r = client.get("/auth/me")
        assert r.status_code == 401
