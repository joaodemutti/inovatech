from __future__ import annotations

from decimal import Decimal

import httpx
import pytest

from tests_e2e.helpers import (
    assert_status,
    assert_xlsx_response,
    get_json,
    numeric_string,
    unique,
    xlsx_bytes,
)


EXPORT_MODULES = [
    "pacientes",
    "medicos",
    "consultas",
    "prontuarios",
    "financeiro",
    "ponto",
    "usuarios",
    "log-auditoria",
]


def _current_user(client: httpx.Client) -> dict:
    return get_json(client.get("/auth/me"))


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


def _upload_xlsx(client: httpx.Client, module: str, rows: list[dict]) -> httpx.Response:
    payload = xlsx_bytes(rows)
    return client.post(
        f"/excel/import/{module}",
        files={
            "arquivo": (
                f"{module}.xlsx",
                payload,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        },
    )


@pytest.mark.parametrize("module", EXPORT_MODULES)
def test_excel_export_returns_valid_xlsx(gestor_client: httpx.Client, module: str):
    assert_xlsx_response(gestor_client.get(f"/excel/export/{module}"))


def test_excel_import_invalid_columns_returns_validation_error(gestor_client: httpx.Client):
    payload = xlsx_bytes([{"coluna_errada": "valor"}])
    response = gestor_client.post(
        "/excel/import/pacientes",
        files={
            "arquivo": (
                "invalid.xlsx",
                payload,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )
        },
    )
    assert_status(response, 422)


def test_excel_import_pacientes_persists_records(gestor_client: httpx.Client):
    cpf = numeric_string()
    response = _upload_xlsx(
        gestor_client,
        "pacientes",
        [{"nome_completo": unique("Import Paciente"), "cpf": cpf}],
    )
    result = get_json(response)
    assert result["importados"] == 1

    pacientes = get_json(gestor_client.get("/pacientes"))
    assert any(paciente["cpf"] == cpf for paciente in pacientes)


def test_excel_import_medicos_persists_records(gestor_client: httpx.Client):
    crm = f"CRM-IMP-{unique()[-6:]}"
    cpf = numeric_string()
    response = _upload_xlsx(
        gestor_client,
        "medicos",
        [
            {
                "nome_completo": unique("Import Medico"),
                "cpf": cpf,
                "crm": crm,
                "especialidade": "Cardiologia",
            }
        ],
    )
    result = get_json(response)
    assert result["importados"] == 1

    medicos = get_json(gestor_client.get("/medicos"))
    assert any(medico["crm"] == crm for medico in medicos)


def test_excel_import_consultas_persists_records(gestor_client: httpx.Client):
    paciente = _seed_paciente(gestor_client)
    medico = _seed_medico(gestor_client)
    tipo = unique("Import Consulta")
    response = _upload_xlsx(
        gestor_client,
        "consultas",
        [
            {
                "paciente_id": paciente["id"],
                "medico_id": medico["id"],
                "data": "2031-04-01",
                "horario": "10:30:00",
                "tipo_consulta": tipo,
                "valor": "333.30",
            }
        ],
    )
    result = get_json(response)
    assert result["importados"] == 1

    consultas = get_json(gestor_client.get("/consultas", params={"limit": 500}))
    assert any(consulta["tipo_consulta"] == tipo for consulta in consultas)


def test_excel_import_prontuarios_persists_records(gestor_client: httpx.Client):
    paciente = _seed_paciente(gestor_client)
    medico = _seed_medico(gestor_client)
    cid = unique("Y88")[:12]
    response = _upload_xlsx(
        gestor_client,
        "prontuarios",
        [
            {
                "paciente_id": paciente["id"],
                "medico_id": medico["id"],
                "data": "2031-04-02",
                "cid": cid,
                "diagnostico": "Diagnostico importado E2E",
                "prescricao": "Prescricao importada E2E",
            }
        ],
    )
    result = get_json(response)
    assert result["importados"] == 1

    prontuarios = get_json(gestor_client.get("/prontuarios", params={"limit": 500}))
    assert any(prontuario["cid"] == cid for prontuario in prontuarios)


def test_excel_import_financeiro_persists_records(gestor_client: httpx.Client):
    paciente = _seed_paciente(gestor_client)
    servico = unique("Import Financeiro")
    response = _upload_xlsx(
        gestor_client,
        "financeiro",
        [
            {
                "paciente_id": paciente["id"],
                "data": "2031-04-03",
                "servico": servico,
                "valor": "444.40",
            }
        ],
    )
    result = get_json(response)
    assert result["importados"] == 1

    lancamentos = get_json(gestor_client.get("/financeiro", params={"limit": 500}))
    assert any(lancamento["servico"] == servico for lancamento in lancamentos)


def test_excel_import_ponto_persists_records(gestor_client: httpx.Client):
    user = _current_user(gestor_client)
    response = _upload_xlsx(
        gestor_client,
        "ponto",
        [{"usuario_id": user["id"], "data": "2031-04-04"}],
    )
    result = get_json(response)
    assert result["importados"] == 1

    registros = get_json(
        gestor_client.get(
            "/ponto",
            params={"data_inicio": "2031-04-04", "data_fim": "2031-04-04"},
        )
    )
    assert any(registro["usuario_id"] == user["id"] for registro in registros)


def test_excel_import_usuarios_persists_records(gestor_client: httpx.Client):
    login = unique("import_user")
    response = _upload_xlsx(
        gestor_client,
        "usuarios",
        [
            {
                "nome": "Usuario Importado E2E",
                "perfil": "recepcionista",
                "login": login,
                "email": f"{login}@example.test",
            }
        ],
    )
    result = get_json(response)
    assert result["importados"] == 1

    usuarios = get_json(gestor_client.get("/usuarios"))
    assert any(usuario["login"] == login for usuario in usuarios)


def test_ponto_classifications_and_totals(gestor_client: httpx.Client):
    user = _current_user(gestor_client)
    data = "2031-05-05"
    cases = [
        ("normal", {"entrada": "08:00:00", "saida": "16:00:00"}),
        ("atraso", {"entrada": "10:00:00", "saida": "17:00:00"}),
        ("h_extra", {"entrada": "07:00:00", "saida": "18:30:00"}),
        ("falta", {}),
    ]

    created_ids = []
    for expected, times in cases:
        payload = {"usuario_id": user["id"], "data": data, **times}
        created = get_json(gestor_client.post("/ponto", json=payload), 201)
        created_ids.append(created["id"])
        assert created["situacao"] == expected

    registros = get_json(
        gestor_client.get("/ponto", params={"data_inicio": data, "data_fim": data, "limit": 50})
    )
    relevant = [registro for registro in registros if registro["id"] in created_ids]
    assert {registro["situacao"] for registro in relevant} == {
        "normal",
        "atraso",
        "h_extra",
        "falta",
    }

    totais = get_json(
        gestor_client.get("/ponto/totais", params={"data_inicio": data, "data_fim": data})
    )
    assert totais["faltas"] >= 1
    assert totais["atrasos"] >= 1
    assert Decimal(str(totais["horas_extras"])) >= Decimal("1")
    assert totais["normais"] >= 1


def test_backup_creates_audit_log(gestor_client: httpx.Client):
    assert_status(gestor_client.get("/admin/backup"), 200)

    logs = get_json(
        gestor_client.get(
            "/admin/log-auditoria",
            params={"modulo": "admin", "resultado": "sucesso", "limit": 20},
        )
    )
    assert any(log["acao"] == "backup" for log in logs)
