import pytest
from fastapi.testclient import TestClient


class TestListarUsuarios:
    def test_gestor_lista_usuarios(self, gestor_client: TestClient, gestor):
        r = gestor_client.get("/usuarios")
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert any(u["login"] == gestor.login for u in r.json())

    def test_recepcionista_nao_acessa(self, recep_client: TestClient):
        r = recep_client.get("/usuarios")
        assert r.status_code == 403

    def test_sem_auth_nao_acessa(self, client: TestClient):
        r = client.get("/usuarios")
        assert r.status_code == 401


class TestCriarUsuario:
    def test_gestor_cria_usuario(self, gestor_client: TestClient):
        payload = {
            "nome": "Novo Usuario",
            "perfil": "recepcionista",
            "login": "novo_user_x1",
            "email": "novo_x1@test.com",
            "password": "Senha@123",
        }
        r = gestor_client.post("/usuarios", json=payload)
        assert r.status_code == 201
        data = r.json()
        assert data["login"] == "novo_user_x1"
        assert data["perfil"] == "recepcionista"
        assert "password_hash" not in data

    def test_login_duplicado_retorna_409(self, gestor_client: TestClient, gestor):
        payload = {
            "nome": "Duplicado",
            "perfil": "recepcionista",
            "login": gestor.login,
            "email": "outro@test.com",
            "password": "Senha@123",
        }
        r = gestor_client.post("/usuarios", json=payload)
        assert r.status_code == 409

    def test_email_duplicado_retorna_409(self, gestor_client: TestClient, gestor):
        payload = {
            "nome": "Duplicado",
            "perfil": "recepcionista",
            "login": "outro_login_x2",
            "email": gestor.email,
            "password": "Senha@123",
        }
        r = gestor_client.post("/usuarios", json=payload)
        assert r.status_code == 409

    def test_recepcionista_nao_pode_criar(self, recep_client: TestClient):
        r = recep_client.post("/usuarios", json={
            "nome": "X", "perfil": "gestor",
            "login": "x_test", "email": "x@test.com", "password": "X"
        })
        assert r.status_code == 403

    def test_campos_obrigatorios(self, gestor_client: TestClient):
        r = gestor_client.post("/usuarios", json={})
        assert r.status_code == 422


class TestAtualizarUsuario:
    def test_gestor_atualiza_nome(self, gestor_client: TestClient, recepcionista):
        r = gestor_client.patch(f"/usuarios/{recepcionista.id}", json={"nome": "Nome Atualizado"})
        assert r.status_code == 200
        assert r.json()["nome"] == "Nome Atualizado"

    def test_gestor_desativa_usuario(self, gestor_client: TestClient, recepcionista):
        r = gestor_client.patch(f"/usuarios/{recepcionista.id}", json={"status": "inativo"})
        assert r.status_code == 200
        assert r.json()["status"] == "inativo"

    def test_usuario_inexistente_retorna_404(self, gestor_client: TestClient):
        r = gestor_client.patch("/usuarios/999999", json={"nome": "X"})
        assert r.status_code == 404
