from __future__ import annotations

import os
import uuid
from datetime import date
from io import BytesIO
from typing import Any

import httpx
from openpyxl import Workbook


DEFAULT_PASSWORD = os.getenv("E2E_DEFAULT_PASSWORD", "Inovatech@2026")

CREDENTIALS = {
    "gestor": (
        os.getenv("E2E_GESTOR_LOGIN", "roberto"),
        os.getenv("E2E_GESTOR_PASSWORD", DEFAULT_PASSWORD),
    ),
    "recepcionista": (
        os.getenv("E2E_RECEPCIONISTA_LOGIN", "ana"),
        os.getenv("E2E_RECEPCIONISTA_PASSWORD", DEFAULT_PASSWORD),
    ),
    "medico": (
        os.getenv("E2E_MEDICO_LOGIN", "carlos"),
        os.getenv("E2E_MEDICO_PASSWORD", DEFAULT_PASSWORD),
    ),
    "paciente": (
        os.getenv("E2E_PACIENTE_LOGIN", "maria"),
        os.getenv("E2E_PACIENTE_PASSWORD", DEFAULT_PASSWORD),
    ),
    "paciente_joao": (
        os.getenv("E2E_PACIENTE_JOAO_LOGIN", "joao"),
        os.getenv("E2E_PACIENTE_JOAO_PASSWORD", DEFAULT_PASSWORD),
    ),
}


def login(client: httpx.Client, role: str) -> dict[str, Any]:
    login_name, password = CREDENTIALS[role]
    response = client.post("/auth/login", json={"login": login_name, "password": password})
    assert response.status_code == 200, response.text
    assert client.cookies.get("access_token")
    return response.json()


def unique(prefix: str = "e2e") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


def numeric_string(length: int = 11) -> str:
    value = uuid.uuid4().int % (10**length)
    return str(value).zfill(length)


def today_iso() -> str:
    return date.today().isoformat()


def assert_status(response: httpx.Response, status_code: int) -> None:
    assert response.status_code == status_code, response.text


def assert_xlsx_response(response: httpx.Response) -> None:
    assert_status(response, 200)
    assert response.content[:2] == b"PK"
    assert "spreadsheet" in response.headers.get("content-type", "").lower()


def get_json(response: httpx.Response, status_code: int = 200) -> Any:
    assert_status(response, status_code)
    return response.json()


def paciente_payload(prefix: str = "Paciente E2E", cpf: str | None = None) -> dict[str, Any]:
    suffix = unique("paciente")
    return {
        "nome_completo": f"{prefix} {suffix}",
        "cpf": cpf or numeric_string(),
        "telefone": "11999990000",
        "email": f"{suffix}@example.test",
        "data_nascimento": "1991-04-23",
        "convenio": "Particular",
        "endereco": "Rua E2E, 100",
    }


def medico_payload(prefix: str = "Medico E2E", crm: str | None = None) -> dict[str, Any]:
    suffix = unique("medico")
    return {
        "nome_completo": f"{prefix} {suffix}",
        "cpf": numeric_string(),
        "crm": crm or f"CRM-E2E-{suffix[-6:]}",
        "especialidade": "Clinica Geral",
        "telefone": "11988887777",
        "email": f"{suffix}@medico.example.test",
        "data_formatura": "2012-11-30",
    }


def xlsx_bytes(rows: list[dict[str, Any]]) -> bytes:
    workbook = Workbook()
    sheet = workbook.active
    columns = list(rows[0].keys()) if rows else []
    sheet.append(columns)
    for row in rows:
        sheet.append([row.get(column) for column in columns])

    buffer = BytesIO()
    workbook.save(buffer)
    return buffer.getvalue()
