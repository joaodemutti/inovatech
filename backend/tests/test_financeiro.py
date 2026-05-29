import pytest
from datetime import date
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.lancamento_financeiro import LancamentoFinanceiro


def payload_lancamento(paciente_id: int, **kwargs):
    return {
        "paciente_id": paciente_id,
        "data": str(date.today()),
        "servico": "Consulta Geral",
        "valor": 250.00,
        "forma_pagamento": "PIX",
        **kwargs,
    }


@pytest.fixture()
def lancamento(db: Session, paciente):
    l = LancamentoFinanceiro(
        paciente_id=paciente.id,
        data=date.today(),
        servico="Consulta",
        valor=300.00,
        status="pendente",
    )
    db.add(l)
    db.flush()
    return l


class TestIndicadores:
    def test_gestor_acessa(self, gestor_client: TestClient, lancamento):
        r = gestor_client.get("/financeiro/indicadores")
        assert r.status_code == 200
        data = r.json()
        assert "receita_paga" in data
        assert "a_receber" in data
        assert "atrasado" in data
        assert "total_lancado" in data

    def test_recepcionista_negado(self, recep_client: TestClient):
        r = recep_client.get("/financeiro/indicadores")
        assert r.status_code == 403

    def test_sem_auth_negado(self, client: TestClient):
        r = client.get("/financeiro/indicadores")
        assert r.status_code == 401


class TestListarLancamentos:
    def test_gestor_lista(self, gestor_client: TestClient, lancamento):
        r = gestor_client.get("/financeiro")
        assert r.status_code == 200
        assert any(l["id"] == lancamento.id for l in r.json())

    def test_paginacao(self, gestor_client: TestClient):
        r = gestor_client.get("/financeiro", params={"skip": 0, "limit": 5})
        assert r.status_code == 200
        assert len(r.json()) <= 5

    def test_recepcionista_negado(self, recep_client: TestClient):
        r = recep_client.get("/financeiro")
        assert r.status_code == 403


class TestCriarLancamento:
    def test_gestor_cria(self, gestor_client: TestClient, paciente):
        r = gestor_client.post("/financeiro", json=payload_lancamento(paciente.id))
        assert r.status_code == 201
        data = r.json()
        assert data["servico"] == "Consulta Geral"
        assert data["status"] == "pendente"
        assert float(data["valor"]) == 250.00

    def test_cria_com_convenio(self, gestor_client: TestClient, paciente):
        r = gestor_client.post("/financeiro", json=payload_lancamento(
            paciente.id, convenio="Unimed"
        ))
        assert r.status_code == 201
        assert r.json()["convenio"] == "Unimed"

    def test_campos_obrigatorios(self, gestor_client: TestClient):
        r = gestor_client.post("/financeiro", json={})
        assert r.status_code == 422

    def test_recepcionista_negado(self, recep_client: TestClient, paciente):
        r = recep_client.post("/financeiro", json=payload_lancamento(paciente.id))
        assert r.status_code == 403


class TestAtualizarLancamento:
    def test_gestor_muda_status_pago(self, gestor_client: TestClient, lancamento):
        r = gestor_client.patch(f"/financeiro/{lancamento.id}", json={"status": "pago"})
        assert r.status_code == 200
        assert r.json()["status"] == "pago"

    def test_gestor_muda_forma_pagamento(self, gestor_client: TestClient, lancamento):
        r = gestor_client.patch(f"/financeiro/{lancamento.id}", json={"forma_pagamento": "Dinheiro"})
        assert r.status_code == 200
        assert r.json()["forma_pagamento"] == "Dinheiro"

    def test_atualiza_valor(self, gestor_client: TestClient, lancamento):
        r = gestor_client.patch(f"/financeiro/{lancamento.id}", json={"valor": 199.99})
        assert r.status_code == 200
        assert float(r.json()["valor"]) == 199.99

    def test_recepcionista_negado(self, recep_client: TestClient, lancamento):
        r = recep_client.patch(f"/financeiro/{lancamento.id}", json={"status": "pago"})
        assert r.status_code == 403

    def test_inexistente_404(self, gestor_client: TestClient):
        r = gestor_client.patch("/financeiro/999999", json={"status": "pago"})
        assert r.status_code == 404
