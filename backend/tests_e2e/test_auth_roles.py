from __future__ import annotations

import httpx

from tests_e2e.helpers import assert_status, get_json, login, paciente_payload


def test_login_me_and_logout_flow(public_client: httpx.Client):
    login(public_client, "gestor")

    me = get_json(public_client.get("/auth/me"))
    assert me["perfil"] == "gestor"
    assert me["login"] == "roberto"
    assert "password_hash" not in me

    assert_status(public_client.post("/auth/logout"), 200)
    assert_status(public_client.get("/auth/me"), 401)


def test_invalid_login_returns_401_and_is_audited(
    public_client: httpx.Client,
    gestor_client: httpx.Client,
):
    response = public_client.post(
        "/auth/login",
        json={"login": "e2e.invalid", "password": "wrong"},
    )
    assert_status(response, 401)

    logs = get_json(
        gestor_client.get(
            "/admin/log-auditoria",
            params={"modulo": "auth", "resultado": "falha", "limit": 20},
        )
    )
    assert any("e2e.invalid" in (log.get("detalhes") or "") for log in logs)


def test_protected_route_rejects_unauthenticated_client(public_client: httpx.Client):
    assert_status(public_client.get("/dashboard/indicadores"), 401)


def test_gestor_can_access_admin_finance_and_excel(gestor_client: httpx.Client):
    assert_status(gestor_client.get("/admin/log-auditoria"), 200)
    assert_status(gestor_client.get("/financeiro/indicadores"), 200)
    assert_status(gestor_client.get("/excel/export/pacientes"), 200)


def test_recepcionista_is_limited_to_cadastro_and_agenda(
    recepcionista_client: httpx.Client,
):
    assert_status(recepcionista_client.get("/pacientes"), 200)
    assert_status(
        recepcionista_client.post("/pacientes", json=paciente_payload("Recepcao E2E")),
        201,
    )
    assert_status(recepcionista_client.get("/consultas"), 200)

    assert_status(recepcionista_client.get("/financeiro"), 403)
    assert_status(recepcionista_client.get("/prontuarios"), 403)
    assert_status(recepcionista_client.get("/admin/log-auditoria"), 403)
    assert_status(recepcionista_client.get("/excel/export/pacientes"), 403)


def test_medico_is_limited_to_agenda_and_prontuario(medico_client: httpx.Client):
    assert_status(medico_client.get("/consultas"), 200)
    assert_status(medico_client.get("/prontuarios"), 200)

    assert_status(medico_client.get("/pacientes"), 403)
    assert_status(medico_client.get("/financeiro"), 403)
    assert_status(medico_client.get("/admin/log-auditoria"), 403)


def test_paciente_is_limited_to_portal(paciente_client: httpx.Client):
    assert_status(paciente_client.get("/portal/consultas"), 200)
    assert_status(paciente_client.get("/portal/laudos"), 200)

    assert_status(paciente_client.get("/dashboard/indicadores"), 403)
    assert_status(paciente_client.get("/consultas"), 403)
    assert_status(paciente_client.get("/pacientes"), 403)
    assert_status(paciente_client.get("/financeiro"), 403)

