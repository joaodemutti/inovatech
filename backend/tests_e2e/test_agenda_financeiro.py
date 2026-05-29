from __future__ import annotations

from decimal import Decimal

import httpx

from tests_e2e.helpers import (
    assert_status,
    get_json,
    today_iso,
    unique,
)


def _seed_paciente(client: httpx.Client, email: str = "maria@email.com") -> dict:
    pacientes = get_json(client.get("/pacientes"))
    for paciente in pacientes:
        if paciente.get("email") == email:
            return paciente
    raise AssertionError(f"Seed paciente not found for email {email}")


def _seed_medico(client: httpx.Client) -> dict:
    medicos = get_json(client.get("/medicos"))
    if medicos:
        return medicos[0]
    raise AssertionError("No seed medico found")


def _create_consulta(
    client: httpx.Client,
    paciente_id: int,
    medico_id: int,
    **overrides,
) -> dict:
    payload = {
        "paciente_id": paciente_id,
        "medico_id": medico_id,
        "data": today_iso(),
        "horario": "10:15:00",
        "tipo_consulta": unique("Consulta E2E"),
        "convenio": "Particular",
        "valor": 275.50,
        **overrides,
    }
    return get_json(client.post("/consultas", json=payload), 201)


def test_consulta_status_lifecycle(gestor_client: httpx.Client):
    paciente = _seed_paciente(gestor_client)
    medico = _seed_medico(gestor_client)
    consulta = _create_consulta(gestor_client, paciente["id"], medico["id"])

    confirmada = get_json(
        gestor_client.patch(f"/consultas/{consulta['id']}", json={"status": "confirmada"})
    )
    assert confirmada["status"] == "confirmada"

    cancelada = get_json(
        gestor_client.patch(f"/consultas/{consulta['id']}", json={"status": "cancelada"})
    )
    assert cancelada["status"] == "cancelada"


def test_realizada_creates_financeiro_entry(gestor_client: httpx.Client):
    paciente = _seed_paciente(gestor_client)
    medico = _seed_medico(gestor_client)
    consulta = _create_consulta(
        gestor_client,
        paciente["id"],
        medico["id"],
        tipo_consulta=unique("Realizada E2E"),
        valor=321.45,
    )

    realizada = get_json(
        gestor_client.patch(f"/consultas/{consulta['id']}", json={"status": "realizada"})
    )
    assert realizada["status"] == "realizada"

    lancamentos = get_json(gestor_client.get("/financeiro", params={"limit": 500}))
    auto_lancamento = next(
        (item for item in lancamentos if item.get("consulta_id") == consulta["id"]),
        None,
    )
    assert auto_lancamento is not None
    assert auto_lancamento["status"] == "pendente"
    assert Decimal(str(auto_lancamento["valor"])) == Decimal("321.45")


def test_financeiro_manual_entry_update_and_indicators(gestor_client: httpx.Client):
    paciente = _seed_paciente(gestor_client)
    before = get_json(gestor_client.get("/financeiro/indicadores"))
    before_total = Decimal(str(before["total_lancado"]))

    payload = {
        "paciente_id": paciente["id"],
        "data": "2031-02-01",
        "servico": unique("Financeiro E2E"),
        "valor": 199.99,
        "forma_pagamento": "Pix",
        "observacao": "E2E manual",
    }
    created = get_json(gestor_client.post("/financeiro", json=payload), 201)
    assert created["status"] == "pendente"

    paid = get_json(
        gestor_client.patch(
            f"/financeiro/{created['id']}",
            json={"status": "pago", "forma_pagamento": "Dinheiro"},
        )
    )
    assert paid["status"] == "pago"
    assert paid["forma_pagamento"] == "Dinheiro"

    after = get_json(gestor_client.get("/financeiro/indicadores"))
    assert Decimal(str(after["total_lancado"])) >= before_total + Decimal("199.99")


def test_confirming_consulta_creates_audit_log(gestor_client: httpx.Client):
    paciente = _seed_paciente(gestor_client)
    medico = _seed_medico(gestor_client)
    consulta = _create_consulta(gestor_client, paciente["id"], medico["id"])

    assert_status(
        gestor_client.patch(f"/consultas/{consulta['id']}", json={"status": "confirmada"}),
        200,
    )

    logs = get_json(
        gestor_client.get(
            "/admin/log-auditoria",
            params={"modulo": "agenda", "resultado": "sucesso", "limit": 50},
        )
    )
    assert any(str(consulta["id"]) in (log.get("detalhes") or "") for log in logs)
