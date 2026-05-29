from __future__ import annotations

import httpx

from tests_e2e.helpers import (
    assert_status,
    get_json,
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


def _create_prontuario_for_maria(
    medico_client: httpx.Client,
    lookup_client: httpx.Client,
) -> dict:
    paciente = _seed_paciente(lookup_client, "maria@email.com")
    medico = _seed_medico(lookup_client)
    payload = {
        "paciente_id": paciente["id"],
        "medico_id": medico["id"],
        "data": "2031-03-01",
        "cid": unique("Z99")[:12],
        "diagnostico": "Diagnostico E2E com texto suficiente",
        "prescricao": "Prescricao E2E com texto suficiente",
        "retorno_em_dias": 14,
    }
    return get_json(medico_client.post("/prontuarios", json=payload), 201)


def test_medico_creates_updates_and_releases_prontuario(
    gestor_client: httpx.Client,
    medico_client: httpx.Client,
    paciente_client: httpx.Client,
):
    prontuario = _create_prontuario_for_maria(medico_client, gestor_client)
    assert prontuario["laudo_liberado"] is False

    updated = get_json(
        medico_client.patch(
            f"/prontuarios/{prontuario['id']}",
            json={"diagnostico": "Diagnostico atualizado via E2E"},
        )
    )
    assert updated["diagnostico"] == "Diagnostico atualizado via E2E"

    before_release = get_json(paciente_client.get("/portal/laudos"))
    assert all(item["id"] != prontuario["id"] for item in before_release)
    assert_status(paciente_client.get(f"/portal/laudos/{prontuario['id']}/download"), 403)

    released = get_json(medico_client.patch(f"/prontuarios/{prontuario['id']}/liberar-laudo"))
    assert released["laudo_liberado"] is True

    after_release = get_json(paciente_client.get("/portal/laudos"))
    assert any(item["id"] == prontuario["id"] for item in after_release)


def test_patient_only_sees_own_released_laudos(
    gestor_client: httpx.Client,
    medico_client: httpx.Client,
    paciente_client: httpx.Client,
    paciente_joao_client: httpx.Client,
):
    prontuario = _create_prontuario_for_maria(medico_client, gestor_client)
    get_json(medico_client.patch(f"/prontuarios/{prontuario['id']}/liberar-laudo"))

    maria_laudos = get_json(paciente_client.get("/portal/laudos"))
    joao_laudos = get_json(paciente_joao_client.get("/portal/laudos"))

    assert any(item["id"] == prontuario["id"] for item in maria_laudos)
    assert all(item["id"] != prontuario["id"] for item in joao_laudos)


def test_released_laudo_download_is_pdf(
    gestor_client: httpx.Client,
    medico_client: httpx.Client,
    paciente_client: httpx.Client,
):
    prontuario = _create_prontuario_for_maria(medico_client, gestor_client)
    get_json(medico_client.patch(f"/prontuarios/{prontuario['id']}/liberar-laudo"))

    response = paciente_client.get(f"/portal/laudos/{prontuario['id']}/download")
    assert_status(response, 200)
    assert response.headers["content-type"].startswith("application/pdf")
    assert response.content.startswith(b"%PDF")
