from __future__ import annotations

import httpx

from tests_e2e.helpers import (
    assert_status,
    get_json,
    medico_payload,
    paciente_payload,
)


def _create_paciente(
    client: httpx.Client,
    payload: dict | None = None,
) -> dict:
    return get_json(client.post("/pacientes", json=payload or paciente_payload()), 201)


def _create_medico(
    client: httpx.Client,
    payload: dict | None = None,
) -> dict:
    return get_json(client.post("/medicos", json=payload or medico_payload()), 201)


def test_paciente_create_list_update_and_soft_delete(gestor_client: httpx.Client):
    created = _create_paciente(gestor_client)

    pacientes = get_json(gestor_client.get("/pacientes"))
    assert any(paciente["id"] == created["id"] for paciente in pacientes)

    updated = get_json(
        gestor_client.patch(
            f"/pacientes/{created['id']}",
            json={"telefone": "11000000000", "convenio": "Unimed"},
        )
    )
    assert updated["telefone"] == "11000000000"
    assert updated["convenio"] == "Unimed"

    assert_status(gestor_client.delete(f"/pacientes/{created['id']}"), 204)
    after_delete = get_json(gestor_client.get(f"/pacientes/{created['id']}"))
    assert after_delete["status"] == "inativo"


def test_duplicate_patient_cpf_returns_conflict(gestor_client: httpx.Client):
    payload = paciente_payload(cpf="98765432100")
    _create_paciente(gestor_client, payload)

    duplicate = {**payload, "nome_completo": "Duplicado E2E"}
    assert_status(gestor_client.post("/pacientes", json=duplicate), 409)


def test_medico_create_list_and_update(gestor_client: httpx.Client):
    created = _create_medico(gestor_client)

    medicos = get_json(gestor_client.get("/medicos"))
    assert any(medico["id"] == created["id"] for medico in medicos)

    updated = get_json(
        gestor_client.patch(
            f"/medicos/{created['id']}",
            json={"especialidade": "Cardiologia"},
        )
    )
    assert updated["especialidade"] == "Cardiologia"


def test_duplicate_medico_crm_returns_conflict(gestor_client: httpx.Client):
    payload = medico_payload(crm="CRM-E2E-DUP")
    _create_medico(gestor_client, payload)

    duplicate = {
        **medico_payload(crm=payload["crm"]),
        "cpf": "12312312399",
    }
    assert_status(gestor_client.post("/medicos", json=duplicate), 409)
